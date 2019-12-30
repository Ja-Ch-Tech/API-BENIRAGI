var express = require('express');
var router = express.Router();

var db = require("../models/db"),
    model = require("../models/Town");

//Création des villes
router.post('/create', (req, res) => {
    var entity = require("../models/entities/Town").Town(),
        objetRetour = require("./ObjetRetour").ObjetRetour();

    entity.name = req.body.nom;

    model.initialize(db);
    model.create(entity, (isCreated, message, result) => {
        objetRetour.getEtat = isCreated;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Récupération des villes
router.get('/gets', (req, res) => {
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