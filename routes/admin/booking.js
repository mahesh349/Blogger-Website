// admin will see all the bookings in a list or he can add details for filtered bookings he need to click a button where the booking will change from pending to confirmed
// GET, POST
// GET all, GET, POST, EDIT
import { Router } from "express";
import * as BookingFunctions from '../../data/booking.js';
const router = Router();

router.get("/", async (req, res) => {
  try {
    res.render("./Admin/adminBooking/BookingOptions", {
      title: "admin booking manipulation",
    });
  } catch (e) {}
});

// router.route('/booking').get(async (req,res) => {
//   console.log("in the /booking route");
//   return res.render("./admin/adminBooking/adminBooking");
// });

router
  .route('/adminBooking')
  .get(async(req,res) => {
    try{
      return res.render("./Admin/adminBooking/adminBooking");
    }catch(e){
      return res.status(404).render('error',{title:'Error',error: e});
    }
  });

// router
//   .route('/adminBooking')
//   .post(async (req, res) => {
//     try {
//       const AddBookingData = req.body;
//       const newBooking = await BookingFunctions.CreateBooking(
//         AddBookingData.FirstNameInput,
//         AddBookingData.LastNameInput,
//         AddBookingData.EmailIdInput,
//         AddBookingData.ContactNumberInput,
//         AddBookingData.CheckinDateInput,
//         AddBookingData.CheckoutDateInput
//       );
//       res.render("./Admin/adminBooking/BookingOptions", {title: "Payment Page"});
//     } catch (e) {
//       console.error(e); // Log the error
//       res.status(500).send('Error occurred: ' + e.message); // Send detailed error message
//     }
//   });

router
  .route("/AdminBookingGetAll")
  .get(async(req,res) => {
    try{
      return res.render("./Admin/adminBooking/AdminBookingGetAll");
    }catch(e){
      return res.status(404).render('error',{title:'Error',error: e});
    }
  });

// router
//   .route("/AdminBookingGetAll")
//   .get(async(req,res) => {
//     try {
//       const AddBookingData = req.body;
//       const newBooking = await BookingFunctions.GetBooking(
//         AddBookingData.FirstNameInput,
//         AddBookingData.EmailIdInput
//       );
//       res.render("./Admin/adminBooking/BookingOptions");
//     } catch (e) {
//       console.error(e); // Log the error
//       res.status(500).send('Error occurred: ' + e.message); // Send detailed error message
//     }
//   });

export default router;
