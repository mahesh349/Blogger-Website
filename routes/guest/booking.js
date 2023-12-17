import { Router } from "express";
const router = Router();
import { CreateBooking,GetBooking,DeleteBooking,UpdateBooking } from "../../data/booking.js";

router.route("/").get(async (req, res) => {
  try {
    res.render("./guest/guestBooking/booking", {
      title: "guest booking page",
    });
  } catch (e) {}
});


router
  .route("/book")
  .post(async (req, res) => {
    try {
      const AddBookingData = req.body;
      const newBooking = await CreateBooking(
        AddBookingData.FirstNameInput,
        AddBookingData.LastNameInput,
        AddBookingData.EmailIdInput,
        AddBookingData.ContactNumberInput,
        AddBookingData.CheckinDateInput,
        AddBookingData.CheckoutDateInput
      );
      res.render("./guest/guestPayment/payment", {title: "Payment Page"});
    } catch (e) {
      console.error(e); // Log the error
      res.status(500).send('Error occurred: ' + e.message); // Send detailed error message
    }
});

export default router;
