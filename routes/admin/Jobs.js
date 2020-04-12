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

//Route de récupération des métiers actifs ou non
router.get("/gets/:id_admin", (req, res) => {
    var props = {
        admin: req.params.id_admin
    };

    model.initialize(db);
    model.listJobs(props, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour)
    })
})

//Route pour le basculement du flag d'un métier
router.put("/toggle/:id_admin/:id_job", (req, res) => {
    var props = {
        admin: req.params.id_admin,
        job: req.params.id_job
    };

    model.initialize(db);
    model.toggle(props, (isToggle, message, result) => {
        objetRetour.getEtat = isToggle;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

module.exports = router;