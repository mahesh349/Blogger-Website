// CREATE, GET, DELETE, GET ALL
// CREATE: name, email (do not display), text box input, rating from 0 - 10
// GET: name, email
// GET ALL: show ratings for guests
// Delete: ID
import { feedbacks } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import * as help from "../helpers.js";

const exportedMethods = {
  async create(guestId, roomType, guestName, rating, comment) {
    //validation
    console.log(rating);
    help.checkId(guestId);
    help.stringValidation(roomType);
    help.stringValidation(guestName);
    help.validRating(rating);
    help.stringValidation(comment);

    //trimming
    roomType = roomType.trim();
    guestName = guestName.trim();
    comment = comment.trim();

    if (comment.length > 500)
      throw "ERROR : comment cannot be more than 500 characters ";

    //object creation
    const newFeedback = {
      guestId: guestId,
      roomType: roomType,
      guestName: guestName,
      rating: rating,
      comment: comment,
    };

    const feedbackCollection = await feedbacks();
    const newInsertInformation = await feedbackCollection.insertOne(
      newFeedback
    );
    const newId = newInsertInformation.insertedId;
    return "Thank you for your feedback!";
  },

  async delete(feedbackIds) {
    if (feedbackIds.length == 0)
      console.log("No feedbacks available, please add more");
    for (let id of feedbackIds) {
      help.checkId(id);
      const feedbackCollection = await feedbacks();
      const deletionInfo = await feedbackCollection.findOneAndDelete({
        _id: new ObjectId(id),
      });
      if (deletionInfo === null) throw `feedback id not found`;

      let object = { ...deletionInfo };
      let feedbackName = object.guestName;
      console.log({ guestName, deleted: true });
    }
  },

  async getAll() {
    const feedbackCollection = await feedbacks();
    let allFeedback = await feedbackCollection
      .find(
        {},
        {
          projection: {
            _id: 1,
            guestName: 1,
            roomType: 1,
            rating: 1,
            comment: 1,
          },
        }
      )
      .toArray();

    return allFeedback;
  },
};

export default exportedMethods;
