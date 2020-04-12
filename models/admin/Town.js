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
        collection.value = db.get().collection("Town");
    },

    /**
     * Module des récupération des tous les villes actifs ou non
     * @param {ObjectConstructor} props L'objet de récupération des villes pour admin
     * @param {Function} callback La fonction de retour
     */
    listTown(props, callback) {
        try {
            admin.initialize(db);
            admin.isAdmin(props.admin, (isTrue, message) => {
                if (isTrue) {
                    collection.value.aggregate([
                        {
                            "$match": {}
                        }
                    ]).toArray((err, resultAggr) => {
                        if (err) {
                            callback(false, "Une erreur est survenue lors de la récupération des villes : " + err)
                        } else {
                            if (resultAggr.length > 0) {
                                var out = 0,
                                    listOut = [],
                                    users = require("./Users");

                                users.initialize(db);

                                for (let index = 0; index < resultAggr.length; index++) {
                                    users.countUserForTown(resultAggr[index], (isCount, message, resultWithCount) => {
                                        out++;
                                        listOut.push(resultWithCount);

                                        if (out == resultAggr.length) {
                                            callback(true, "Les villes sont renvoyées", listOut)
                                        }
                                    })
                                }
                            } else {
                                callback(false, "Aucune villes encore ajouté")
                            }
                        }
                    })
                } else {
                    callback(false, message)
                }
            })
        } catch (exception) {
            callback(false, "Une exception a été lévée lors de la récupération des villes : " + exception)
        }
    },

    /**
     * Module de basculement du flag de la ville
     * @param {ObjectConstructor} props L'objet de basculement
     * @param {Function} callback La fonction de retour
     */
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
                            callback(false, "Une erreur est survenue lors de la recherche du métier : " + err)
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
                                        callback(false, "Une erreur lors de la mise à jour du flag : " + err)
                                    } else {
                                        if (resultUp) {
                                            callback(true, "Mise à jour effectué !")
                                        } else {
                                            callback(false, "Aucune mise à jour !")
                                        }
                                    }
                                })

                            } else {
                                callback(false, "Cette ville n'existe pas !")
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