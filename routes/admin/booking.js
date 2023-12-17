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
      return res.render("./Admin/adminBooking/adminBooking",{title:'Admin Booking'});
    }catch(e){
      return res.status(404).render('error',{title:'Error',error: e});
    }
  });

router
  .route('/adminBooking')
  .post(async (req, res) => {
    try {
      const AddBookingData = req.body;
      const newBooking = await BookingFunctions.CreateBooking(
        AddBookingData.FirstNameInput,
        AddBookingData.LastNameInput,
        AddBookingData.EmailIdInput,
        AddBookingData.ContactNumberInput,
        AddBookingData.CheckinDateInput,
        AddBookingData.CheckoutDateInput
      );
      res.render("./success", {title: "Task Success",content:"Guest booking was successful"});
    } catch (e) {
      console.error(e); // Log the error
      res.status(500).send('Error occurred: ' + e.message); // Send detailed error message
    }
  });

router
  .route("/AdminBookingGetAll")
  .get(async(req,res) => {
    try{
      return res.render("./Admin/adminBooking/AdminBookingGetAll",{title:"Admin Booking"});
    }catch(e){
      return res.status(404).render('error',{title:'Error',error: e});
    }
  });

router
  .route("/search.html")
  .post(async(req,res) => {
    console.log("In get all routes");
    try {
      const AddBookingData = req.body;
      console.log(AddBookingData,'routes');
      let newBooking = [];
      newBooking = await BookingFunctions.GetAllBooking(
        AddBookingData.firstName,
        AddBookingData.email
      );
      if(newBooking.length === 0){
        res.render('./partials/searched-bookings', {layout: null, sampleResult: false});
        return;
      }
      res.render('./partials/searched-bookings', {layout: null, sampleResult: newBooking});
    } catch (e) {
      console.error(e); // Log the error
      res.status(500).send('Error occurred: ' + e.message); // Send detailed error message
    }
  });


router
.route("/AdminShowAllBooking")
.get(async(req,res) => {
  try{
    const AllData = await BookingFunctions.ShowAllBooking();
    return res.render('./Admin/adminBooking/AdminShowAllBooking', {sampleResult: AllData,title:"Admin Show All Booking"});
  }catch(e){
    return res.status(404).render('error',{title:'Error',error: e});
  }
});


router
  .route("/book/:id")
  .put(async (req, res) => {
    try {
      console.log('in update');
      const bookingId = req.params.id;
      console.log(bookingId,'id');
     const booking =BookingFunctions.getBookingByIdAndTrue(bookingId);
     return res.json({success:true})
    } catch (e) {
      console.error(e); // Log the error
      res.status(500).send('Error occurred: ' + e.message); // Send detailed error message
    }
})

router
  .route("/deleteBooking/:id")
  .delete(async (req, res) => {
    try {
      console.log(req.params.id , 'iddd');
      let deleteStatus = await BookingFunctions.DeleteBooking(
        req.params.id
      );
      if(deleteStatus.deleted === true ){

        res.status(200).json({ success: true, message: 'Booking deleted' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting booking' });
    }
})
export default router;