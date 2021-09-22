//Import dependencies
require("dotenv").config();
const fs = require("fs").promises;
const multer = require("multer");

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const foldername = file.originalname.toString().split(".");
    await fs.mkdir(
      "./data/" + foldername[0],
      { recursive: true },
      function (err) {
        if (err) {
          console.log(err);
        }
      }
    );
    cb(null, `./data/${foldername[0]}/`);
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
