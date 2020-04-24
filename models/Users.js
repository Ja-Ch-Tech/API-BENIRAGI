var db = require("./db"),
    bcrypt = require("bcryptjs"),
    nodemailer = require("nodemailer"),
    jwt = require("jsonwebtoken"),
    twilio = require("twilio")("AC07c9c094646ef2ab48e105ed64c4fcf1", "5c5108339a47d15eba184b044dc9b604");

const SIGN_TOKEN_SECRET = "5ef1drc7d64r76c89p73e33t68e2frfc3e",
    EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    PSWD_REGEX = /^(?=.*\d).{4,8}$/;//Le mot de passe doit comprendre entre 4 et 8 chiffres et inclure au moins un chiffre numérique.

var collection = {
    value: null
};

module.exports.initialize = (db) => {
    collection.value = db.get().collection("Users");
}

//Module pour l'inscription d'un user
module.exports.register = (newUser, callback) => {
    try {

        //On commence par crypter le mot de passe        
        var valeur_pwd = "Beniragi" + newUser.password + "jach";

        bcrypt.hash(valeur_pwd, 10, function (errHash, hashePwd) {

            if (errHash) { //Si une erreure survient lors du hashage du mot de passe
                callback(false, "Une erreur est survenue lors du hashage du mot de passe : " + errHash);
            } else { //Si non le mot de passe a été bien hashé

                newUser.password = hashePwd;

                testEmail(newUser, (isNotExist, message, result) => {
                    if (isNotExist) {
                        let type_users = require("./TypeUsers");

                        type_users.initialize(db);
                        type_users.findOne(newUser.id_type, (isFound, messageType, resultType) => {
                            if (isFound) {
                                if (/freelancer|free|prestataire/i.test(resultType.intitule)) {
                                    var job = require("./Jobs");

                                    job.initialize(db);
                                    job.findOneById(newUser.id_job, (isFound, message, resultFoundJob) => {
                                        if (isFound) {

                                            newUser.id_type = "" + resultType._id;
                                            newUser.jobs = {
                                               id_job: "" + resultFoundJob._id
                                            };

                                            var town = require("./Town");

                                            town.initialize(db);
                                            town.findOneById(newUser.id_town, (isFound, message, resultFoundTown) => {
                                                if (isFound) {

                                                    newUser.id_town = "" + resultFoundTown._id;

                                                    //On appele la méthode insertOne (une methode propre à mongoDB) de notre collection qui doit prendre la structure de l'entité
                                                    collection.value.insertOne(newUser, (err, result) => {
        
                                                        //On test s'il y a erreur
                                                        if (err) {
                                                            callback(false, "Une erreur est survénue lors de la création de l'utilisateur", "" + err);
                                                        } else { //S'il n'y a pas erreur
        
                                                            //On vérifie s'il y a des résultat renvoyé
                                                            if (result) {
                                                                var type_users = require("./TypeUsers");
        
                                                                type_users.initialize(db)
                                                                type_users.isEmployer(result.ops[0], (isTrue, message, resultWithTest) => {
        
                                                                    var code = require("./Code");
        
                                                                    code.initialize(db);
                                                                    code.generate(resultWithTest, (isGenerate, message, resultWithCode) => {
                                                                        if (isGenerate) {
                                                                            sendCode(resultWithCode, (isSend, message, resultSend) => {
                                                                                if (isSend) {
                                                                                    callback(true, "Le code est envoyé à vo tre adresse e-mail", resultWithCode)
                                                                                } else {
                                                                                    callback(true, "Verifier votre connexion à internet puis demandé un nouveau code", resultWithCode)
                                                                                }
                                                                            })
                                                                        } else {
                                                                            callback(true, "Demandé un nouveau code", resultWithTest)
                                                                        }
                                                                    })
                                                                })
        
                                                            } else { //Si non l'etat sera false et on envoi un message
                                                                callback(false, "Désolé, l'utilisateur non enregistrer")
                                                            }
                                                        }
                                                    })
                                                } else {
                                                    callback(false, message)
                                                }
                                            })
                                        } else {
                                            callback(false, message)
                                        }
                                    })
                                } else {
                                    delete newUser.id_job;
                                    newUser.id_type = "" + resultType._id;

                                    var town = require("./Town");

                                    town.initialize(db);
                                    town.findOneById(newUser.id_town, (isFound, message, resultFoundTown) => {
                                        if (isFound) {
                                            newUser.id_town = "" + resultFoundTown._id;
                                            //On appele la méthode insertOne (une methode propre à mongoDB) de notre collection qui doit prendre la structure de l'entité
                                            collection.value.insertOne(newUser, (err, result) => {
        
                                                //On test s'il y a erreur
                                                if (err) {
                                                    callback(false, "Une erreur est survénue lors de la création de l'utilisateur", "" + err);
                                                } else { //S'il n'y a pas erreur
        
                                                    //On vérifie s'il y a des résultat renvoyé
                                                    if (result) {
                                                        var type_users = require("./TypeUsers");
        
                                                        type_users.initialize(db)
                                                        type_users.isEmployer(result.ops[0], (isTrue, message, resultWithTest) => {
        
                                                            var code = require("./Code");
        
                                                            code.initialize(db);
                                                            code.generate(resultWithTest, (isGenerate, message, resultWithCode) => {
                                                                if (isGenerate) {
                                                                    sendCode(resultWithCode, (isSend, message, resultSend) => {
                                                                        if (isSend) {
                                                                            callback(true, "Le code est envoyé à vo tre adresse e-mail", resultWithCode)
                                                                        } else {
                                                                            callback(true, "Verifier votre connexion à internet puis demandé un nouveau code", resultWithCode)
                                                                        }
                                                                    })
                                                                } else {
                                                                    callback(true, "Demandé un nouveau code", resultWithTest)
                                                                }
                                                            })
                                                        })
        
                                                    } else { //Si non l'etat sera false et on envoi un message
                                                        callback(false, "Désolé, l'utilisateur non enregistrer")
                                                    }
                                                }
                                            }) 
                                        } else {
                                            callback(false, message)
                                        }
                                    })
                                }
                                
                            } else {
                                callback(false, messageType)
                            }
                        })
                    } else {
                        callback(false, message)
                    }
                })

            }
        })


    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'inscription : " + err)
    }
}

