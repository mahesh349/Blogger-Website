import adminRoutes from "./admin/index.js";
import usersRoutes from "./users.js";
import guestRoutes from "./guest/index.js";

console.log("in routesindex");
const constructorMethod = (app) => {
  console.log("came in to / route");
  app.get("/", (req, res) => {
    res.render("home");
  });

  /*app.get("/login", (req, res) => {
    console.log("Hi I am in");
    res.render("./login/UserLogin");
  });

  app.get("/register", (req, res) => {
    res.render("./login/UserCreate");
  });*/

  //admin routes
  // TODO: middleware to check if user is actually an admin
  app.use("/", usersRoutes);
  app.use("/guest", guestRoutes);
  app.use("/admin", adminRoutes);

  app.use("*", (req, res) => {
    console.log("came into routesindex error");
    res.render("error", {
      title: "Error",
      code: 404,
      hasError: true,
      error: "page not found",
    });
  });
};

export default constructorMethod;
