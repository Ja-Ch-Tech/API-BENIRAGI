var db = require("./db"),
    bcrypt = require("bcryptjs"),
    nodemailer = require("nodemailer");

var collection = {
    value: null
};

module.exports.initialize = (db) => {
    collection.value = db.get().collection("Users");
}

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
                                newUser.id_type = "" + resultType._id;
                                //On appele la méthode insertOne (une methode propre à mongoDB) de notre collection qui doit prendre la structure de l'entité
                                collection.value.insertOne(newUser, (err, result) => {

                                    //On test s'il y a erreur
                                    if (err) {
                                        callback(false, "Une erreur est survénue lors de la création de l'utilisateur", "" + err);
                                    } else { //S'il n'y a pas erreur

                                        //On vérifie s'il y a des résultat renvoyé
                                        if (result) {
                                            //callback(true, "L'utilisateur est enregistré", result.ops[0])
                                            var code = require("./Code");

                                            code.initialize(db);
                                            code.generate(result.ops[0], (isGenerate, message, resultWithCode) => {
                                                if (isGenerate) {
                                                    sendCode(resultWithCode, (isSend, message, resultSend) => {
                                                        if (isSend) {
                                                            callback(true, "Le code est envoyé à vo tre adresse e-mail", resultWithCode)
                                                        } else {
                                                            callback(true, "Verifier votre connexion à internet puis demandé un nouveau code", resultWithCode)
                                                        }
                                                    })
                                                } else {
                                                    callback(true, "Demandé un nouveau code", result.ops[0])
                                                }
                                            })

                                        } else { //Si non l'etat sera false et on envoi un message
                                            callback(false, "Désolé, l'utilisateur non enregistrer")
                                        }
                                    }
                                })
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

    }
}

//Pour tester l'adresse e-mail
function testEmail(user, callback) {
    if (user.email) {
        if (/^[a-z0-9._-]+@[a-z0-9._-]+\.[a-z]{2,6}$/i.test(user.email)) {
            collection.value.aggregate([
                {
                    "$match": {
                        "email": user.email
                    }
                }
            ]).toArray((err, resultAggr) => {
                if (err) {
                    callback(false, "Une erreur est survenue lors du test de l'adresse e-mail : " + err)
                } else {
                    if (resultAggr.length > 0) {
                        callback(false, "Adresse e-mail déjà utilisé")
                    } else {
                        callback(true, "Autorisation accordé")
                    }
                }
            })
        } else {
            callback(false, "Le format d'adresse est invalide")
        }

    } else {
        callback(false, "Aucun adresse e-mail n'est spécifié")
    }
}

function sendCode(account, callback) {

    const output = 'Votre code de confirmation : <b style="color: #ff4500; font-family: Century Gothic; font-size: 1.4em">' + account.code + '</b><br>Beniragi-Serice';

    let transporter = nodemailer.createTransport({
        host: "smtp.live.com",
        port: 587,
        secure: false,
        auth: {
            user: "anonymouspeter007@hotmail.com",
            pass: "tubemate123"
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    let mailOptions = {
        from: '"Beniragi-Service" <anonymouspeter007@hotmail.com>',
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

//Récupère les details pour un user
module.exports.findOneById = (id, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(id),
                    "flag": true
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

module.exports.login = (obj, callback) => {
    try {
        collection.value.aggregate([{
            "$match": {
                "email": obj.email
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

                                this.isEmployer(objetRetour.id_user, (isGet, message, resultEmployer) => {
                                    if (isGet) {
                                        objetRetour.isEmployer = resultEmployer.isEmployer;
                                        callback(true, `Vous êtes connecté en tant que ${objetRetour.isEmployer ? "employeur" : "freelancer"}`, objetRetour)
                                    } else {
                                        callback(false, message)
                                    }
                                })

                            } else {
                                callback(false, "Le mot de passe est incorrect");
                            }
                        }
                    });

                } else {
                    callback(false, "Username incorrect");
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

                collection.value.updateOne(filter, update, (err, result) => {
                    if (err) {
                        callback(false, "Une erreur a été lévée lors de la mise à jour de sa visisbilité : " + err)
                    } else {
                        if (result) {
                            callback(true, "Mise à jour de visibilité effectué", result)
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

//Définition de l'avatar
module.exports.setAvatar = (newAvatar, callback) => {
    try {
        this.findOneById(newAvatar.id_user, (isFound, message, result) => {
            if (isFound) {
                delete newAvatar.id_user;
                var media = require("./Media");

                media.initialize(db);
                media.findOneById(newAvatar.id_media, (isFound, message, resultMedia) => {
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
                    "flag": true
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

                            media.getInfos(result, (isGet, message, resultWithMedia) => {

                                var town = require("./Town");

                                town.initialize(db);
                                town.getInfos(resultWithMedia, (isGet, message, resultWithTown) => {

                                    var view = require("./View"),
                                        entity = require("./entities/View").View(resultWithTown._id, resultWithTown.id_viewer ? resultWithTown.id_viewer : null);

                                    view.initialize(db);
                                    view.create(entity, (isCreated, message, result) => {
                                        //Suppression de datas en trop
                                        delete resultWithTown._id;
                                        delete resultWithTown.password;
                                        callback(true, "Les infos de l'utilisateur est renvoyé", resultWithTown)
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
                    "jobs.id_job": "" + objet._id
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
                                "id_town": newTown.id_town
                            };

                        collection.value(filter, update, (err, resultUp) => {
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