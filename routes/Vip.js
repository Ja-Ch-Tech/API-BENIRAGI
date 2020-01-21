var express = require('express');
var router = express.Router();

var db = require("../models/db"),
    model = require("../models/Vip");

//Route permettant la demande de passer son compte en VIP
router.post('/become', (req, res) => {
    var entity = require("../models/entities/Vip").VIP(req.body.id_freelancer, parseInt(req.body.duration) ? parseInt(req.body.duration) : 1),
        objetRetour = require("./ObjetRetour").ObjetRetour();

    model.initialize(db);
    model.becomeVIP(entity, (isSend, message, result) => {
        objetRetour.getEtat = isSend;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

module.exports = router;