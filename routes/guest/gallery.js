import { Router } from "express";
import { GetAllFromMongoDB } from "../../data/gallery.js";
const router = Router();

router.get("/", async (req, res) => {
  try {

    let images = await GetAllFromMongoDB();
    res.render("./guest/guestGallery/gallery", {
      title: "guest Gallary page",link: images
    });
  } catch (e) {}
});



export default router;