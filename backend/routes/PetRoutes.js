const router = require("express").Router();
const PetController = require("../controllers/PetController");


//middlewares
const verifyToken = require("../helpers/verify-token");
const { imageUpload } = require("../helpers/image-upload");

//routes
router.post("/create", verifyToken, imageUpload.array("images"), PetController.create);
router.get("/mypets", verifyToken, PetController.getAllUserPets);
router.get("/", PetController.getAll);



module.exports = router