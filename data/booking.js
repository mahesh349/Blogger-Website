// CREATE, DELETE, EDIT, READ
// CREATE: Room Number, booking date, checkin date, checkout date, guest name, guest email, booking status
// Delete: guest name, guest email, room number, checkin date
// READ: name, email, room number
import { ObjectId } from "mongodb";
import { bookings } from "../config/mongoCollections.js";
//import * as helpers from '../helpers.js'
import { BookFirstName, BookLastName, BookEmailId, BookContactNumber} from "../helpers.js";

export const CreateBooking = async(
    firstName,
    lastName,
    emailId,
    contactNumber,
    CheckinDate,
    CheckOutDate,
    )=>{
        const AddBookingsDetails = await bookings();
        if(!firstName || !lastName || !emailId || !contactNumber || !CheckinDate || !CheckOutDate) throw `Error: Please fill all the sections`;
  
        firstName = await BookFirstName(firstName);
        lastName = await BookLastName(lastName);
        emailId = await BookEmailId(emailId);
        contactNumber = await BookContactNumber(contactNumber);
  
        firstName = firstName.trim();
        lastName = lastName.trim();
        emailId = emailId.trim();
        contactNumber = contactNumber.trim();
        CheckinDate = CheckinDate.trim();
        CheckOutDate = CheckOutDate.trim();
  
        firstName = firstName.toLowerCase();
        lastName = lastName.toLowerCase();
        emailId = emailId.toLowerCase();

        const Booking_Current_Date = new Date();
        const BookYear = Booking_Current_Date.getFullYear();
        const BookMonth = Booking_Current_Date.getMonth();
        const BookDay = Booking_Current_Date.getDay();
        const Final_BookDate = `${BookYear}/${BookMonth}/${BookDay}` 

        const GuestBookingDetails = {
            firstName: firstName,
            lastName: lastName,
            emailId: emailId,
            contactNumber: contactNumber,
            BookingDate: Final_BookDate,
            CheckinDate: CheckinDate,
            CheckOutDate: CheckOutDate,
            BookingStatus: false
        };
        const AddBooking = await AddBookingsDetails.insertOne(GuestBookingDetails);
        if(!AddBooking.acknowledged || !AddBooking.insertedId){
            throw `Could not add data`;
        };
        // const GetDataById = AddBooking.insertedId.toString();
        // const CheckBookingById = await GetBooking(GetDataById);
        // return CheckBookingById; 
};

export const GetBooking = async(firstName, emailId) => {
    let GetBookingId = await bookings();
    let GetBookingDetails = await GetBookingId.findOne({firstName: firstName, emailId: emailId});
    if(GetBookingDetails !== true){
        throw `The particular ID Does not exists`;
    }
};

export const DeleteBooking = async(BookId) => {
    let DeleteBooking = await bookings();
    let DeleteBookingData = await DeleteBooking.findOneAndDelete({_id: new ObjectId(BookId)});
    return {...DeleteBookingData, deleted: true};
};

export const UpdateBooking = async(
    firstName,
    lastName,
    emailId,
    contactNumber,
    CheckinDate,
    CheckOutDate,
) => {
    const UpdateBooking = await bookings();
    let BookingData = {
        firstName: firstName,
        lastName: lastName,
        emailId: emailId,
        contactNumber: contactNumber,
        CheckinDate: CheckinDate,
        CheckOutDate: CheckOutDate,
    };
    const UpdateBookingData = await UpdateBooking.findOneAndReplace(
        {_id: new ObjectId()},
        BookingData,
        {returnDocument: `after`}
    );
    if(!UpdateBookingData){
        throw `Update failed could not update data`;
    }
    return UpdateBookingData;
}

// export const getBookingbyEmail = async(emailId) => {
//     let GetBookingId = await bookings();
//     let GetBookingDetailsById = await GetBookingId.findOne({emailId: emailId});
//     if (GetBookingDetailsById === null) return "-1";
//     GetBookingDetailsById._id == GetBookingDetailsById._id.toString();
//     return GetBookingDetailsById;
// };

// export const putCheckInb = async (BookingId) => {
//     let b = await bookings();
//     let c = await b.findOne({ BookingId: BookingId });
//     if (c === null) return "-1";
//     await b.updateOne({ BookingId: BookingId }, { $set: { CheckedIn: true } });
//     return "Updated successfully";
// }

// export const putCheckIne = async (emailId) => {
//     let b = await bookings();
//     let c = await b.findOne({ emailId: emailId });
//     if (c === null) return "-1";
//     await b.updateOne({ emailId: emailId }, { $set: { CheckedIn: true } });
//     return "Updated successfully";
// }

// export const putCheckOutb = async (BookingId) => {
//     let b = await bookings();
//     let c = await b.findOne({ BookingId: BookingId });
//     if (c === null) return "-1";
//     if(c.CheckedIn == true){
//         await b.updateOne({ BookingId: BookingId }, { $set: { CheckedOut: true } });
//     }
//     return "Updated successfully";
// }

// export const putCheckOute = async (emailId) => {
//     let b = await bookings();
//     let c = await b.findOne({ emailId: emailId });
//     if (c === null) return "-1";
//     if(c.CheckedIn == true){
//         await b.updateOne({ emailId: emailId }, { $set: { CheckedOut: true } });
//     }
//     return "Updated successfully";
// }