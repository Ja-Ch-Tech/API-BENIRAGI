var express = require('express');
var router = express.Router();

var db = require("../../models/db"),
    model = require("../../models/admin/Jobs"),
    objetRetour = require("../ObjetRetour").ObjetRetour();

//Création des métier
router.post('/create', (req, res) => {
    var entity = require("../../models/entities/Jobs").Jobs();
    
    entity.name = req.body.nom;
    entity.icon = req.body.icon;
    entity.describe = req.body.describe;
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