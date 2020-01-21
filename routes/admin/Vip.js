var express = require('express');
var router = express.Router();

var db = require("../../models/db"),
    model = require("../../models/admin/Vip"),
    objetRetour = require("../ObjetRetour").ObjetRetour();

//Route permettant aux admins de validé une requête pour passer VIP
router.post('/respondQuery/:id_admin', (req, res) => {
    var objet = {
        id_admin: req.params.id_admin,
        id_vip: req.body.id_vip,
        response: req.body.response
    };

    model.initialize(db);
    model.respondToQuery(objet, (isOkay, message, result) => {
        objetRetour.getEtat = isOkay;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour)
    })
})

module.exports = router