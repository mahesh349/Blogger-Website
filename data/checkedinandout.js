import { ObjectId } from "mongodb";
import { bookings } from "../config/mongoCollections.js";
import * as helpers from '../helpers.js'


export const getBookingbyEmail = async (emailId) => {
    try{
        emailId = await helpers.validateEmail(emailId)
        let CheckBooking = await bookings();
        let GetAllCheckin = await CheckBooking.find({ emailId:emailId }).toArray();
        if (GetAllCheckin === null){
            throw `No Data Found For Checkin Please Try Again`;
        }
        return GetAllCheckin;
    }catch(e){
        throw `Error: ${e}`;
    }
};

export const putCheckIne = async (emailId) => {
    try{
        let AddCheckin = await bookings();
        let GetCheckinData = await AddCheckin.findOne({_id: new ObjectId(emailId)});
        if (GetCheckinData === null){
            throw `No Data Found For Checkin Please Try Again`;
        }
        await AddCheckin.updateOne({_id: new ObjectId(emailId)}, { $set: { CheckedIn: true } });
        return "Updated successfully";
    }catch(e){
        throw `Error: ${e}`;
    }
}

export const clean = async (emailId) => {
    try{
        let GetCleanStatusData = await bookings();
        let CleanedRoomData = await GetCleanStatusData.findOne({_id: new ObjectId(emailId)});
        if (CleanedRoomData === null){
            throw `No Data Found For Checkin Please Try Again`;
        }
        await GetCleanStatusData.updateOne({_id: new ObjectId(emailId)}, { $set: { cleanStatus: true } });
        return "Cleaned";
    }catch(e){
        throw `Error: ${e}`;
    }
}

export const checkout = async (emailId) => {
    try{
        let GetCheckoutData = await bookings();
        let UpdateCheckOut = await GetCheckoutData.findOne({_id: new ObjectId(emailId)});
        if (UpdateCheckOut === null){
            throw `No Data Found For Checkin Please Try Again`;
        }
        if(c.CheckedIn == true){
            await GetCheckoutData.updateOne({_id: new ObjectId(emailId)}, { $set: { CheckedOut: true, cleanStatus: false, CheckedIn: false } });
        }
        return "Updated successfully";
    }catch(e){
        throw `Error: ${e}`;
    }
}

export const makeBooking = async (emailId) => {
    try{
        let ChangeisCheckedIn = await bookings();
        let UpdateisCheckedIn = await ChangeisCheckedIn.findOne({_id: new ObjectId(emailId)});
        if (UpdateisCheckedIn === null) {
            throw `No Data Found For Checkin Please Try Again`;
        }
        let UpdateBooking = await ChangeisCheckedIn.updateOne({ _id: new ObjectId(emailId) }, { $set: { isCheckedIn: true } });
        return UpdateBooking
    }catch(e){
        throw `Error: ${e}`;
    }
}