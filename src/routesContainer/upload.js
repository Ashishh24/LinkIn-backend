const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");

const uploadRouter = express.Router();
const upload = multer({ dest: "uploads/" });

// Configure AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

uploadRouter.post("/upload/dp", upload.single("image"), (req, res) => {
  const fileContent = fs.readFileSync(req.file.path);

  const params = {
    Bucket: process.env.S3_BUCKET_NAME_DP,
    Key: Date.now() + path.extname(req.file.originalname), // unique filename
    Body: fileContent,
    ContentType: req.file.mimetype,
    ACL: "public-read", // make it accessible via URL
  };

  s3.upload(params, (err, data) => {
    fs.unlinkSync(req.file.path); // delete local temp file
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ imageUrl: data.Location }); // return S3 file URL
  });
});

uploadRouter.post("/upload/post", upload.single("image"), (req, res) => {
  const fileContent = fs.readFileSync(req.file.path);

  const params = {
    Bucket: process.env.S3_BUCKET_NAME_POST,
    Key: Date.now() + path.extname(req.file.originalname), // unique filename
    Body: fileContent,
    ContentType: req.file.mimetype,
    ACL: "public-read", // make it accessible via URL
  };

  s3.upload(params, (err, data) => {
    // console.log(req.file);
    fs.unlinkSync(req.file.path); // delete local temp file

    let type = "file";
    if (req.file.mimetype.startsWith("image")) type = "image";
    if (req.file.mimetype.startsWith("video")) type = "video";

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ url: data.Location, type });
  });
});

module.exports = uploadRouter;
