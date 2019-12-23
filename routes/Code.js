var express = require('express');
var router = express.Router();

var db = require("../models/db"),
    model = require("../models/Code");

/* Pour activer le compte d'un user */
router.post('/activation', function (req, res, next) {
    var objetRetour = require("./ObjetRetour").ObjetRetour(),
        obj = {
            "id_user": req.body.id_user,
            "code": parseInt(req.body.code)
        };

    model.initialize(db);
    model.activateAccount(obj, (isActivate, message, result) => {
        objetRetour.getEtat = isActivate;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
});

module.exports = router