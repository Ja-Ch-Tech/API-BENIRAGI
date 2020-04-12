var express = require('express');
var router = express.Router();

var db = require("../../models/db"),
    model = require("../../models/admin/Town"),
    objetRetour = require("../ObjetRetour").ObjetRetour();

//Route de récupération des villes actifs ou non
router.get("/gets/:id_admin", (req, res) => {
    var props = {
        admin: req.params.id_admin
    };

    model.initialize(db);
    model.listTown(props, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour)
    })
})

module.exports = router;