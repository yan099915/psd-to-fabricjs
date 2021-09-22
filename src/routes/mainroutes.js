// DEPENDENCIES
require("dotenv").config();
const router = require("express").Router();
/* ----------------------- */
const controllers = require("../controllers/maincontrollers");
const middleware = require("../middlewares/mainmiddlewares");
const multer = require("multer");

// USER
router.post("/upload", middleware.single("file"), controllers.maincontroller);
router.get("/search", controllers.search);
module.exports = router;
