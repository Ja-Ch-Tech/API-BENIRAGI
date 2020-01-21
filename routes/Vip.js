var express = require('express');
var router = express.Router();

var db = require("../models/db"),
    model = require("../models/Vip");

//Route permettant la demande de passer son compte en VIP
router.post('/become', (req, res) => {
    var entity = require("../models/entities/Vip").VIP(req.body.id_freelancer),
        objetRetour = require("./ObjetRetour").ObjetRetour();

    model.initialize(db);
    model.becomeVIP(entity, (isSend, message, result) => {
        objetRetour.getEtat = isSend;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Route pour afficher les VIP de la plateforme
router.get('/:limit', (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour(),
        limit = req.params.limit ? parseInt(req.params.limit) : null;

    model.initialize(db);
    model.getVIP(limit, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

module.exports = router;