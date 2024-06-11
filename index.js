const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/image-upload", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a mongoose schema and model for image data
const ImageSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  path: String,
});

const Image = mongoose.model("Image", ImageSchema);

// Multer setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("image"), (req, res) => {
  const { filename, originalname, path } = req.file;

  const newImage = new Image({
    filename,
    originalname,
    path,
  });

  newImage
    .save()
    .then((image) => {
      res.status(201).json(image);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// Serve uploaded images statically
app.use("/uploads", express.static("uploads"));

app.get("/api/images", (req, res) => {
  Image.find({})
    .then((images) => {
      res.status(200).json(images);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
