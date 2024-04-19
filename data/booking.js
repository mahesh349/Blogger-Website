// CREATE, DELETE, EDIT, READ
// CREATE: Room Number, booking date, checkin date, checkout date, guest name, guest email, booking status
// Delete: guest name, guest email, room number, checkin date
// READ: name, email, room number
import { ObjectId } from "mongodb"
import { bookings } from "../config/mongoCollections.js"
import { rooms } from "../config/mongoCollections.js"
import * as helpers from "../helpers.js"
//import * as helpers from '../helpers.js'
import { BookFirstName, BookLastName, BookEmailId, BookContactNumber } from "../helpers.js"

const changeDateFormat = (dateValue) => {
  const date = new Date(dateValue);
  
 
  date.setDate(date.getDate() + 1);
  
 
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${month}-${day}-${year}`;
};

const changeDateFormatBooking = (dateValue) => {
  const date = new Date(dateValue);
  
 
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${month}-${day}-${year}`;
};

export const isOverlapping = async (bookingDates, checkinDate, checkoutDate) => {
  const newCheckinDate = new Date(checkinDate)
  const newCheckoutDate = new Date(checkoutDate)

  //each booking date
  for (let dateRange of bookingDates) {
    const existingCheckinDate = new Date(dateRange.checkinDate)
    const existingCheckoutDate = new Date(dateRange.checkoutDate)

    if (newCheckinDate <= existingCheckoutDate && newCheckoutDate >= existingCheckinDate) {
      // overlap is found
      return true
    }
  }
  // No overlaps found
  return false
}

// console.log(await isOverlapping([{
//   checkinDate:"04-21-2024",
//   checkoutDate:"04-22-2024"}],"04-19-2024","04-21-2024"))

export const CreateBooking = async (
  firstName,
  lastName,
  emailId,
  contactNumber,
  CheckinDate,
  CheckOutDate,
  roomNumber,
  roomPrice,
  roomType
) => {
  try {
    const AddBookingsDetails = await bookings()
    if (
      !firstName ||
      !lastName ||
      !emailId ||
      !contactNumber ||
      !CheckinDate ||
      !CheckOutDate ||
      !roomNumber ||
      !roomPrice ||
      !roomType
    )
      throw `Error: Please fill all the sections`

    const checkInDate = new Date(CheckinDate)
    const checkOutDate = new Date(CheckOutDate)

    const differenceInMs = checkOutDate - checkInDate

    const millisecondsInDay = 1000 * 60 * 60 * 24
    const numberOfDays = Math.floor(differenceInMs / millisecondsInDay)

    let totalPrice = Number(roomPrice) * numberOfDays
    let taxPrice = totalPrice * 0.2
    let serviceFee = totalPrice * 0.1
    totalPrice = parseFloat(totalPrice.toFixed(2))
    taxPrice = parseFloat(taxPrice.toFixed(2))
    serviceFee = parseFloat(serviceFee.toFixed(2))
    let finalPrice = totalPrice + taxPrice + serviceFee
    finalPrice = parseFloat(finalPrice.toFixed(2))

    //firstName = await BookFirstName(firstName);
    //lastName = await BookLastName(lastName);
    const firstNameErr = {
      empty: "First Name cannot be Empty",
      invalid: "First Name is invalid and cannot be less than 2 letters",
    }
    const lastNameErr = {
      empty: "Last Name cannot be Empty",
      invalid: "Last Name is invalid and cannot be less than 2 letters",
    }
    const firstAcctName = await helpers.validateString(firstName, 2, 25, firstNameErr)
    const lastAcctName = await helpers.validateString(lastName, 2, 25, lastNameErr)
    emailId = await BookEmailId(emailId)
    //contactNumber = await BookContactNumber(contactNumber);

    firstName = firstName.trim()
    lastName = lastName.trim()
    emailId = emailId.trim()
    contactNumber = contactNumber.trim()
    const validatePhoneNumber = await helpers.validatePhone(contactNumber)
    CheckinDate = CheckinDate.trim()
    CheckOutDate = CheckOutDate.trim()
    const validateRoomNumber = await helpers.checkRoomNumber(roomNumber)
    const validateRoomPrice = await helpers.checkRoomPrice(roomPrice)
    const validateRoomType = await helpers.checkRoomType(roomType)

    //firstName = firstName.toLowerCase();
    //lastName = lastName.toLowerCase();
    emailId = emailId.toLowerCase()

    const Booking_Current_Date = new Date()
    const Final_BookDate = changeDateFormatBooking(Booking_Current_Date) //mm-dd-yyyy
    const checkIn_FinalDate = changeDateFormat(checkInDate)
    const checkOut_FinalDate = changeDateFormat(checkOutDate)
  
    const GuestBookingDetails = {
      firstName: firstAcctName,
      lastName: lastAcctName,
      emailId: emailId,
      contactNumber: validatePhoneNumber,
      BookingDate: Final_BookDate,
      CheckinDate: checkIn_FinalDate,
      CheckOutDate: checkOut_FinalDate,
      BookingStatus: false,
      cleanStatus: false,
      roomNumber: validateRoomNumber,
      roomType: validateRoomType,
      roomPrice: validateRoomPrice,
      numberOfDays: numberOfDays,
      totalPrice: totalPrice,
      taxPrice: taxPrice,
      serviceFee: serviceFee,
      finalPrice: finalPrice,
    }
    const roomCollection = await rooms()
    let bookedDates = {
      checkinDate: checkIn_FinalDate,
      checkoutDate: checkOut_FinalDate,
    }

    const roomFound = await roomCollection.findOne({ roomNumber: roomNumber })
  
    let overlapFound =await isOverlapping(roomFound.bookingDates, checkIn_FinalDate, checkOut_FinalDate)
    console.log("overlapFound ="+ overlapFound)
    if (overlapFound) {  
      throw "Room Occupied"
    }
    const AddBooking = await AddBookingsDetails.insertOne(GuestBookingDetails)
    if (!AddBooking.acknowledged || !AddBooking.insertedId) {
      throw `Could not add Booking data`
    }
    const bookingId = AddBooking.insertedId;
 
    bookedDates.bookingId = bookingId;
    const updateResult = await roomCollection.updateOne(
      { roomNumber: roomNumber },
      {
        $push: {
          bookingDates: bookedDates,
        },
      }
    )

    if (!updateResult) {
      throw " error in updating booking dates in room"
    }
    return AddBooking
  } catch (e) {
    throw `Error: ${e}`
  }
}

