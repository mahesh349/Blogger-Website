// admin here can add, delete, and see all the photos he want to keep in the gallery page:
// GET all, POST, DELETE
// routes/gallery.js
import express from 'express';
import multer from 'multer';
import { uploadImageToFirebase, deleteImageFromFirebase, saveImageDetailsToMongoDB } from '../../data/gallery.js';

const router = express.Router();
const upload = multer();

router.get("/", async (req, res) => {
  try {
    res.render("./Admin/adminGallery/adminGallery", {
      title: "admin gallery manipulation",
    });
  } catch (e) {}
});

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const downloadURL = await uploadImageToFirebase(req.file);
    const imageData = {
        filename: req.file.originalname,
        url: downloadURL
    }
    const mongoId = await saveImageDetailsToMongoDB(imageData);
    res.json({ message: "Image uploaded successfully", url: downloadURL, mongoId: mongoId,  });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.delete('/delete/:fileName', async (req, res) => {
  try {
    await deleteImageFromFirebase(req.params.fileName);
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;

