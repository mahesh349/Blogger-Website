// CREATE, DELETE, EDIT, READ
// CREATE: Room Number, booking date, checkin date, checkout date, guest name, guest email, booking status
// Delete: guest name, guest email, room number, checkin date
// READ: name, email, room number
import { ObjectId } from "mongodb";
import { bookings } from "../config/mongoCollections.js";
import * as helpers from '../helpers.js'

export const CreateBooking = async(
    BookingId,
    firstName,
    lastName,
    emailId,
    contactNumber,
    BookingDate,
    CheckinDate,
    CheckOutDate,
    BookingStatus
    )=>{
        const AddBookingsDetails = await bookings();

        if(!firstName || !lastName || !emailId || !contactNumber || !BookingDate || !CheckinDate || !CheckOutDate) throw `Error: Please fill all the sections`;
  
        firstName = await helpers.BookFirstName(firstName);
        lastName = await helpers.BookLastName(lastName);
        emailId = await helpers.BookEmailId(emailId);
        contactNumber = await helpers.BookContactNumber(contactNumber);
  
        firstName = firstName.trim();
        lastName = lastName.trim();
        emailId = emailId.trim();
        contactNumber = contactNumber.trim();
        BookingDate = BookingDate.trim();
        CheckinDate = CheckinDate.trim();
        CheckOutDate = CheckOutDate.trim();
  
        firstName = firstName.toLowerCase();
        lastName = lastName.toLowerCase();
        emailId = emailId.toLowerCase();
        const GuestBookingDetails = {
            BookingId: BookingId,
            firstName: firstName,
            lastName: lastName,
            emailId: emailId,
            contactNumber: contactNumber,
            BookingDate: BookingDate,
            CheckinDate: CheckinDate,
            CheckOutDate: CheckOutDate,
            BookingStatus: BookingStatus
        };
        const AddBooking = await AddBookingsDetails.insertOne(GuestBookingDetails);
        if(!AddBooking.acknowledged || !AddBooking.insertedId){
            throw `Could not add data`;
        };
        const GetDataById = AddBookingsDetails.insertedId.toString();
        const CheckBookingById = await getBooking(GetDataById);
        return CheckBookingById; 
};

export const getBooking = async(BookId) => {
    let GetBookingId = await bookings();
    let GetBookingDetailsById = await GetBookingId.findOne({_id: new ObjectId(BookId)});
    if (GetBookingDetailsById === null) throw `No event with that id`;
    GetBookingDetailsById._id == GetBookingDetailsById._id.toString();
    return GetBookingDetailsById;
};

export const DeleteBooking = async(BookId) => {
    let DeleteBooking = await bookings();
    let DeleteBookingData = await DeleteBooking.findOneAndDelete({_id: new ObjectId(BookId)});
    return {...DeleteBookingData, deleted: true};
};

export const update = async(
    BookingId,
    accountId,
    lastName,
    emailId,
    contactNumber,
    BookingDate,
    CheckinDate,
    CheckOutDate,
    BookingStatus
) => {
    const UpdateBooking = await bookings();
    let BookingData = {
        accountId: accountId,
        lastName: lastName,
        emailId: emailId,
        contactNumber: contactNumber,
        BookingDate: BookingDate,
        CheckinDate: CheckinDate,
        CheckOutDate: CheckOutDate,
        BookingStatus: BookingStatus
    };
    if(!BookingId) throw `Your must provide a ID`;
    if(!ObjectId.isValid(BookingId)) throw `Invalid Room ID`;
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