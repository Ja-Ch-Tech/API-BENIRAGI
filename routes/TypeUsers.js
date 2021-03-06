var express = require('express');
var router = express.Router();

var model = require("../models/TypeUsers");
var db = require("../models/db");

//Récupération de type des users
router.get('/getAll', (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour();

    model.initialize(db);
    model.getAll((isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

module.exports = router;