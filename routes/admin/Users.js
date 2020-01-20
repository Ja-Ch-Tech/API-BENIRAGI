var express = require('express');
var router = express.Router();

var db = require("../../models/db"),
    model = require("../../models/admin/Users"),
    admin = require("../../models/admin/Admin"),
    objetRetour = require("../ObjetRetour").ObjetRetour();

//Route récupérant la listedes utilisateurs classées par type
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

//Route permettant d'activer ou désactiver un utilisateur
router.get('/toggle/:id_admin/:id_user', (req, res) => {
    var objet = {
        "id_user": req.params.id_user,
        "id_admin": req.params.id_admin,
    };

    model.initialize(db);
    model.toggleUser(objet, (isToggle, message, result) => {
        objetRetour.getEtat = isToggle;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Route permettant de récupérer les détails d'un user
router.get('/details/:id_admin/:id_user', (req, res) => {
    admin.isAdmin(req.params.id_admin, (isTrue, message, result) => {
        if (isTrue) {
            var objet = {
                "id_user": req.params.id_user,
                "id_viewer": req.params.id_admin
            };

            model.initialize(db);
            model.getInfosForAdmin(objet, (isGet, message, result) => {
                objetRetour.getEtat = isGet;
                objetRetour.getMessage = message;
                objetRetour.getObjet = result;

                res.status(200).send(objetRetour);
            })
        } else {
            res.status(200).send({getEtat: isTrue, getMessage: message})
        }
    })
})

module.exports = router;