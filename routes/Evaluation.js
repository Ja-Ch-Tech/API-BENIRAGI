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

module.exports = router;