var express = require('express');
var router = express.Router();

var db = require("../models/db"),
    model = require("../models/Skills");

router.post('/autoComplete', (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour(),
        objet = {
            "id_freelancer": req.body.id_freelancer,
            "name": req.body.name
        };

    model.initialize(db);
    model.autoComplete(objet, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

module.exports = router;