var express = require('express');
var router = express.Router();

var db = require("../models/db"),
    model = require("../models/Favoris");

//Route permettant la définition ou la mise à jour en favoris
router.post('/set', (req, res) => {
    var entity = require("../models/entities/Favoris").Favoris(req.body.id_freelancer, req.body.id_employer),
        objetRetour = require("./ObjetRetour").ObjetRetour();

    model.initialize(db);
    model.set(entity, (isSet, message, result) => {
        objetRetour.getEtat = isSet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

module.exports = router;