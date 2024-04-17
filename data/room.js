// CREATE, GET, GET ALL, EDIT, DELETE
// Create room : room number, room type, room price, availability, room photos link, room description from input will be acepteed
// edit room: we can edit all the details
// delete: we need to add the room number and type to delete the room from the database
// GET or GET ALL: get will show the details of the rooom after the guest selects a specific room number
// and get all will show all the room deails and its photos in one page

import { ObjectId } from "mongodb"
import { rooms } from "../config/mongoCollections.js"
import { photos } from "../config/mongoCollections.js"
import * as helpers from "../helpers.js"
import * as connection from "../config/mongoConnection.js"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import storage from "../config/firebaseConfig.js"

const changeDateFormatBooking = (dateValue) => {
  const date = new Date(dateValue);
  
 
  date.setDate(date.getDate() );
  
 
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${month}-${day}-${year}`;
};

//function to check if a room is occupied or not using its bookingDates
export const roomAvailable = (bookingDates, today) => {
  
  const todayDate = new Date(today);

  
  for (const dateRange of bookingDates) {
    
    const existingCheckinDate = new Date(dateRange.checkinDate);
    const existingCheckoutDate = new Date(dateRange.checkoutDate);

   
    if (todayDate >= existingCheckinDate && todayDate < existingCheckoutDate) {
    
      return true;
    }
  }


  return false;
};


//function to find if a booking is overlapping or not
export const validBooking = async (bookingDates, checkinDate, checkoutDate) => {
  const newCheckinDate = new Date(checkinDate)
  const newCheckoutDate = new Date(checkoutDate)

  //each booking date
  for (let dateRange of bookingDates) {
    const existingCheckinDate = new Date(dateRange.checkinDate)
    const existingCheckoutDate = new Date(dateRange.checkoutDate)

    if (newCheckinDate < existingCheckoutDate && newCheckoutDate > existingCheckinDate) {
      // overlap is found
      return true
    }
  }

  // No overlaps found
  return false
}

export const findRoomNumber =  async (checkinDate,checkoutDate,roomType) =>{
  const roomsCollection = await rooms();
  const roomsOfType =  await roomsCollection.find({ roomType }).toArray();
  
 
  for (const room of roomsOfType) {
    const { roomNumber, bookingDates } = room;

      const isRoomFree = await validBooking(bookingDates, checkinDate, checkoutDate);

      if (!isRoomFree) {
     
       
        return roomNumber;
      }
    }
      
        throw "No available room found for the specified dates and room type."
      
}


export const createRoom = async (
  roomNumber,
  roomType,
  roomPrice,
  availability,
  roomDescription,
  cleanStatus
) => {
  helpers.validateRoomData({
    roomNumber,
    roomType,
    roomPrice,
    availability,
    roomDescription,
    cleanStatus,
  })
  const photoCollection = await photos()
  const photosCursor = await photoCollection.find({ roomType: roomType })
  const photoDocuments = await photosCursor.toArray()

  let roomPhotos = []

  if (photoDocuments.length > 0) {
    roomPhotos = photoDocuments.map((photo) => photo.url)
  }

  const newRoom = {
    roomNumber,
    roomType,
    roomPrice,
    availability,
    occupied: false,
    roomPhotos,
    roomDescription,
    cleanStatus,
    bookingDates: [],
  }

  const roomCollection = await rooms()
  const existingRoom = await roomCollection.findOne({ roomNumber })
  if (existingRoom) {
    throw new Error("Room number already exists")
  }

  const addNewRooms = await roomCollection.insertOne(newRoom)
  if (addNewRooms.insertedCount === 0) throw new Error("Room add failed")

  const id = addNewRooms.insertedId
  const addedNewRoom = await roomCollection.findOne({ _id: id })
  if (!addedNewRoom) throw new Error("No room id found")

  return addedNewRoom
}

export const getAllRooms = async () => {
  try {
   
    const roomCollection = await rooms();
    const allRooms = await roomCollection.find({}).toArray();
    const currentDate = changeDateFormatBooking(new Date());
    console.log("currentDate =" + currentDate)
    for (const room of allRooms) {
      
      const overlapFound = roomAvailable(room.bookingDates, currentDate );
       
      if (overlapFound) {
        await roomCollection.updateOne(
          { _id: room._id },
          { $set: { occupied: true } }
        );
        console.log("room occupied set to true")
      } else {
 
        await roomCollection.updateOne(
          { _id: room._id },
          { $set: { occupied: false } }
        );
        console.log("room occupied set to false")
      }
    }
    return allRooms;
  } catch (e) {
    throw e;
  }
};

export const getRoomByNumber = async (roomNumber) => {
  try {
    helpers.validateRoomNumber(roomNumber)
    const roomCollection = await rooms()
    let room = await roomCollection.findOne({ roomNumber: roomNumber })

    if (!room) throw new Error(`This number: ${roomNumber} has no room`)

    return room
  } catch (e) {
    throw e
  }
}

export const deleteRoom = async (roomNumber) => {
  helpers.validateRoomNumber(roomNumber)
  const roomCollection = await rooms()
  const deleteResult = await roomCollection.deleteOne({
    roomNumber: roomNumber,
  })

  if (deleteResult.deletedCount === 0) {
    throw new Error("Number and type is not exist")
  } else {
    return roomNumber
  }
}

export const updateRoom = async (
  originalRoomNumber,
  newRoomNumber,
  roomType,
  roomPrice,
  availability,
  roomDescription
) => {
  helpers.validateRoomNumber(originalRoomNumber)
  helpers.validateRoomData({
    roomNumber: newRoomNumber,
    roomType,
    roomPrice,
    availability,
    roomDescription,
    cleanStatus,
  })

  const photoCollection = await photos()
  const photosCursor = await photoCollection.find({ roomType: roomType })
  const photoDocuments = await photosCursor.toArray()

  if (photoDocuments.length === 0) {
    throw new Error(`No photos found for room type: ${roomType}`)
  }

  const roomPhotos = photoDocuments.map((photo) => photo.url)

  const roomCollection = await rooms()

  const updatedRoom = {
    roomNumber: newRoomNumber,
    roomType,
    roomPrice,
    availability,
    roomDescription,
    cleanStatus,
  }

  const updateResult = await roomCollection.updateOne(
    { roomNumber: originalRoomNumber },
    { $set: updatedRoom }
  )

  if (updateResult.modifiedCount === 0) {
    throw new Error("No room found or No changes")
  }

  const newRoom = await roomCollection.findOne({ roomNumber: newRoomNumber })
  return newRoom
}

export const cleanRoom = async (roomNumber) => {
  helpers.validateRoomNumber(roomNumber)
  const roomCollection = await rooms()
  let room = await roomCollection.findOne({ roomNumber: roomNumber })

  if (!room) throw new Error(`This number: ${roomNumber} has no room`)
  room.cleanStatus = true

  await roomCollection.updateOne({ roomNumber: roomNumber }, { $set: { cleanStatus: true } })
}

export const dirtyRoom = async (roomNumber) => {
  helpers.validateRoomNumber(roomNumber)
  const roomCollection = await rooms()
  let room = await roomCollection.findOne({ roomNumber: roomNumber })

  if (!room) throw new Error(`This number: ${roomNumber} has no room`)
  room.cleanStatus = false

  await roomCollection.updateOne({ roomNumber: roomNumber }, { $set: { cleanStatus: false } })
}

export const roomNumberToId = async (roomNumber) => {
  helpers.validateRoomNumber(roomNumber)
  const roomCollection = await rooms()
  let room = await roomCollection.findOne({ roomNumber: roomNumber })

  if (!room) throw new Error(`This number: ${roomNumber} has no room`)

  return room._id
}

export const getAllPhotos = async () => {
  try {
    const photoCollection = await photos()
    let allPhotos = await photoCollection.find({}).toArray()
    return allPhotos
  } catch (e) {
    throw e
  }
}

export const createPhotos = async (roomType, url) => {
  const photoCollection = await photos()

  const existingPhoto = await photoCollection.findOne({ roomType: roomType })
  if (existingPhoto) {
    throw new Error(`A photo with roomType '${roomType}' already exists.`)
  }

  const newPhoto = {
    roomType: roomType,
    url: url,
  }

  const result = await photoCollection.insertOne(newPhoto)

  if (result.acknowledged && result.insertedId) {
    return await photoCollection.findOne({ _id: result.insertedId })
  } else {
    throw new Error("Failed to insert new photo")
  }
}

export const uploadImageToFirebase = async (file) => {
  const storageRef = ref(storage, `images/${file.originalname}`)
  const snapshot = await uploadBytes(storageRef, file.buffer)
  const downloadURL = await getDownloadURL(snapshot.ref)
  return downloadURL
}

export const savePhoto = async (roomType, url) => {
  const photoCollection = await photos()
  const roomCollection = await rooms()
  let roomUpdateResult

  const existingPhoto = await photoCollection.findOne({ roomType: roomType })
  if (existingPhoto) {
    const updateResult = await photoCollection.updateOne({ roomType: roomType }, { $set: { url: url } })
  } else {
    const newPhoto = {
      roomType: roomType,
      url: url,
    }
    const insertResult = await photoCollection.insertOne(newPhoto)
  }
  try {
    roomUpdateResult = await roomCollection.updateMany(
      { roomType: roomType },
      { $set: { roomPhotos: [url] } }
    )
  } catch (error) {
    console.error("Error updating rooms collection:", error)
    throw error
  }
}

export const runApp = async () => {
  const db = await connection.dbConnection()
  // await db.dropDatabase;
  try {
    const markRoom = await dirtyRoom(1001)

    // const newRoom = await createRoom(
    //     106,
    //     'double',
    //     157.00,
    //     true,
    //     'A spacious double room.',
    //     true
    // );
    //
    // console.log(newRoom)

    // console.log(newRoom)

    // const result = await averageRating("single");
    // console.log(result)

    // const photo1 = await createPhotos(
    //     "single",
    //     "https://firebasestorage.googleapis.com/v0/b/hotel-management-eceff.appspot.com/o/images%2Fsingle.jpg?alt=media&token=43ffeb30-7766-434e-8af0-b457d7c6f8aa"
    // );
    // const photo2 = await createPhotos(
    //     "double",
    //     "https://firebasestorage.googleapis.com/v0/b/hotel-management-eceff.appspot.com/o/images%2Fdouble.jpg?alt=media&token=c2a38310-dc60-4d21-9398-8fa53fee2373"
    // );
    // const photo3 = await createPhotos(
    //     "suite",
    //     ""
    // );
    // console.log(photo1)
    // console.log(photo2)
    // console.log(photo3)
  } catch (e) {
    console.error(e.message)
  } finally {
    //Finish connection
    await connection.closeConnection()
  }
}

console.log("roomNumber = " + await findRoomNumber("04-16-2024","04-19-2024","double"))