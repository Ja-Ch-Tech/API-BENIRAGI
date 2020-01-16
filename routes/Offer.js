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

    model.initialize(db);
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

//Pour l'envoie d'un message
router.post('/message/send', (req, res) => {
    var entity = require("../models/entities/Offer").Message(),
        objetRetour = require("./ObjetRetour").ObjetRetour();

    entity.id_offer = req.body.id_offer;
    entity.id_sender = req.body.id_sender;
    entity.message = req.body.message && req.body.message.trim(" ") ? req.body.message : null;
    
    model.initialize(db);
    model.sendingMessage(entity, (isSend, message, result) => {
        objetRetour.getEtat = isSend;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour)
    })
})

//Pour récupérer les conversations d'un user
router.get('/getMessages/:id_user', (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour();

    model.initialize(db);
    model.getAllMessagesForDifferentOffer(req.params.id_user, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Route permettant des récupérer les freelancers qui sont parmi mes offres
router.get('/getFreelancersForOffer/:id_employer', (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour();

    model.initialize(db);
    model.gets(req.params.id_employer, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour)
    })
})

//Bloquer ou rélancer la conversation
router.post('/toggle/:id_offer/:id_resiler', (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour(),
        objet = {
            "id": req.params.id_offer,
            "id_resiler": req.params.id_resiler
        };

    model.initialize(db);
    model.toggleOffer(objet, (onToggle, message, result) => {
        objetRetour.getEtat = onToggle;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour)
    })
})

module.exports = router;