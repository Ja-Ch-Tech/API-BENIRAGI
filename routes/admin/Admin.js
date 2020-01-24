var express = require('express');
var router = express.Router();

var db = require("../../models/db"),
    model = require("../../models/admin/Admin"),
    objetRetour = require("../ObjetRetour").ObjetRetour();

//Route pour l'ajout d'un admin
router.post('/add', (req, res) => {
    var entity = require("../../models/entities/admin/Admin").Admin();

    entity.admin = req.body.username;
    entity.password = req.body.password;

    model.initialize(db);
    model.add(entity, (isAdded, message, result) => {
        objetRetour.getEtat = isAdded;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Route pour la connexion de l'administrateur
router.post('/login', (req, res) => {
    var objet = {
        "admin": req.body.username,
        "password": req.body.password
    };

    model.initialize(db);
    model.login(objet, (isLogged, message, result) => {
        objetRetour.getEtat = isLogged;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

module.exports = router;