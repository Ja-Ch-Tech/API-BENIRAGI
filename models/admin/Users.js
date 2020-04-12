//Les importations des modules supplementaires
var db = require("../db"),
    admin = require("./Admin"),
    users = require("../Users"),
    type = require("../TypeUsers"),
    media = require("../Media"),
    town = require("../Town"),
    favoris = require("../Favoris"),
    skills = require("../Skills");

var collection = {
    value: null
};

//Module exporté
module.exports = {
    /**
     * Initialisation de la collection
     * @param {String} db 
     */
    initialize(db) {
        collection.value = db.get().collection("Users");
    },
    /**
     * Module permettant de récupérer la totalité des utilisateurs de l'appli et le classe par type d'utilisateur
     * @param {Object} objet 
     * @param {Function} callback 
     */
    listUsers(objet, callback) {
        try {
            admin.initialize(db);

            admin.isAdmin(objet.id_admin, (isTrue) => {
                if (isTrue) {
                    collection.value.aggregate([
                        {
                            "$group": {
                                "_id": "$id_type",
                                "users": {
                                    "$push": {
                                        "id_user": "$_id".toString(),
                                        "email": "$email",
                                        "flag": "$flag",
                                        "visibility": "$visibility",
                                        "identity": "$identity",
                                        "jobs": "$jobs",
                                        "id_town": "$id_town".toString(),
                                        "bio": "$bio",
                                        "id_viewer": "$_id",
                                        "hourly": "$hourly",
                                        "created_at": "$created_at"
                                    }
                                },
                                "nbreUsers": { "$sum": 1 }
                            }
                        }
                    ]).toArray((err, resultAggr) => {
                        if (err) {
                            callback(false, "Une erreur est survenue lors de la récupération des utilisateurs classé par type : " + err)
                        } else {
                            if (resultAggr.length > 0) {
                                var outType = 0,
                                    listType = [];

                                type.initialize(db);
                                users.initialize(db);
                                for (let index = 0; index < resultAggr.length; index++) {
                                    type.findOne(resultAggr[index]._id, (isFound, message, resultWithType) => {

                                        if (isFound) {

                                            delete resultAggr[index]._id;
                                            resultAggr[index].type = resultWithType.intitule;

                                            var outUsers = 0,
                                                listOutUsers = [];

                                            for (let indexUsers = 0; indexUsers < resultAggr[index].users.length; indexUsers++) {
                                                resultAggr[index].users[indexUsers].id_user = "" + resultAggr[index].users[indexUsers].id_user;
                                                resultAggr[index].users[indexUsers].id_viewer = "" + resultAggr[index].users[indexUsers].id_viewer;

                                                this.getInfosForAdmin(resultAggr[index].users[indexUsers], (isGet, message, resultWithData) => {


                                                    if (isGet) {
                                                        listOutUsers.push(resultWithData);
                                                    }

                                                    outUsers++;


                                                    if (outUsers == resultAggr[index].users.length) {
                                                        outType++;

                                                        delete resultAggr[index].users;

                                                        resultAggr[index].users = listOutUsers;
                                                        listType.push(resultAggr[index]);

                                                        if (outType == resultAggr.length) {
                                                            callback(true, "Les utilisateurs sont renvoyé", listType)
                                                        }

                                                    }
                                                })
                                            }
                                        }
                                    })
                                }
                            } else {
                                callback(false, "Aucun users n'a de type, pas moyen de classé")
                            }
                        }
                    })
                } else {
                    callback(false, "N'est pas un administrateur")
                }
            })
        } catch (exception) {
            callback(false, "Une exception a été lévée lors de la récupération des utilisateurs classé par type : " + exception)
        }
    },

    /**
     * Récupération des des informations d'un utilisateur par un admin
     * @param {Object} objet 
     * @param {Function} callback 
     */
    getInfosForAdmin(objet, callback) {
        try {

            collection.value.aggregate([
                {
                    "$match": {
                        "_id": require("mongodb").ObjectId(objet.id_user)
                    }
                }
            ]).toArray((err, resultAggr) => {
                if (err) {
                    callback(false, "Une erreur est survenue lors de la récupération des infos du user : " + err)
                } else {
                    if (resultAggr.length > 0) {
                        delete resultAggr[0].created_at;

                        type.initialize(db);
                        type.getTypeForUser(resultAggr[0], (isGet, message, result) => {
                            if (isGet) {
                                media.initialize(db);
                                media.getInfos(result, (isGet, message, resultWithMedia) => {

                                    town.initialize(db);
                                    town.getInfos(resultWithMedia, (isGet, message, resultWithTown) => {
                                        resultWithTown.id_viewer = objet.id_viewer ? objet.id_viewer : null;

                                        favoris.initialize(db);
                                        favoris.isThisInFavorite(resultWithTown, (isIn, message, resultWithFavorite) => {
                                            if (resultWithFavorite.jobs && resultWithFavorite.jobs.skills && resultWithFavorite.jobs.skills.length > 0) {
                                                resultWithFavorite.skills = [];
                                                var outSkills = 0,
                                                    listOut = [];

                                                skills.initialize(db);
                                                for (let index = 0; index < resultWithFavorite.jobs.skills.length; index++) {
                                                    skills.findOne(resultWithFavorite.jobs.skills[index], (isGet, message, resultWithSkills) => {
                                                        outSkills++;
                                                        if (isGet) {
                                                            resultWithFavorite.skills.push(resultWithSkills.name)
                                                        }

                                                        if (outSkills == resultWithFavorite.jobs.skills.length) {

                                                            delete resultWithFavorite.password;

                                                            callback(true, "Les infos de l'utilisateur est renvoyé", resultWithFavorite);
                                                        }
                                                    })
                                                }

                                            } else {

                                                delete resultWithFavorite.password;

                                                callback(true, "Les infos de l'utilisateur est renvoyé", resultWithFavorite)

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
    },

    /**
     * Module d'activation ou désactivation de l'utilisateur
     * @param {String} id
     * @param {Function} callback
     */
    toggleUser(objet, callback) {
        try {
            admin.initialize(db);

            admin.isAdmin(objet.id_admin, (isTrue, message, resultTest) => {
                if (isTrue) {
                    findOneById(objet.id_user, (isFound, message, result) => {
                        if (isFound) {
                            var filter = {
                                    "_id": result._id
                                },
                                update = {
                                    "$set": {
                                        "flag": result.flag == true ? false : true
                                    }
                                };

                            collection.value.updateOne(filter, update, (err, resultUp) => {
                                if (err) {
                                    callback(false, "Une erreur est survenue lors de la mise à jour du flag : " +err)
                                } else {
                                    if (resultUp) {
                                        callback(true, "La mise à jour du flag est fait", resultUp)
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
            callback(false, "Une exception a été lévée lors de la mise à jour du flag : " + exception)
        }
    },

    /**
     * Certification manuel d'un freelancer
     * @param {Object} objet 
     * @param {Fucntion} callback 
     */
    certifiedFreelancer(objet, callback) {
        try {
            admin.initialize(db);

            admin.isAdmin(objet.id_admin, (isTrue, message, resultTest) => {
                if (isTrue) {
                    users.initialize(db);

                    users.setCertificate(objet, (isSet, message, result) => {
                        if (isSet) {
                            callback(true, "L'administration a procédé à votre certification manuellement", result)
                        } else {
                            callback(false, "La certification a échoué")
                        }
                    })        
                } else {
                    callback(false, message)
                }
            })
            
        } catch (exception) {
            callback(false, "Une exception a été lévée lors de la certification manuelle du freelancer : " +err)
        }
    },

    /**
     * Module de comptage de nombre d'utilisateur ayant ce métier
     * @param {ObjectConstructor} props Objet contenant les infos du métier
     * @param {Function} callback La fonction de retour
     */
    countUserForJob(props, callback) {
        try {
            collection.value.aggregate([
                {
                    "$match": {
                        "jobs.id_job": "" + props._id
                    }
                },
                { "$count": "nbreProfil"}
            ]).toArray((err, resultAggr) => {
                if (err) {
                    props.profil = 0;
                    callback(false, "Une erreur lors du comptage du nombre d'utilisateur dans un job : " +err, props)
                } else {
                    props.profil = resultAggr && resultAggr.length > 0 ? resultAggr[0].nbreProfil : 0;

                    callback(true, "Le comptage est fini !", props)
                }
            })
        } catch (exception) {
            props.profil = 0
            callback(false, "Une exception a été lévée lors du comptage du nombre d'utilisateur dans un job : " + err, props)
        }
    }
}

/**
 * La recherche d'un utilisateur via son identifiant
 * @param {String} id 
 * @param {Function} callback 
 */
const findOneById = (id, callback) => {
    collection.value.aggregate([
        {
            "$match": {
                "_id": require("mongodb").ObjectId(id)
            }
        }
    ]).toArray((err, resultAggr) => {
        if (err) {
            callback(false, "Une erreur de recherche de type : " + err)
        } else {
            if (resultAggr.length > 0) {

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
}