//Pour tester l'adresse e-mail
function testEmail(user, callback) {
    if (user.email) {
        if (EMAIL_REGEX.test(user.email) || /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g.test(user.email)) {
            collection.value.aggregate([
                {
                    "$match": {
                        "email": user.email,
                        "$or": [
                            { "deleted": {"$exists": 0 }},
                            { "deleted": false }
                        ]
                    }
                }
            ]).toArray((err, resultAggr) => {
                if (err) {
                    callback(false, "Une erreur est survenue lors du test de l'adresse e-mail : " + err)
                } else {
                    if (resultAggr.length > 0) {
                        callback(false, "Adresse e-mail ou numéro de téléphone déjà utilisé")
                    } else {
                        callback(true, "Autorisation accordé")
                    }
                }
            })
        } else {
            callback(false, "Le format d'adresse ou de numéro de téléphone est invalide")
        }

    } else {
        callback(false, "Aucun adresse e-mail n'est spécifié")
    }
}

//Fonction d'envoi du code d'activation
function sendCode(account, callback) {

    if (/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g.test(account.email)) {
        twilio.messages.create(
            {
                body: `Le code d'activation de votre compte est ${account.code}`,
                from: "+12055396443",
                to: account.email.toString()
            }
        ).then(message => {
            console.log(message.sid);
            callback(true, "Code envoyé avec succès", account)
        }).catch(err => {
            console.log(err);
            callback(false, "Code de confirmation non-envoyé : " + err, account)
        })
    } else {
        const output = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Activation de compte</title>
</head>
<body>
    <table  width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20pt;">
        <tr>
            <td rowspan="8" width="5%">&nbsp;</td>
            <td style="text-align: center;">
                <div style="font-family: Segoe UI; font-size: 16pt; padding-top: 10pt;">BENIRAGI-SERVICE, All in one</div>
            </td>
            <td rowspan="8" width="5%">&nbsp;</td>
        </tr>
        <tr>
            <td style="text-align: center; padding-top: 20pt; padding-bottom: 20pt;">
                <!-- Image doit être en ligne -->
                <img src="https://i.goopics.net/xn192.png" alt="Pas trouvé" width="100px" height="100px">
            </td>
        </tr>
        <tr>
            <td style="background-color: crimson; color: #fff; padding: 15px; text-align: center;">
                <div style="font-size: 8pt; font-weight: normal; font-family: Arial, Helvetica, sans-serif;">Code de confirmation</div>
                <div style="font-family: 'Courier New', Courier, monospace; font-weight: 900; font-size: 39pt; padding-top: 10pt;">${account.code}</div>
            </td>
        </tr>
        <tr>
            <td>&nbsp;</td>
        </tr>
        <tr><td>&nbsp;</td></tr>
    </table>
</body>
</html>`;

        let transporter = nodemailer.createTransport({
            host: "beniragiservices.com",
            port: 465,
            secure: true,
            auth: {
                user: "no-reply@beniragiservices.com",
                pass: "no-reply@2020"
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        let mailOptions = {
            from: '"Beniragi-Service" <no-reply@beniragiservices.com>',
            to: account.email,
            subject: "Activation de compte",
            html: output
        };

        transporter.sendMail(mailOptions, (error, info) => {

            if (error) {
                console.log("Erreur d'envoi de mail");
                console.log(error);
                callback(false, "Code de confirmation non-envoyé : " + error, account)
            } else {
                console.log("Mail envoyé avec succès");
                callback(true, "Code envoyé avec succès", account)
            }

            transporter.close();

        })
    }
    
}

//Récupère les details pour un user
module.exports.findOneById = (id, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(id),
                    "$or": [
                        { "deleted": { "$exists": 0 } },
                        { "deleted": false }
                    ]
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur de recherche de type : " + err)
            } else {
                if (resultAggr.length > 0) {
                    var type = require("./TypeUsers");

                    type.initialize(db);
                    type.getTypeForUser(resultAggr[0], (isGet, message, resultWithType) => {
                        if (isGet) {
                            callback(true, message, resultWithType)
                        } else {
                            callback(false, "Pas de type défini, ça nous impossible de vous donner les détails")
                        }
                    })
                } else {
                    callback(false, "Ce user n'existe pas ou n'est pas autorisé")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception de recherche de user : " + exception)
    }
}

//Module d'activation du compte
module.exports.activateAccount = (obj, callback) => {
    try {
        var filter = {
            "_id": require("mongodb").ObjectId(obj.id_user)
        },
            update = {
                "$set": {
                    "visibility": true,
                    "flag": true
                }
            };

        collection.value.updateOne(filter, update, (err, result) => {
            if (err) {
                callback(false, "Une erreur lors de la mise à jour du flag du user: " + err)
            } else {
                if (result) {
                    callback(true, "Le compte a été activé", result)
                } else {
                    callback(false, "Aucune mise à jour")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée de la mise à jour du flag du user: " + exception)
    }
}

//Pour la connexion
module.exports.login = (obj, callback) => {
    try {
        collection.value.aggregate([{
            "$match": {
                "email": obj.email,
                "$or": [
                    { "deleted": { "$exists": 0 } },
                    { "deleted": false }
                ]
            }
        },
        {
            "$project": {
                "password": 1,
                "id_type": 1,
                "flag": 1
            }
        }
        ]).toArray(function (errAggr, resultAggr) {

            if (errAggr) {
                callback(false, "Une erreur est survenue lors de la connexion de l'utilisateur : " + errAggr);
            } else {

                if (resultAggr.length > 0) {

                    var clearPwd = "Beniragi" + obj.password + "jach";

                    bcrypt.compare(clearPwd, resultAggr[0].password, function (errCompareCrypt, resultCompareCrypt) {


                        if (errCompareCrypt) {
                            callback(false, "Une erreur est survenue lors du décryptage du mot de passe : " + errCompareCrypt);
                        } else {
                            if (resultCompareCrypt) {

                                var id_user = "" + resultAggr[0]._id,
                                    id_type = resultAggr[0].id_type,
                                    flag = resultAggr[0].flag,
                                    objetRetour = {
                                        "id_user": id_user,
                                        "id_type": id_type,
                                        "flag": flag
                                    };

                                module.exports.isEmployer(objetRetour.id_user, (isGet, message, resultEmployer) => {

                                    objetRetour.isEmployer = resultEmployer.isEmployer;
                                    callback(true, `Vous êtes connecté en tant que ${objetRetour.isEmployer ? "employeur" : "freelancer"}`, objetRetour);

                                })

                            } else {
                                callback(false, "Le mot de passe est incorrect");
                            }
                        }
                    });

                } else {
                    callback(false, "Ce compte n'est pas repertorié !");
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la connexion du user : " + exception);
    }
}

//Définir sa visibilité
module.exports.toggleVisibility = (id_user, callback) => {
    try {
        module.exports.findOneById(id_user, (isFound, message, result) => {
            if (isFound) {
                var filter = {
                    "_id": result._id
                },
                    update = {
                        "$set": {
                            "visibility": result.visibility ? false : true
                        }
                    };

                collection.value.updateOne(filter, update, (err, resultUp) => {
                    if (err) {
                        callback(false, "Une erreur a été lévée lors de la mise à jour de sa visisbilité : " + err)
                    } else {
                        if (resultUp) {
                            callback(true, "Mise à jour de visibilité effectué", { flag: result.visibility ? false : true })
                        } else {
                            callback(false, "Aucune mise à jour !")
                        }
                    }
                })
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour de sa visisbilité : " + exception)
    }
}

//Module permettant la récupération des stats sur le nombres des users par leurs types
module.exports.getNumberForTypeUser = (callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "$or": [
                        { "deleted": { "$exists": 0 } },
                        { "deleted": false }
                    ]
                }
            },
            {
                "$group": {
                    "_id": "$id_type",
                    "count": { "$sum": 1 }
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur sur le comptage des types de user : " + err)
            } else {
                if (resultAggr.length > 0) {
                    var sortieUser = 0,
                        listOut = [],
                        type = require("./TypeUsers");

                    type.initialize(db);
                    for (let index = 0; index < resultAggr.length; index++) {
                        resultAggr[index].id_type = resultAggr[index]._id;
                        delete resultAggr[index]._id;

                        type.getTypeForUser(resultAggr[index], (isGet, message, resultWithType) => {
                            sortieUser++;
                            if (isGet) {
                                listOut.push(resultWithType)
                            }

                            if (sortieUser === resultAggr.length) {
                                callback(true, "Les stats sont prêts", listOut)
                            }
                        })
                    }
                } else {
                    callback(false, "Aucun user donc aucune statistique à faire")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors du comptage des types de user : " + exception)
    }
}

//Définition de l'identité de la personne
module.exports.setIdentity = (newIdentity, callback) => {
    try {
        this.findOneById(newIdentity.id_user, (isFound, message, result) => {
            if (isFound) {
                delete newIdentity.id_user;
                var filter = {
                    "_id": result._id
                },
                    update = {
                        "$set": {
                            "identity": newIdentity
                        }
                    };

                collection.value.updateOne(filter, update, (err, resultUp) => {
                    if (err) {
                        callback(false, "Une erreur lors de la mise à jour : " + err)
                    } else {
                        if (resultUp) {
                            callback(true, "La mise à jour a été faites", resultUp)
                        } else {
                            callback(false, "Aucune mise à jour")
                        }
                    }
                })

            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour : " + exception)
    }
}

//Pour définir le job
module.exports.setJobs = (newJobs, callback) => {
    try {
        this.findOneById(newJobs.id_user, (isFound, message, result) => {
            if (isFound) {
                delete newJobs.id_user;
                var jobs = require("./Jobs");

                jobs.initialize(db);
                jobs.findOneById(newJobs.id_job, (isFound, message, resultJobs) => {

                    if (isFound) {
                        var filter = {
                            "_id": result._id
                        },
                            update = {
                                "$set": {
                                    "jobs": newJobs
                                }
                            };

                        collection.value.updateOne(filter, update, (err, resultUp) => {
                            if (err) {
                                callback(false, "Une erreur lors de la mise à jour : " + err)
                            } else {
                                if (resultUp) {
                                    callback(true, "La mise à jour a été faites", resultUp)
                                } else {
                                    callback(false, "Aucune mise à jour")
                                }
                            }
                        })
                    } else {
                        callback(false, message)
                    }
                })


            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception lors de la définiton des jobs : " + exception)
    }
}

//Définition de l'identité de la personne
module.exports.setBiographie = (newBio, callback) => {
    try {
        this.findOneById(newBio.id_user, (isFound, message, result) => {
            if (isFound) {
                delete newBio.id_user;
                var filter = {
                    "_id": result._id
                },
                    update = {
                        "$set": {
                            "bio": newBio
                        }
                    };

                collection.value.updateOne(filter, update, (err, resultUp) => {
                    if (err) {
                        callback(false, "Une erreur lors de la mise à jour : " + err)
                    } else {
                        if (resultUp) {
                            callback(true, "La mise à jour a été faites", resultUp)
                        } else {
                            callback(false, "Aucune mise à jour")
                        }
                    }
                })

            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour : " + exception)
    }
}

//Définition de l'avatar
module.exports.setAvatar = (newAvatar, callback) => {
    try {
        this.findOneById(newAvatar.id_user, (isFound, message, result) => {
            if (isFound) {
                delete newAvatar.id_user;
                var media = require("./Media");

                media.initialize(db);
                media.findOneById(newAvatar.id_avatar, (isFound, message, resultMedia) => {
                    if (isFound) {
                        var filter = {
                            "_id": result._id
                        },
                            update = {
                                "$set": {
                                    "avatar": newAvatar
                                }
                            };

                        collection.value.updateOne(filter, update, (err, resultUp) => {
                            if (err) {
                                callback(false, "Une erreur lors de la mise à jour : " + err)
                            } else {
                                if (resultUp) {
                                    callback(true, "La mise à jour a été faites", resultUp)
                                } else {
                                    callback(false, "Aucune mise à jour")
                                }
                            }
                        })
                    } else {
                        callback(false, message)
                    }
                })


            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la définition de l'avatar : " + exception)
    }
}

//Définition des documents
module.exports.setDocs = (newDocs, callback) => {
    try {
        this.findOneById(newDocs.id_user, (isFound, message, result) => {
            if (isFound) {
                delete newDocs.id_user;
                var media = require("./Media");

                media.initialize(db);
                media.findOneById(newDocs.id_media, (isFound, message, resultMedia) => {
                    if (isFound) {
                        var filter = {
                            "_id": result._id
                        },
                            update = {
                                "$push": {
                                    "docs": newDocs
                                }
                            };

                        collection.value.updateOne(filter, update, (err, resultUp) => {
                            if (err) {
                                callback(false, "Une erreur lors de la mise à jour : " + err)
                            } else {
                                if (resultUp) {
                                    callback(true, "La mise à jour a été faites", resultUp)
                                } else {
                                    callback(false, "Aucune mise à jour")
                                }
                            }
                        })
                    } else {
                        callback(false, message)
                    }
                })

            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la définition de l'avatar : " + exception)
    }
}

//Pour recupérer les infos d'un user
module.exports.getInfos = (objet, callback) => {
    try {

        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(objet.id_user),
                    "flag": true,
                    "$or": [
                        { "deleted": { "$exists": 0 } },
                        { "deleted": false }
                    ]
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la récupération des infos du user : " + err)
            } else {
                if (resultAggr.length > 0) {
                    delete resultAggr[0].created_at;

                    var type_users = require("./TypeUsers");

                    type_users.initialize(db);
                    type_users.getTypeForUser(resultAggr[0], (isGet, message, result) => {
                        if (isGet) {
                            var media = require("./Media");

                            media.initialize(db);
                            media.getInfos(result, (isGet, message, resultWithMedia) => {

                                var town = require("./Town");

                                town.initialize(db);
                                town.getInfos(resultWithMedia, (isGet, message, resultWithTown) => {
                                    resultWithTown.id_viewer = objet.id_viewer ? objet.id_viewer : null;

                                    var favoris = require("./Favoris");

                                    favoris.initialize(db);
                                    favoris.isThisInFavorite(resultWithTown, (isIn, message, resultWithFavorite) => {
                                        if (resultWithFavorite.jobs && resultWithFavorite.jobs.skills && resultWithFavorite.jobs.skills.length > 0) {
                                            resultWithFavorite.skills = [];
                                            var outSkills = 0,
                                                listOut = [],
                                                skills = require("./Skills");

                                            skills.initialize(db);
                                            for (let index = 0; index < resultWithFavorite.jobs.skills.length; index++) {
                                                skills.findOne(resultWithFavorite.jobs.skills[index], (isGet, message, resultWithSkills) => {
                                                    outSkills++;
                                                    if (isGet) {
                                                        resultWithFavorite.skills.push(resultWithSkills.name)
                                                    }

                                                    if (outSkills == resultWithFavorite.jobs.skills.length) {
                                                        var view = require("./View"),
                                                            entity = require("./entities/View").View("" + resultWithFavorite._id, resultWithFavorite.id_viewer ? resultWithFavorite.id_viewer : null);

                                                        view.initialize(db);
                                                        view.create(entity, (isCreated, message, result) => {

                                                            var vip = require("./Vip");

                                                            vip.initialize(db);
                                                            vip.testingExists(resultWithFavorite._id, (isTrue, message, resultTest) => {

                                                                resultWithFavorite.isBoost = isTrue ? false : (isTrue == false ? (resultTest.flag ? false : resultTest.accept.response ? (resultTest.dates.end >= new Date().getDate() ? true : false) : false) : true);

                                                                //Suppression de datas en trop
                                                                delete resultWithFavorite._id;
                                                                delete resultWithFavorite.password;

                                                                callback(true, "Les infos de l'utilisateur est renvoyé", resultWithFavorite)

                                                            })
                                                        })
                                                    }
                                                })
                                            }

                                        } else {
                                            var view = require("./View"),
                                                entity = require("./entities/View").View("" + resultWithFavorite._id, resultWithFavorite.id_viewer ? resultWithFavorite.id_viewer : null);

                                            view.initialize(db);
                                            view.create(entity, (isCreated, message, result) => {

                                                var vip = require("./Vip");

                                                vip.initialize(db);
                                                vip.testingExists(resultWithFavorite._id, (isTrue, message, resultTest) => {
                                                    resultWithFavorite.isBoost = isTrue == false ? true : false;

                                                    //Suppression de datas en trop
                                                    delete resultWithFavorite._id;
                                                    delete resultWithFavorite.password;

                                                    callback(true, "Les infos de l'utilisateur est renvoyé", resultWithFavorite)

                                                })
                                            })
                                        }
                                    })

                                })
                            })

                        } else {
                            callback(false, message)
                        }
                    })
                } else {
                    callback(false, "Aucun user n'y correspond")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des infos du user : " + exception)
    }
}

//Détermine le types d'un user via son id
module.exports.isEmployer = (id, callback) => {
    try {
        this.findOneById(id, (isFound, message, result) => {
            if (isFound) {
                var type_users = require("./TypeUsers");

                type_users.initialize(db);
                type_users.isEmployer(result, (isFound, message, result) => {
                    callback(isFound, message, result);
                })
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception de détermination : " + exception)
    }
}

//Comptage des utilisateur ayant un job précis
module.exports.countUsersForJobs = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "jobs.id_job": "" + objet._id,
                    "$or": [
                        { "deleted": { "$exists": 0 } },
                        { "deleted": false }
                    ]
                }
            },
            {
                "$count": "nbre"
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                objet.nbre = 0;
                callback(false, "Erreur lors du comptage des utilisateurs ayant ce job : " + err, objet)
            } else {
                if (resultAggr.length > 0) {
                    objet.nbre = resultAggr[0].nbre;
                    callback(true, `Le nombre d'utilisateur étant ${objet.name} est renvoyé`, objet)
                } else {
                    objet.nbre = 0;
                    callback(false, `Aucun utilisateur n'est ${objet.name}`, objet)
                }
            }
        })
    } catch (exception) {

    }
}

