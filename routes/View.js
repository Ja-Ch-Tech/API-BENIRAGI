var express = require('express');
var router = express.Router();

var db = require("../models/db"),
    model = require("../models/View");

//Le modèle de dessin du graphe
router.get('/graphVisit/:id_freelancer', (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour();

    model.initialize(db);
    model.graphForVisitProfileFreelancer(req.params.id_freelancer, (isPaint, message, result) => {
        objetRetour.getEtat = isPaint;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

module.exports = router;