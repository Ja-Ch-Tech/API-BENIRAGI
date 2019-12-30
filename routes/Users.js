var express = require('express');
var router = express.Router();

var db = require("../models/db"),
    model = require("../models/Users");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//Inscription
router.post('/register', (req, res, next) => {
    var entity = require("../models/entities/Users").Users(),
        objetRetour = require("./ObjetRetour").ObjetRetour();

    entity.email = req.body.email;
    entity.password = req.body.password;
    entity.id_type = req.body.id_type;

    model.initialize(db);
    model.register(entity, (isCreated, message, result) => {
        objetRetour.getEtat = isCreated;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour)
    })
})

//Connexion
router.post('/login', (req, res, next) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour(),
        obj = {
            "email": req.body.email,
            "password": req.body.password
        };

    model.initialize(db);
    model.login(obj, (isLogged, message, result) => {
        objetRetour.getEtat = isLogged;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Pour la définition de la disponibilité
router.post('/toggleVisibility/:id_user', (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour();

    model.initialize(db);
    model.toggleVisibility(req.params.id_user, (isToggle, message, result) => {
        objetRetour.getEtat = isToggle;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Récupère le nombre d'utilisateur par type de user
router.get('/NumberUserByType', (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour();

    model.initialize(db);
    model.getNumberForTypeUser((isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Définir l'identité du user
router.post('/setIdentity', (req, res) => {
    var entity = require("../models/entities/Users").Identity(req.body.id_user),
        objetRetour = require("./ObjetRetour").ObjetRetour();

    entity.name = req.body.nom;
    entity.postName = req.body.postnom;
    entity.lastName = req.body.prenom;
    entity.phoneNumber = req.body.numero;

    model.initialize(db);
    model.setIdentity(entity, (isSet, message, result) => {
        objetRetour.getEtat = isSet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Définir le job du user
router.post('/setJob', (req, res) => {
    var entity = require("../models/entities/Users").Job(req.body.id_user),
        objetRetour = require("./ObjetRetour").ObjetRetour();

    entity.id_job = req.body.id_job;

    model.initialize(db);
    model.setJobs(entity, (isSet, message, result) => {
        objetRetour.getEtat = isSet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Pour récupérer les détails d'un utilisateur
router.get('/details/:id_user', (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour(),
        objet = {
            "id_user": req.params.id_user
        };

    model.initialize(db);
    model.getInfos(objet, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Définir des skills pour ce job
router.post('/setSkills', (req, res) => {
    var entity = require("../models/entities/Users").Skills(req.body.id_user),
        objetRetour = require("./ObjetRetour").ObjetRetour();

    entity.skills = JSON.parse(req.body.skills);

    model.initialize(db);
    model.setSkills(entity, (isSet, message, result) => {
        objetRetour.getEtat = isSet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Pour définir la photo de profile
router.post('/setAvatar', (req, res) => {
    var entity = require("../models/entities/Users").Avatar(req.body.id_user),
        objetRetour = require("./ObjetRetour");

    entity.id_avatar = req.body.id_media;

    model.setAvatar(entity, (isSet, message, result) => {
        objetRetour.getEtat = isSet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Définition de la ville
router.post('/setTown', (req, res) => {
    var entity = require("../models/entities/Users").Town(req.body.id_user),
        objetRetour = require("./ObjetRetour").ObjetRetour();

    entity.id_town = req.body.id_town;

    model.initialize(db);
    model.setTown(entity, (isSet, message, result) => {
        objetRetour.getEtat = isSet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Définition de la pièce jointe
router.post('/setAttachment', (req, res) => {
    var entity = require("../models/entities/Users").Attachment(req.body.id_user),
        objetRetour = require("./ObjetRetour").ObjetRetour();

    entity.attachment = req.body.id_media;
    
    model.initialize(db);
    model.setAttachment(entity, (isSet, message, result) => {
        objetRetour.getEtat = isSet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

module.exports = router;
