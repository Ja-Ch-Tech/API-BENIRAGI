var db = require("../db"),
    admin = require("./Admin");

var collection = {
    value: null
};

module.exports = {
    /**
     * Initialisation de la collection
     * @param {String} db 
     */
    initialize(db) {
        collection.value = db.get().collection("Jobs");
    },

    /**
     * Création d'un nouveau metier
     * @param {Object} newJobs 
     * @param {Function} callback 
     */
    create(newJobs, callback) {
        try {
            admin.initialize(db);
            admin.isAdmin(newJobs.id_admin, (isGet, message, resultTest) => {
                if (isGet) {
                    delete newJobs.id_admin;

                    collection.value.insertOne(newJobs, (err, result) => {
                        if (err) {
                            callback(false, "Une erreur lors de l'ajout du metier : " + err)
                        } else {
                            if (result) {
                                callback(true, "Le metier est ajouté", result.ops[0])
                            } else {
                                callback(false, "Aucun enregistrement")
                            }
                        }
                    })

                } else {
                    callback(false, message)
                }
            })
            
        } catch (exception) {
            callback(false, "Une exception a été lévée lors de l'ajout du metier : " + exception)
        }
    },

    /**
     * Module des récupération des tous les métiers actifs ou non
     * @param {ObjectConstructor} props L'objet de récupération des job pour admin
     * @param {Function} callback La fonction de retour
     */
    listJobs(props, callback) {
        try {
            admin.initialize(db);
            admin.isAdmin(props.admin, (isTrue, message) => {
                if (isTrue) {
                    collection.value.aggregate([
                        {
                            "$match": {}
                        },
                        {
                            "$sort": { "created_at": -1 }
                        }
                    ]).toArray((err, resultAggr) => {
                        if (err) {
                            callback(false, "Une erreur est survenue lors de la récupération des metiers : " +err)
                        } else {
                            if (resultAggr.length > 0) {
                                var out = 0,
                                listOut = [],
                                users = require("./Users");
                                
                                users.initialize(db);
                                
                                for (let index = 0; index < resultAggr.length; index++) {
                                    users.countUserForJob(resultAggr[index], (isCount, message, resultWithCount) => {
                                        out++;
                                        listOut.push(resultWithCount);
                                        
                                        if (out == resultAggr.length) {                                            
                                            callback(true, "Les métier sont renvoyé", listOut)
                                        }
                                    })
                                }
                            } else {
                                callback(false, "Aucun Jobs encore ajouté")
                            }
                        }
                    })
                } else {
                    callback(false, message)
                }
            })
        } catch (exception) {
            callback(false, "Une exception a été lévée lors de la récupération des metiers : " + exception)
        }
    },

    toggle(props, callback) {
        try {
            admin.initialize(db);
            admin.isAdmin(props.admin, (isTrue, message, result) => {
                if (isTrue) {
                    collection.value.aggregate([
                        {
                            "$match": {
                                "_id": require("mongodb").ObjectId(props.job)
                            }
                        }
                    ]).toArray((err, resultAggr) => {
                        if (err) {
                            callback(false, "Une erreur est survenue lors de la recherche du métier : " +err)
                        } else {
                            if (resultAggr.length > 0) {
                                var filter = {
                                        "_id": resultAggr[0]._id
                                    },
                                    update = {
                                        "$set": {
                                            "flag": resultAggr[0].flag == true ? false : true
                                        }
                                    };

                                collection.value.updateOne(filter, update, (err, resultUp) => {
                                    if (err) {
                                        callback(false, "Une erreur lors de la mise à jour du flag : " +err)
                                    } else {
                                        if (resultUp) {
                                            callback(true, "Mise à jour effectué !")
                                        } else {
                                            callback(false, "Aucune mise à jour !")
                                        }
                                    }
                                })

                            } else {
                                callback(false, "Ce métier n'existe pas !")
                            }
                        }
                    })
                } else {
                    callback(false, message)
                }
            })
        } catch (exception) {
            callback(false, "Une exception a été lévée lors de la mise à jour du flag : " + exception)
        }
    }
}