//Définition des skills (Talents)
module.exports.setSkills = (newSkills, callback) => {
    try {
        this.findOneById(newSkills.id_user, (isFound, message, result) => {
            if (isFound) {
                if (result.jobs) {
                    if (newSkills.skills.length > 0) {
                        var skills = require("./Skills"),
                            outSkills = 0,
                            listOut = [];

                        skills.initialize(db);
                        for (let index = 0; index < newSkills.skills.length; index++) {
                            var formatedSkill = {
                                "id_job": result.jobs.id_job,
                                "name": newSkills.skills[index]
                            };
                            skills.smallSearch(formatedSkill, (isFoundOrCreatedd, messageSkills, resultWithSkills) => {
                                outSkills++;

                                if (isFoundOrCreatedd) {
                                    listOut.push("" + resultWithSkills._id);
                                }

                                if (outSkills == newSkills.skills.length) {
                                    var filter = {
                                        "_id": require("mongodb").ObjectId(newSkills.id_user)
                                    },
                                        update = {
                                            "$set": {
                                                "jobs.skills": listOut
                                            }
                                        }
                                        ;

                                    collection.value.updateOne(filter, update, (err, resultUp) => {
                                        if (err) {
                                            callback(false, "Une erreur est survenue lors de la mise à jours des skills : " + err)
                                        } else {
                                            if (resultUp) {
                                                callback(true, "La mise à jour des skills a été faites avec succès", resultUp)
                                            } else {
                                                callback(false, "Aucune mise à jour des skills n'a été faite")
                                            }
                                        }
                                    })
                                }
                            })
                        }

                    } else {
                        callback(false, "Aucun skills n'a été spécifié")
                    }
                } else {
                    callback(false, "Vous devez d'abord spécifié un metier, avant d'y ajouter vos compétences")
                }

            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jours des skills : " + exception)
    }
}

//Définition de la ville
module.exports.setTown = (newTown, callback) => {
    try {
        this.findOneById(newTown.id_user, (isFound, message, result) => {
            if (isFound) {
                var town = require("./Town");

                town.initialize(db);
                town.findOneById(newTown.id_town, (isFound, message, resultTown) => {
                    if (isFound) {
                        var filter = {
                            "_id": result._id
                        },
                            update = {
                                "$set": {
                                    "id_town": newTown.id_town
                                }
                            };

                        collection.value.updateOne(filter, update, (err, resultUp) => {
                            if (err) {
                                callback(false, "Une erreur est survenue lors de la définition de la ville : " + err)
                            } else {
                                if (resultUp) {
                                    callback(true, "La ville a été mise à jour", resultUp)
                                } else {
                                    callback(false, "Aucune mise à jour")
                                }
                            }
                        })
                    } else {
                        callback(false, message)
                    }
                })

            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la définition de la ville : " + exception)
    }
}

//Définition de pièce jointe
module.exports.setAttachment = (newAttachment, callback) => {
    try {
        this.findOneById(newAttachment.id_user, (isFound, message, result) => {
            if (isFound) {
                delete newAttachment.id_user;
                var media = require("./Media");

                media.initialize(db);
                media.findOneById(newAttachment.attachment, (isFound, message, resultMedia) => {
                    if (isFound) {
                        var filter = {
                            "_id": result._id
                        },
                            update = {
                                "$set": {
                                    "attachment": newAttachment.attachment
                                }
                            };

                        collection.value.updateOne(filter, update, (err, resultUp) => {
                            if (err) {
                                callback(false, "Une erreur lors de la mise à jour : " + err)
                            } else {
                                if (resultUp) {
                                    callback(true, "La mise à jour a été faites", resultUp)
                                } else {
                                    callback(false, "Aucune mise à jour")
                                }
                            }
                        })
                    } else {
                        callback(false, message)
                    }
                })


            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la définition des pièces jointes : " + exception)
    }
}

//Récupération des statistiques
module.exports.stats = (id, callback) => {
    try {
        this.isEmployer(id, (isEmployer, message, result) => {
            if (!isEmployer) {
                var evaluation = require("./Evaluation");

                evaluation.initialize(db);
                evaluation.getStats(id, (isGet, message, resultWithStats) => {
                    callback(true, "Voici les stats", resultWithStats)
                })
            } else {
                //callback(false, message)
                var evaluation = require("./Evaluation");

                evaluation.initialize(db);
                evaluation.getStatsForEmployer(id, (isGet, message, resultWithStats) => {
                    callback(true, "Voici les stats d'un employeur", resultWithStats)
                })
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des certains stats : " + exception)
    }
}

//Pour recupérer les infos d'un user
module.exports.getInfosForFreelancer = (objet, callback) => {
    try {
        this.isEmployer("" + objet._id, (isTrue, message, resultTest) => {
            if (!isTrue) {
                var evaluation = require("./Evaluation");

                evaluation.initialize(db);
                evaluation.getAverageInTime(objet, (isGet, message, resultInTime) => {
                    collection.value.aggregate([
                        {
                            "$match": {
                                "_id": require("mongodb").ObjectId(resultInTime._id),
                                "flag": true,
                                "visibility": true,
                                "$or": [
                                    { "deleted": { "$exists": 0 } },
                                    { "deleted": false }
                                ]
                            }
                        }
                    ]).toArray((err, resultAggr) => {
                        if (err) {
                            callback(false, "Une erreur est survenue lors de la récupération des infos du user : " + err)
                        } else {
                            if (resultAggr.length > 0) {
                                resultAggr[0].average = resultInTime.average;
                                resultAggr[0].inTime = parseInt(Math.ceil(resultInTime.inTime * 100));
                                resultAggr[0].id_viewer = resultInTime.id_viewer;
                                delete resultAggr[0].created_at;

                                var type_users = require("./TypeUsers");

                                type_users.initialize(db);
                                type_users.getTypeForUser(resultAggr[0], (isGet, message, result) => {
                                    if (isGet) {
                                        var media = require("./Media");

                                        media.initialize(db);
                                        media.getInfos(result, (isGet, message, resultWithMedia) => {

                                            var town = require("./Town");

                                            town.initialize(db);
                                            town.getInfos(resultWithMedia, (isGet, message, resultWithTown) => {

                                                var favoris = require("./Favoris");

                                                favoris.initialize(db);
                                                favoris.isThisInFavorite(resultWithTown, (isIn, message, resultWithFavorite) => {

                                                    if (resultWithFavorite.jobs && resultWithFavorite.jobs.skills && resultWithFavorite.jobs.skills.length > 0) {
                                                        resultWithFavorite.skills = [];
                                                        var outSkills = 0,
                                                            listOut = [],
                                                            skills = require("./Skills");

                                                        skills.initialize(db);
                                                        for (let index = 0; index < resultWithFavorite.jobs.skills.length; index++) {
                                                            skills.findOne(resultWithFavorite.jobs.skills[index], (isGet, message, resultWithSkills) => {
                                                                outSkills++;
                                                                if (isGet) {
                                                                    resultWithFavorite.skills.push(resultWithSkills.name)
                                                                }

                                                                if (outSkills == resultWithFavorite.jobs.skills.length) {
                                                                    var vip = require("./Vip");

                                                                    vip.initialize(db);
                                                                    vip.isVIP("" + resultWithFavorite._id, (isTrue, message) => {
                                                                        resultWithFavorite.isVIP = isTrue;
                                                                        callback(true, "Les infos des tops freelancers sont renvoyé", resultWithFavorite)
                                                                    })
                                                                }
                                                            })
                                                        }

                                                    } else {
                                                        var vip = require("./Vip");

                                                        vip.initialize(db);
                                                        vip.isVIP("" + resultWithFavorite._id, (isTrue, message) => {
                                                            resultWithFavorite.isVIP = isTrue;
                                                            callback(true, "Les infos de l'utilisateur est renvoyé", resultWithFavorite);
                                                        })
                                                    }
                                                })

                                            })
                                        })

                                    } else {
                                        callback(false, message)
                                    }
                                })
                            } else {
                                callback(false, "Aucun user n'y correspond")
                            }
                        }
                    })
                })

            } else {
                callback(false, message)
            }
        })


    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des infos du user : " + exception)
    }
}

//Pour récupérer les nouveaux freelancers
module.exports.getFreelancers = (limit, moment, id_viewer, callback) => {
    try {
        var type_users = require("./TypeUsers");

        type_users.initialize(db);
        type_users.currentlyIdForFreelanceType((isGet, message, resultWithID) => {
            if (isGet) {
                var limitLess = limit && parseInt(limit) ? { "$limit": parseInt(limit) } : { "$match": {} },
                    sort = /new/i.test(moment) ? { "created_at": -1 } : { "created_at": 1 };
                collection.value.aggregate([
                    {
                        "$match": {
                            "id_type": "" + resultWithID._id,
                            "$or": [
                                { "deleted": { "$exists": 0 } },
                                { "deleted": false }
                            ]
                        }
                    },
                    {
                        "$sort": sort
                    },
                    limitLess
                ]).toArray((err, resultAggr) => {
                    if (err) {
                        callback(false, "Une erreur est lévée lors de la recherche des nouveaux users : " + err)
                    } else {
                        if (resultAggr.length > 0) {
                            var outUsers = 0,
                                listOut = [];

                            for (let index = 0; index < resultAggr.length; index++) {
                                resultAggr[index]._id = "" + resultAggr[index]._id;
                                resultAggr[index].id_viewer = id_viewer;
                                this.getInfosForFreelancer(resultAggr[index], (isGet, message, resultWithInfos) => {
                                    outUsers++;
                                    if (isGet) {
                                        listOut.push(resultWithInfos)
                                    }

                                    if (outUsers == resultAggr.length) {
                                        callback(true, "Les nouveaux freelancer y sont", listOut)
                                    }
                                })
                            }
                        } else {
                            callback(false, "Aucun nouveau freelancer")
                        }
                    }
                })
            } else {
                callback(false, message)
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche des nouveaux users : " + exception)
    }
}

//Module pour la récupération des favoris d'un employeur
module.exports.favorisForEmployer = (id_employer, callback) => {
    try {
        this.isEmployer(id_employer, (isTrue, message, resultTest) => {
            if (isTrue) {
                var favoris = require("./Favoris");

                favoris.initialize(db);
                favoris.favorisForEmployer(id_employer, (isGet, message, result) => {
                    callback(isGet, message, result)
                })
            } else {
                callback(false, "Un freelancer ne peut pas avoir des favoris")
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des favoris d'un employeur : " + exception)
    }
}

//Module pour récupérer toutes les datas des freelancers
module.exports.getInfosForFreelancerWithAllData = (objet, callback) => {
    try {
        var evaluation = require("./Evaluation");

        evaluation.initialize(db);
        evaluation.getAverageNote(objet, (isGet, message, result) => {
            this.getInfosForFreelancer(result, (isGet, message, resultWithInfos) => {
                callback(isGet, message, resultWithInfos)
            })
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors du rassemblage de toutes les datas : " + exception)
    }
}

//Définition de le taux horaire du freelancer
module.exports.setHourlyRate = (newHourly, callback) => {
    try {
        this.findOneById(newHourly.id_user, (isFound, message, result) => {
            if (isFound) {
                delete newHourly.id_user;
                var filter = {
                    "_id": result._id
                },
                    update = {
                        "$set": {
                            "hourly": newHourly
                        }
                    };

                collection.value.updateOne(filter, update, (err, resultUp) => {
                    if (err) {
                        callback(false, "Une erreur lors de la mise à jour : " + err)
                    } else {
                        if (resultUp) {
                            callback(true, "La mise à jour a été faites", resultUp)
                        } else {
                            callback(false, "Aucune mise à jour")
                        }
                    }
                })

            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour : " + exception)
    }
}

/**
 * SmartSearch
 */
module.exports.smartSearch = (objet, callback) => {
    try {
        if (objet.id_job && objet.id_town) {
            collection.value.aggregate([
                {
                    "$match": {
                        "$and": [
                            {
                                "$or": [
                                    { "jobs": { "$exists": 1 } },
                                    { "id_town": { "$exists": 1 } }
                                ]
                            },
                            { "jobs.id_job": objet.id_job },
                            { "id_town": objet.id_town },
                            { "flag": true },
                        ],
                        "$or": [
                            { "deleted": { "$exists": 0 } },
                            { "deleted": false }
                        ]
                    }
                }
            ]).toArray((err, resultAggr) => {
                if (err) {
                    callback(false, "Une erreur lors de la récupération des users : " + err)
                } else {
                    if (resultAggr.length > 0) {
                        var outFreelancer = 0,
                            listOut = [];

                        for (let index = 0; index < resultAggr.length; index++) {
                            this.getInfosForFreelancer(resultAggr[index], (isGet, message, resultWithInfos) => {
                                outFreelancer++;
                                if (isGet) {
                                    listOut.push(resultWithInfos)
                                }

                                if (outFreelancer == resultAggr.length) {
                                    callback(true, "Les users y sont", listOut)
                                }
                            })
                        }
                    } else {
                        callback(false, "Aucun user")
                    }
                }
            })
        } else if (objet.id_job) {
            collection.value.aggregate([
                {
                    "$match": {
                        "$and": [
                            {
                                "$or": [
                                    { "jobs": { "$exists": 1 } }
                                ]
                            },
                            { "jobs.id_job": objet.id_job },
                            { "flag": true }
                        ],
                        "$or": [
                            { "deleted": { "$exists": 0 } },
                            { "deleted": false }
                        ]
                    }
                }
            ]).toArray((err, resultAggr) => {
                if (err) {
                    callback(false, "Une erreur lors de la récupération des users : " + err)
                } else {
                    if (resultAggr.length > 0) {
                        var outFreelancer = 0,
                            listOut = [];

                        for (let index = 0; index < resultAggr.length; index++) {
                            this.getInfosForFreelancer(resultAggr[index], (isGet, message, resultWithInfos) => {
                                outFreelancer++;
                                if (isGet) {
                                    listOut.push(resultWithInfos)
                                }

                                if (outFreelancer == resultAggr.length) {
                                    callback(true, "Les users y sont", listOut)
                                }
                            })
                        }
                    } else {
                        callback(false, "Aucun user")
                    }
                }
            })
        } else if (objet.id_town) {
            collection.value.aggregate([
                {
                    "$match": {
                        "$and": [
                            {
                                "$or": [
                                    { "id_town": { "$exists": 1 } }
                                ]
                            },
                            { "id_town": objet.id_town },
                            { "flag": true }
                        ],
                        "$or": [
                            { "deleted": { "$exists": 0 } },
                            { "deleted": false }
                        ]
                    }
                }
            ]).toArray((err, resultAggr) => {
                if (err) {
                    callback(false, "Une erreur lors de la récupération des users : " + err)
                } else {
                    if (resultAggr.length > 0) {
                        var outFreelancer = 0,
                            listOut = [];

                        for (let index = 0; index < resultAggr.length; index++) {
                            this.getInfosForFreelancer(resultAggr[index], (isGet, message, resultWithInfos) => {
                                outFreelancer++;
                                if (isGet) {
                                    listOut.push(resultWithInfos)
                                }

                                if (outFreelancer == resultAggr.length) {
                                    callback(true, "Les users y sont", listOut)
                                }
                            })
                        }
                    } else {
                        callback(false, "Aucun user")
                    }
                }
            })
        }

    } catch (exception) {
        callback(false, "Une exception : " + exception)
    }
}

//Module permettant de trouver un user à partir de son adresse e-mail
module.exports.findOneByEmail = (email, callback) => {
    try {
        if (EMAIL_REGEX.test(email)) {
            collection.value.aggregate([
                {
                    "$match": {
                        "email": email,
                        "flag": true,
                        "$or": [
                            { "deleted": { "$exists": 0 } },
                            { "deleted": false }
                        ]
                    }
                }
            ]).toArray((err, resultAggr) => {
                if (err) {
                    callback(false, "Une erreur est survenue lors de la récupération des infos via adresse mail : " + err)
                } else {
                    if (resultAggr.length > 0) {
                        callback(true, "Les infos du user", resultAggr[0])
                    } else {
                        callback(false, "Aucun utilisateur actif")
                    }
                }
            })
        } else {
            callback(false, "Adresse e-mail non-conforme")
        }
    } catch (exception) {
        callback(false, "Une exception a été lévé lors de la récupération de l'adresse mail: " + exception)
    }
}

/**
 * Mot de passe oublié
 */
module.exports.forgotPassword = (objet, callback) => {
    try {
        this.findOneByEmail(objet.email, (isFound, message, result) => {
            if (isFound) {
                var token = generateToken(result),
                    objetSend = {
                        email: result.email,
                        token: token
                    };

                sendMailForForgetPassword(objetSend, (isSend, message, result) => {
                    callback(isSend, message)
                })

            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception lors de l'envoie du token : " + exception)
    }
}

/**
 * La génération du token
 * @param {Object} objet L'objet pour tokenizer
 */
function generateToken(objet) {
    return jwt.sign({
        id_user: "" + objet._id
    }, SIGN_TOKEN_SECRET, {
        expiresIn: '2h'
    })
}

/**
 * L'envoi du mail de réinitialisation du mot de passe
 * @param {Object} objet L'objet sur lequel le mail puise les informations
 * @param {Function} callback La fonction de retour
 */
function sendMailForForgetPassword(objet, callback) {

    const WEBSITE = require("../utils/constantes").WEB_SITE().online;
    const output = `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="X-UA-Compatible" content="ie=edge">
                    <title>Activation de compte</title>
                </head>
                <body>
                    <table  width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20pt;">
                        <tr>
                            <td rowspan="8" width="5%">&nbsp;</td>
                            <td style="text-align: center;">
                                <div style="font-family: Segoe UI; font-size: 16pt; padding-top: 10pt;">BENIRAGI-SERVICE, All in one</div>
                            </td>
                            <td rowspan="8" width="5%">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="text-align: center; padding-top: 20pt; padding-bottom: 20pt;">
                                <!-- Image doit être en ligne -->
                                <img src="https://i.goopics.net/xn192.png" alt="Pas trouvé" width="100px" height="100px">
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align: center;">
                                <div>Pour réinitialiser votre mot de passe <a href="${WEBSITE}/activation?tkn=${objet.token}">cliquez par ici</a>.</div>
                            </td>
                        </tr>
                        <tr>
                            <td>&nbsp;</td>
                        </tr>
                    </table>
                </body>
                </html>`;

    let transporter = nodemailer.createTransport({
        host: "smtp.live.com",
        port: 587,
        secure: false,
        auth: {
            user: "anonymouspeter007@hotmail.com",
            pass: "tubemate123"
        }
    });

    let mailOptions = {
        from: '"Beniragi-Service" <anonymouspeter007@hotmail.com>',
        to: objet.email,
        subject: "Réinitialisation du mot de passe",
        html: output
    };

    transporter.sendMail(mailOptions, (error, info) => {

        if (error) {
            console.log("Erreur d'envoi de mail");
            console.log(error);
            callback(false, "Lien non-envoyé : " + error, objet)
        } else {
            console.log("Mail envoyé avec succès");
            callback(true, "Lien envoyé avec succès", objet)
        }

        transporter.close();

    })
}

/**
 * Le decodage de la chaine tokenizer lors de la génération du token
 * @param {String} token La chaine tokenizer au départ
 * @param {Function} callback La fonction de retour 
 */
function decodeToken(token, callback) {
    jwt.verify(token, SIGN_TOKEN_SECRET, { expiresIn: '2h' }, (err, decode) => {
        if (err) {
            if (err.name == 'NotBeforeError') {
                callback(false, "Le token de l'activation a expiré")
            } else {
                callback(false, "Une erreur est survenue lors du decodage du token : " + err)
            }
        } else {
            var objet = {
                "id_user": decode.id_user
            };

            callback(true, "Le decodage est fini", objet)
        }
    })
}

//Module de réinitialisation du mot de passe en passant le nouveau mot de passe
module.exports.resetPassword = (objet, callback) => {
    try {
        decodeToken(objet.token, (isDecode, message, result) => {
            if (isDecode) {
                this.findOneById(result.id_user, (isFound, message, result) => {
                    if (isFound) {
                        var clearPwd = "Beniragi" + objet.password + "jach";

                        bcrypt.hash(clearPwd, 10, (err, hashed) => {
                            if (err) {
                                callback(false, "Une erreur est survenue lors du hash du nouveau mot de passe : " + err)
                            } else {
                                objet.password = hashed;
                                var filter = {
                                    "_id": result._id
                                },
                                    update = {
                                        "$set": {
                                            "password": objet.password
                                        }
                                    };

                                collection.value.updateOne(filter, update, (err, resultUp) => {
                                    if (err) {
                                        callback(false, "Une erreur lors de la mise à jour du mot de passe : " + err)
                                    } else {
                                        if (resultUp) {
                                            var id_user = "" + result._id,
                                                id_type = result.id_type,
                                                flag = result.flag,
                                                objetRetour = {
                                                    "id_user": id_user,
                                                    "id_type": id_type,
                                                    "flag": flag
                                                };

                                            this.isEmployer(objetRetour.id_user, (isGet, message, resultEmployer) => {

                                                objetRetour.isEmployer = resultEmployer.isEmployer;
                                                callback(true, `Vous êtes connecté en tant que ${objetRetour.isEmployer ? "employeur" : "freelancer"}`, objetRetour);

                                            });


                                        } else {
                                            callback(false, "Aucune mise à jour de mot de passe")
                                        }
                                    }
                                })
                            }
                        })
                    } else {
                        callback(false, message)
                    }
                })
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {

    }
}

//Module permettant de certifié un freelancer, un module qui ne doit pas être utilisé côté client tout est gérer un interne
module.exports.setCertificate = (objet, callback) => {
    try {
        this.isEmployer(objet.id_user, (isTrue, message, resultTest) => {
            if (!isTrue) {
                delete objet.id_user;

                var filter = {
                    "_id": resultTest._id
                },
                    update = {
                        "$set": {
                            "certificate": objet
                        }
                    };

                collection.value.updateOne(filter, update, (err, resultUp) => {
                    if (err) {
                        callback(false, "Une erreur lors de la certification du freelancer : " + err)
                    } else {
                        if (resultUp) {
                            callback(true, "Le système de certification lui accorde sa certification de bon freelancer", resultUp)
                        } else {
                            callback(false, "Aucune mise à jour")
                        }
                    }
                })
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une erreur lors de la certification du freelancer : " + err)
    }
}

//Module de suppression du compte utilisateur
module.exports.deleteAccount = (id, callback) => {
    try {
        this.findOneById(id, (isFound, message, resultFound) => {
            if (isFound) {
                var filter = {
                        "_id": resultFound._id
                    },
                    update = {
                        "$set": {
                            "deleted": true,
                            "flag": false
                        }
                    };

                collection.value.updateOne(filter, update, (err, resultUp) => {
                    if (err) {
                        callback(false, "Une erreur est survenue lors de la suppression du compte : " +err)
                    } else {
                        if (resultUp) {
                            callback(true, "Le compte est supprimé")
                        } else {
                            callback(false, "Un problème lors de la suppression")
                        }
                    }
                })
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la suppression du compte : " + exception)
    }
}
