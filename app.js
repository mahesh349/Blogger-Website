import express from "express";
const app = express();
import session from "express-session";
import configRoutes from "./routes/RoutesIndex.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import exphbs from "express-handlebars";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const staticDir = express.static(__dirname + "/public");

app.use("/public", staticDir);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: 'AuthState',
    secret: "secret session",
    resave: false,
    saveUninitialized: false,
    cookie:{maxAge: 30*60*1000}
    //cookie: { secure: false },
  })
);


// /* MIDDLE WARE FUNCTIONS */
// app.use('/',async(req,res,next) => {
//   if(req.url === '/'){
//     if(req.session.user){
//         if(req.session.user.role === "admin"){
//             res.redirect('/admin/Dashboard');
//         }else if(req.session.user.role === "user"){
//             res.redirect('/guest/Homepage');
//         }
//     }else{
//         res.redirect('/home');
//     }
// }else{
//     next();
// }
// });
/* MIDDLEWARE START */




/* MIDDLEWARE END */


app.engine("handlebars", exphbs.engine({ defaultLayout: "main",
helpers:{eq:(v1,v2)=>v1===v2,
  isSelected:function(code,phonePrefix){
    return code === phonePrefix ?'selected ="selected"':'';
  }} }));
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
