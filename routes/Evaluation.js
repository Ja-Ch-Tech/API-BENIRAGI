var express = require('express');
var router = express.Router();

var db = require("../models/db"),
    model = require("../models/Evaluation");

//Pour evaluer un freelancer
router.post('/', (req, res) => {
    var entity = require("../models/entities/Evaluation").Evaluation(),
        objetRetour = require("./ObjetRetour").ObjetRetour();

    entity.id_employer = req.body.id_employer;
    entity.id_freelancer = req.body.id_freelancer;
    entity.note = parseInt(req.body.note);
    entity.message = req.body.message;

    model.initialize(db);
    model.evaluate(entity, (isEvaluate, message, result) => {
        objetRetour.getEtat = isEvaluate;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Récupération des feedbacks qu'un freelancer a réçu
router.get('/getFeedBacks/:id_freelancer', (req, res) =>  {
    var objetRetour = require("./ObjetRetour").ObjetRetour(),
        objet = {
            "_id": req.params.id_freelancer
        };

    model.initialize(db);
    model.getFeedBacks(objet, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

module.exports = router;