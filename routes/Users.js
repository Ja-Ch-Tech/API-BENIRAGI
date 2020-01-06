var express = require('express');
var router = express.Router();

var db = require("../models/db"),
    model = require("../models/Users"),
    modelEvaluation = require("../models/Evaluation");

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

//Définir la biographie d'un utilisateur
router.post('/setBio', (req, res) => {
    var entity = require("../models/entities/Users").Bio(req.body.id_user),
        objetRetour = require("./ObjetRetour").ObjetRetour();

    entity.bio = req.body.bio;

    model.initialize(db);
    model.setBiographie(entity, (isSet, message, result) => {
        objetRetour.getEtat = isSet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Pour récupérer les détails d'un utilisateur
router.get('/details/:id_user/:id_viewer', (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour(),
        objet = {
            "id_user": req.params.id_user,
            "id_viewer": req.params.id_viewer && req.params.id_viewer != "null" ? req.params.id_viewer : null 
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

//Récupère les petitest stats (average, nbreFeedBacks, nbreView)
router.get('/stats/:id_freelancer', (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour();

    model.initialize(db);
    model.stats(req.params.id_freelancer, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Récupère les tops freelancer
router.get('/topFreelance/:id_viewer/:limit', (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour(),
        limit = parseInt(req.params.limit) ? parseInt(req.params.limit) : null,
        id_viewer = req.params.id_viewer && req.params.id_viewer != "null" ? req.params.id_viewer : null;
    
    modelEvaluation.initialize(db);
    modelEvaluation.getTop(id_viewer, limit, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Récupération des nouveaux freelances
/**
 * Valeur possible pour moment:
 * new => pour récupérer les nouveaux freelancers
 * old => pour les anciens
 */
router.get('/getFreelancers/:moment/:limit', (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour(),
        limit = parseInt(req.params.limit) ? parseInt(req.params.limit) : null;

    model.initialize(db);
    model.getFreelancers(limit, req.params.moment, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Module de récupération de favoris de l'employeur
router.get('/getFavorites/:id_employer', (req, res) => {
    var objetRetour = require("./ObjetRetour").ObjetRetour();

    model.initialize(db);
    model.favorisForEmployer(req.params.id_employer, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

//Définir la biographie d'un utilisateur
router.post('/setHourly', (req, res) => {
    var entity = require("../models/entities/Users").HourlyRate(req.body.id_user),
        objetRetour = require("./ObjetRetour").ObjetRetour();

    entity.rate = req.body.rate;

    model.initialize(db);
    model.setHourlyRate(entity, (isSet, message, result) => {
        objetRetour.getEtat = isSet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200).send(objetRetour);
    })
})

module.exports = router;