export const GetBooking = async (firstName, emailId) => {
  try {
    helpers.stringValidation(firstName)
    helpers.stringValidation(emailId)
    let GetBookingId = await bookings()
    let GetBookingDetails = await GetBookingId.findOne({
      firstName: firstName,
      emailId: emailId,
    })
    if (GetBookingDetails !== true) {
      throw `The Booking ID Does not exists`
    }
  } catch (e) {
    throw `Error: ${e}`
  }
}

export const getBookingByIdAndTrue = async (bookingId) => {
  try {
    bookingId = await helpers.checkId(bookingId)
    let bookingCollection = await bookings()
    let UpdateEventData = {
      BookingStatus: true,
    }
    const updatedBooking = await bookingCollection.findOneAndUpdate(
      { _id: new ObjectId(bookingId) },
      { $set: UpdateEventData },
      { returnDocument: "after" }
    )
    if (!updatedBooking) {
      throw `update failed could not update data`
    }
    return updatedBooking
  } catch (e) {
    throw `Error: ${e}`
  }
}
export const GetAllBooking = async (firstName, emailId) => {
  try {
    helpers.stringValidation(firstName)
    helpers.stringValidation(emailId)
    let GetAllBookingId = await bookings()
    let GetAllBookingDetails = await GetAllBookingId.find({
      firstName: firstName,
      emailId: emailId,
    }).toArray()
    return GetAllBookingDetails
  } catch (e) {
    throw `Error: ${e}`
  }
}

export const ShowAllBooking = async () => {
  try {
    let GetAllBookingId = await bookings()
    let GetAllBookingDetails = await GetAllBookingId.find({}).toArray()
    return GetAllBookingDetails
  } catch (e) {
    throw `Error: ${e}`
  }
}

export const DeleteBooking = async (BookId) => {
  try {
    BookId = helpers.checkId(BookId)
    let DeleteBooking = await bookings()
    let DeleteBookingData = await DeleteBooking.findOneAndDelete({
      _id: new ObjectId(BookId),
    })
    return { ...DeleteBookingData, deleted: true }
  } catch (e) {
    throw `Error: ${e}`
  }
}

export const UpdateBooking = async (
  id,
  firstName,
  lastName,
  emailId,
  contactNumber,
  CheckinDate,
  CheckOutDate
) => {
  if (!firstName || !lastName || !emailId || !contactNumber || !CheckinDate || !CheckOutDate)
    throw `Error: Please fill all the sections`

  const checkInDate = new Date(CheckinDate)
  const checkOutDate = new Date(CheckOutDate)

  const differenceInMs = checkOutDate - checkInDate

  const millisecondsInDay = 1000 * 60 * 60 * 24
  const numberOfDays = Math.floor(differenceInMs / millisecondsInDay)

  const roomPrice = Number(roomPrice) * numberOfDays

  firstName = await BookFirstName(firstName)
  lastName = await BookLastName(lastName)
  emailId = await BookEmailId(emailId)
  //contactNumber = await BookContactNumber(contactNumber);

  firstName = firstName.trim()
  lastName = lastName.trim()
  emailId = emailId.trim()
  contactNumber = contactNumber.trim()
  CheckinDate = CheckinDate.trim()
  CheckOutDate = CheckOutDate.trim()

  firstName = firstName.toLowerCase()
  lastName = lastName.toLowerCase()
  emailId = emailId.toLowerCase()

  const UpdateBooking = await bookings()

  let BookingData = {
    firstName: firstName,
    lastName: lastName,
    emailId: emailId,
    contactNumber: contactNumber,
    CheckinDate: CheckinDate,
    CheckOutDate: CheckOutDate,
    roomPrice: roomPrice,
  }
  const UpdateBookingData = await UpdateBooking.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: BookingData },
    { returnOriginal: false }
  )
  if (!UpdateBookingData) {
    throw `Update failed could not update data`
  }
  return UpdateBookingData
}

export const cardPaymnetOnSuccess = async (bookingID, personName) => {
  try {
    let getBookindDatas = await bookings()
    const [firstName, lastName] = personName.split(" ")
    const bookingIDDetails = await helpers.checkId(bookingID, "Booking Id")
    const updateResult = await getBookindDatas.updateOne(
      {
        _id: new ObjectId(bookingIDDetails),
      },
      {
        $set: { paymentSuccess: true },
      }
    )
    if (updateResult.matchedCount === 0) {
      throw `No Matcing booking found or updateFailed`
    }
    return updateResult
  } catch (e) {
    throw `Error: ${e}`
  }
}

export const fetchBookindData = async (bookingID) => {
  try {
    let getBookindDatas = await bookings()
    const objectBookingID = await helpers.checkId(bookingID, "Booking Id")
    const fetchBookingRecords = await getBookindDatas.findOne({
      _id: new ObjectId(objectBookingID),
    })
    if (!fetchBookingRecords) {
      throw `No booking found for the given Id: ${objectBookingID}`
    }
    return fetchBookingRecords
  } catch (e) {
    throw e
  }
}