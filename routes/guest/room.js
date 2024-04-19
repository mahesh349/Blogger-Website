import { Router } from "express";
import * as room from "../../data/room.js";
const router = Router();

router
    .route('/')
    .get(async (req, res) => {
      try {
        const roomDetails = await room.getAllRooms();
        res.status(200).render("./guest/guestRoom/roomTypes", {
          rooms: roomDetails,
          title: "Room Details",
          message: req.query.message
        });
      } catch (e) {
        res.status(500).render('error', {
          title: 'Error',
          errorMessage: e.message
        });
      }
    });
    router
    .route('/findingRoom')
    .get(async (req, res) => {
      try {
        const roomDetails = await room.getAllRooms();
        res.status(200).render("./guest/guestRoom/findingRoom", {
          roomType: req.body.roomType,
          CheckinDateInput: CheckinDateInput,
          CheckoutDateInput: CheckoutDateInput,
          roomNumber: roomNumber,
          title: "Room Details",
          message: req.query.message
        });
      } catch (e) {
        res.status(500).render('error', {
          title: 'Error',
          errorMessage: e.message
        });
      }
    })
    .post(async (req, res) => {
        try {
            let {CheckinDateInput, CheckoutDateInput, roomType} = req.body;
            console.log(CheckinDateInput);
            console.log(CheckoutDateInput);
            console.log(roomType);
            const roomNumber = await room.findRoomNumber(CheckinDateInput, CheckoutDateInput, roomType);
            const roomId = await room.roomNumberToId(roomNumber);
            console.log(roomNumber);
            res.render('./guest/guestBooking/booking', { room: roomId, title: "RoomBooking", roomNumber, roomType, roomPrice: req.body.roomPrice, CheckinDate: CheckinDateInput, CheckoutDate: CheckoutDateInput });
        } catch (e) {
          res.render('./guest/guestRoom/noRoomFound',{roomType: req.body.roomType});
        }
    });


    router
    .route('/booking/:roomNumber')
    .post(async (req, res) => {
        try {
          console.log("in /booking/:roomNumber")
            const roomNumber = parseInt(req.params.roomNumber, 10);
            const roomId = await room.roomNumberToId(roomNumber);
            res.render('./guest/guestBooking/booking', { room: roomId,title:"RoomBooking", roomNumber: req.body.roomNumber, roomType: req.body.roomType, roomPrice: req.body.roomPrice});
        } catch (e) {
            res.render('./guest/guestRoom/noRoomFound');
        }
    });

  
  

export default router;