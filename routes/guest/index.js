import { Router } from "express";
import accountRoutes from "./account.js";
import bookingRoutes from "./booking.js";
import feedbackRoutes from "./feedback.js";
import galleryRoutes from "./gallery.js";
import roomRoutes from "./room.js";

const router = Router();

router.get("/", async (req, res) => {
  if(!req.session.user){
      return res.redirect('/login');
  }
  try {
    res.render("../views/guest/Homepage", {title: "Welcome to Guest Page",userId:req.session.user.id});
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});



router.use("/account", accountRoutes);
router.use("/booking", bookingRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/gallery", galleryRoutes);
router.use("/room", roomRoutes);

export default router;