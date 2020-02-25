var express = require('express');
var router = express.Router();
var aws = require("aws-sdk");
var multer = require("multer");
var multerS3 = require('multer-s3');
var db = require("../models/db");

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});


aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: 'us-east-2'
});

var s3 = new aws.S3();

/*var filefilter = (req, file, cb) => {
    if (file.mineType === "image/jpeg" || file.mineType === "image/png") {
        cb(null, true)
    } else {
        cb(new Error("Invalide mine-type"), false)
    }
}*/

var upload = multer({
    //fileFilter: filefilter,
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: 'TESTING_METADATA_FRDRCPETER' });
        },
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + "_" + file.originalname)
        }
    })
})

const singleUpload = upload.single("file-s3");

//Upload Image
router.post('/file-upload', (req, res) => {

    singleUpload(req, res, (err) => {

        if (!err) {
            var model = require("../models/Media"),
                entity = require("../models/entities/Media").Media(),
                objetRetour = require("./ObjetRetour").ObjetRetour();

            entity.path = req.file.location;
            entity.size = req.file.size;
            //entity.for = req.body.for.toLowerCase();

            model.initialize(db);
            model.create(entity, (isCreated, message, result) => {
                objetRetour.getEtat = isCreated;
                objetRetour.getMessage = message;
                objetRetour.getObjet = result;

                res.status(200).send(objetRetour);
            })
        } else {
            res.status(202).send({ getEtat: false, getMessage: "Upload was not finished !" })
        }

    })
})


module.exports = router;
