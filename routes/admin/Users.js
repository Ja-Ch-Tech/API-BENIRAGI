var express = require('express');
var router = express.Router();

var db = require("../../models/db"),
    model = require("../../models/admin/Users"),
    objetRetour = require("../ObjetRetour").ObjetRetour();

router.get('/listUsers/:id_admin', (req, res) => {
    var objet = {
        "id_admin": req.params.id_admin
    };

    model.initialize(db);
    model.listUsers(objet, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour)
    })
})

module.exports = router;