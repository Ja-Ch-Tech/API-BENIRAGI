var express = require('express');
var router = express.Router();

var db = require("../models/db"),
    model = require("../models/Jobs");

router.get("/get/:limit", (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour(),
        limit = req.params.limit && parseInt(req.params.limit) ? parseInt(req.params.limit) : null;

    model.initialize(db);
    model.getJobs(limit, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Permet une search assez intelligente
router.post('/search', (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour();

    model.initialize(db);
    model.searchJob(req.body.value, (isFound, message, result) => {
        objetRetour.getEtat = isFound;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

module.exports = router;