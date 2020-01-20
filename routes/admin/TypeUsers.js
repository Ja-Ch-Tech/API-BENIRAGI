var express = require('express');
var router = express.Router();

var db = require("../../models/db"),
    model = require("../../models/admin/TypeUsers"),
    objetRetour = require("../ObjetRetour").ObjetRetour();

//Pour créer des types, utilisables pour l'admin
router.post('/create', (req, res) => {
    var entity = require("../../models/entities/TypeUsers").TypeUsers();

    entity.intitule = req.body.intitule;
    entity.describe = req.body.describe;
    entity.icon = req.body.icon;
    entity.id_admin = req.body.id_admin;

    model.initialize(db);
    model.create(entity, (isCreated, message, result) => {
        objetRetour.getEtat = isCreated;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

module.exports = router;
