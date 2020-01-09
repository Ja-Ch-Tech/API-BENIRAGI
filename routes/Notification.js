var express = require('express');
var router = express.Router();

var db = require("../models/db"),
    model = require("../models/Notification");


//Récupération des notification de l'utilisateur
router.get('/getAll/:id_user/:limit', (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour(),
        limit = req.params.limit && parseInt(req.params.limit) ? parseInt(req.params.limit) : null;

    model.initialize(db);
    model.getOfferForFreelancer(req.params.id_user, limit, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
    
})

//Récupération des new messages des offres
router.get('/getNewMessageNotRead/:id_user/:limit', (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour();

    model.initialize(db);
    model.getNewMessageNotRead(req.params.id_user, parseInt(req.params.limit), (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

module.exports = router;