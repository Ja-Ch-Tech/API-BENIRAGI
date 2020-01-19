var express = require('express');
var router = express.Router();

var db = require("../../models/db"),
    model = require("../../models/admin/Admin");

//Route pour l'ajout d'un admin
router.post('/add', (req, res) => {
    var entity = require("../../models/entities/admin/Admin").Admin(),
        objetRetour = require("../ObjetRetour").ObjetRetour();

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

module.exports = router;