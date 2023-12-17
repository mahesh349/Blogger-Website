// CREATE, GET, GET ALL, EDIT, DELETE
// Create room : room number, room type, room price, availability, room photos link, room description from input will be acepteed
// edit room: we can edit all the details
// delete: we need to add the room number and type to delete the room from the database
// GET or GET ALL: get will show the details of the rooom after the guest selects a specific room number
// and get all will show all the room deails and its photos in one page


import { ObjectId } from "mongodb";
import { rooms } from "../config/mongoCollections.js";
import * as helpers from '../helpers.js'
import * as connection from '../config/mongoConnection.js'

export const createRoom = async (
    roomNumber,
    roomType,
    roomPrice,
    availability,
    roomPhotos,
    roomDescription

) => {
    helpers.validateRoomData({
        roomNumber,
        roomType,
        roomPrice,
        availability,
        roomPhotos,
        roomDescription
    });

    const newRoom = {
        roomNumber,
        roomType,
        roomPrice,
        availability,
        roomPhotos,
        roomDescription
    }

    const roomCollection = await rooms();
    const existingRoom = await roomCollection.findOne({ roomNumber });
    if (existingRoom) {
        throw new Error("Room number already exists");
    }

    const addNewRooms = await roomCollection.insertOne(newRoom);
    if (addNewRooms.insertedCount === 0) throw new Error("Room add failed");

    const id = addNewRooms.insertedId;
    const addedNewRoom = await roomCollection.findOne({ _id: id });
    if (!addedNewRoom) throw new Error('No room id found');

    return addedNewRoom;


}

export const getAllRooms = async () => {
    try {
        const roomCollection = await rooms();
        let allRooms = await roomCollection.find({}).toArray();
        return allRooms;
    } catch (e) {
        throw e;
    }
}

export const getRoomByNumber = async (roomNumber) => {
    try {
        helpers.validateRoomNumber(roomNumber);
        const roomCollection = await rooms();
        let room = await roomCollection.findOne({ roomNumber: roomNumber});

        if (!room) throw new Error(`This number: ${roomNumber} has no room`);

        return room;

    } catch (e) {
        throw e;
    }
}

export const deleteRoom = async (roomNumber) => {
    helpers.validateRoomNumber(roomNumber);
    const roomCollection = await rooms();
    const deleteResult = await roomCollection.deleteOne({
        roomNumber: roomNumber
    });

    if (deleteResult.deletedCount === 0) {
        throw new Error("Number and type is not exist")
    } else {
        return roomNumber;
    }
}

export const updateRoom = async (
    originalRoomNumber,
    newRoomNumber,
    roomType,
    roomPrice,
    availability,
    roomPhotos,
    roomDescription
) => {
    helpers.validateRoomNumber(originalRoomNumber);
    helpers.validateRoomData({
        roomNumber: newRoomNumber,
        roomType,
        roomPrice,
        availability,
        roomPhotos,
        roomDescription
    });

    const roomCollection = await rooms();

    const updatedRoom = {
        roomNumber: newRoomNumber,
        roomType,
        roomPrice,
        availability,
        roomPhotos,
        roomDescription
    };

    const updateResult = await roomCollection.updateOne(
        { roomNumber: originalRoomNumber },
        { $set: updatedRoom }
    )

    if (updateResult.modifiedCount === 0) {
        throw new Error("No room found")
    }

    const newRoom = await roomCollection.findOne({ roomNumber: newRoomNumber});
    return newRoom;
}

export const runApp = async () => {
    const db = await connection.dbConnection();
    // await db.dropDatabase;
    try {
        // const room1 = await createRoom(
        //     103,
        //     'single',
        //     120.00,
        //     true,
        //     [
        //         "http://example.com/photos/101-1.jpg",
        //         "http://example.com/photos/101-2.jpg"
        //     ],
        //     "New Room 1"
        // )
        // const allRooms = await getAllRooms()
        // const room2 = await deleteRoom(101)
        //

        const newRoom = await updateRoom(
            102,
            102,
            'double',
            157.00,
            true,
            ["https://firebasestorage.googleapis.com/v0/b/hotel-management-eceff.appspot.com/o/images%2Fmessaging.jpeg?alt=media&token=5e36cb50-cc8f-40ec-bb38-25b221c33ee9"],
            'A spacious double room.'
        );

        console.log(newRoom)

    } catch (e) {
        console.error(e.message)
    } finally {
        //Finish connection
        await connection.closeConnection();
        console.log('Done!');
    }

}

// runApp();



