var express = require('express');
var router = express.Router();

var db = require("../models/db"),
    model = require("../models/Jobs");

router.get("/get/:limit", (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour();

    model.initialize(db);
    model.getJobs(limit, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

module.exports = router;