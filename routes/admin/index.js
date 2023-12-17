// import all JS files into Index.js
// account, booking, feedback, gallery, room
import { Router } from "express";
import accountRoutes from "./account.js";
import bookingRoutes from "./booking.js";
import feedbackRoutes from "./feedback.js";
import galleryRoutes from "./gallery.js";
import roomRoutes from "./room.js";
// import CheckInRoutes from "./checkInForm.js";
// import CheckOutRoutes from "./checkOutForm.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    res.render("../views/admin/dashboard", {
      title: "Welcome to Admin Dashboard",
    });
  } catch (e) {}
});
router.use("/account", accountRoutes);
router.use("/booking", bookingRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/gallery", galleryRoutes);
router.use("/room", roomRoutes);
// router.use("/checkin", CheckInRoutes);
// router.use("/checkout", CheckOutRoutes);

export default router;
