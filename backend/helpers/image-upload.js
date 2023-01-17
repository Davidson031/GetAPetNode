
const multer = require("multer");
const path = require("path");


//destinação das imagens
const imageStore = multer.diskStorage({
    destination: function(req, file, callback) {

        let folder = "";

        if (req.baseUrl.includes("users")) {
            folder = "users";
        } else if (req.baseUrl.includes("pets")) {
            folder = "pets"
        }

        callback(null, `public/images/${folder}`);

    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + path.extname(file.originalname));
    }
});

const imageUpload = multer({
    storage: imageStore,
    fileFilter(req, file, callback) {

        if (!file.originalname.match(/\.(png|jpg)$/)) {
            return callback(new Error("Por favor envie apenas png ou jpg"));
        }
        callback(undefined, true);
    }
})

module.exports = { imageUpload };