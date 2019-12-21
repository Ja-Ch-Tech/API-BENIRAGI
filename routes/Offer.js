var express = require('express');
var router = express.Router();

var db = require("../models/db"),
    model = require("../models/Offer");

//Faire une offre
router.post('/make', (req, res) => {
    var entity = require("../models/entities/Offer").Offer(),
        objetRetour = require("./ObjetRetour").ObjetRetour();

    entity.id_employer = req.body.id_employer;
    entity.id_freelancer = req.body.id_freelancer;
    entity.message = req.body.message;

    model.makeOffer(entity, (isMaking, message, result) => {
        objetRetour.getEtat = isMaking;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
});

//Attachement d'un fichier genre contrat pour l'offre
router.post('/attachment/:id_offer', (req, res) => {
    var entity = require("../models/entities/Offer").Attachments(),
        objetRetour = require("./ObjetRetour").ObjetRetour();

    entity.id_offer = req.params.id_offer;
    entity.id_docs = req.body.id_docs;

    model.initialize(db);
    model.setAttachment(entity, (isSet, message, result) => {
        objetRetour.getEtat = isSet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

module.exports = router;