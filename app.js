import express from "express";
import amqp from "amqplib";
import rateLimit from "express-rate-limit";
import session from "express-session";
import configRoutes from "./routes/RoutesIndex.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import exphbs from "express-handlebars";
import { EventEmitter } from 'events';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = express.static(__dirname + "/public");


//rabbitMQ constants
const queueName = 'booking_queue';
const processDelay = 3000; // 3 second in milliseconds for processing each request
const queueRateLimit = 10000; // 10 seconds in milliseconds for processing each message from the queue
//total ~13 seconds between processing each request in the queue


//express rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, //time window before requests refresh
  max: 3,  //number of req per IP in time window
  message: "Too many requests from this IP, please try again later."
})

const app = express();
app.use("/public", staticDir);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "AuthState",
    secret: "secret session",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 },
    //cookie: { secure: false },
  })
);
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    helpers: {
      eq: (v1, v2) => v1 === v2,
      isSelected: function (code, phonePrefix) {
        return code === phonePrefix ? 'selected ="selected"' : "";
      },
    },
  })
);
app.set("view engine", "handlebars");



//RabbitMQ connection and return the channel
async function connectRabbitMQ(){
  try {

    //connection
    const connection = await amqp.connect('amqp://localhost');

    //new channel creation
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName,{
      durable:false,
    });
    console.log("Connected to RabbitMQ , queue ready for use.");
    return channel;
    
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
}

// Publish requests
async function publishToQueue(channel, request) {
  const message = JSON.stringify(request);
  channel.sendToQueue(queueName, Buffer.from(message));
}


//to wait for req to be consumed before executing booking function
const eventEmitter = new EventEmitter();

//consumer
async function consumeFromQueue(channel) {
  while (true) {
      const msg = await channel.get(queueName, { noAck: false });

      if (msg) {
          const request = JSON.parse(msg.content.toString());
          console.log('Processing request:', request);

          await new Promise(resolve => setTimeout(resolve, processDelay));
          
          // Acknowledge message
          channel.ack(msg);

          // Emit event to notify that the request has been consumed
          eventEmitter.emit('requestConsumed', request);

          await new Promise(resolve => setTimeout(resolve, queueRateLimit));
      } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
      }
  }
}





//Middlewares
//if user is admin, never let them see login and register
app.use("/login", (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.role === "admin") {
      return res.redirect("/admin");
    }
  }
  next();
});

app.use("/register", (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.role === "admin") {
      return res.redirect("/admin");
    }
  }
  next();
});

//if user is staff, never let them see login and register
app.use("/login", (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.role === "staff") {
      return res.redirect("/staff");
    }
  }
  next();
});

app.use("/register", (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.role === "staff") {
      return res.redirect("/staff");
    }
  }
  next();
});

//if user is guest, never let them see login and register
app.use("/login", (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.role === "user") {
      return res.redirect("/guest");
    }
  }
  next();
});

app.use("/register", (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.role === "user") {
      return res.redirect("/guest");
    }
  }
  next();
});

//if you are not an admin send to homescreen
app.use("/admin", (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.role != "admin") {
      console.log("you are not a admin! redirecting to home");
      return res.redirect("/");
    }
  }
  next();
});
//if you are not a staff send to homescreen
app.use("/staff", (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.role != "staff") {
      console.log("you are not a staff! redirecting to home");
      return res.redirect("/");
    }
  }
  next();
});

//if you are not a guest send to homescreen
app.use("/guest", (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.role != "user") {
      console.log("you are not a guest! redirecting to home");
      return res.redirect("/");
    }
  }
  next();
});

//if trying to access guest,admin or staff unauthenticated - send back to login
app.use("/admin", (req, res, next) => {
  if (!req.session.user) {
    console.log("you are not an admin! redirecting to login");
    return res.redirect("/login");
  }
  next();
});

app.use("/staff", (req, res, next) => {
  if (!req.session.user) {
    console.log("you are not a staff! redirecting to login");
    return res.redirect("/login");
  }
  next();
});

app.use("/guest", (req, res, next) => {
  if (!req.session.user) {
    console.log("you are not a guest! redirecting to login");
    return res.redirect("/login");
  }
  next();
});

//middleware to log all requests
app.use("/", (req, res, next) => {
  if (req.originalUrl === "/favicon.ico") {
    return next();
  }

  if (req.originalUrl.startsWith("/public")) {
    return next();
  }

  console.log(
    `[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} (${
      req.session.user ? "Authenticated User" : "Non-Authenticated User"
    })`
  );

  next();
});

app.use("/logout", (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  next();
});


//applying middleware to implement rate-limiter and queue to /guest/booking/book/:roomNumber
app.use("/guest/booking/book/:roomNumber", limiter, async (req, res, next) => {
  console.log("In booking_room middleware");
  const request = req.body;

  // Publish the request to the queue
  await publishToQueue(channel, request);
  console.log('Request received and added to queue');

  // Listen for 'requestConsumed'
  eventEmitter.once('requestConsumed', (consumedRequest) => {
      // Check if the consumed request matches the current request
      if (consumedRequest.id === request.id) {
          console.log('Request has been consumed');
          // proceed to the booking route
          next(); 
      }
  });

 
});



configRoutes(app);

const channel = await connectRabbitMQ();

consumeFromQueue(channel);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
