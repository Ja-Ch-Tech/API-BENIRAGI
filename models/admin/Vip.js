//Les importations des modules supplementaires
var db = require("../db"),
    admin = require("./Admin"),
    users = require("../Users");

var collection = {
    value: null
};

module.exports = {
    /**
     * Initialisation de la collection
     * @param {String} db 
     */
    initialize(db) {
        collection.value = db.get().collection("VIP");
    },

    /**
     * La reponse à la demande d'un freelancer de lui présenter en tant que VIP
     * @param {Object} objet 
     * @param {Function} callback 
     */
    respondToQuery(objet, callback) {
        try {
            admin.initialize(db);
            admin.isAdmin(objet.id_admin, (isTrue, message, resultTest) => {
                if (isTrue) {
                    findOneByIdAndNotTreat(objet.id_vip, (isFound, message, resultFound) => {
                        if (isFound) {
                            var filter = {
                                    "_id": resultFound._id  
                                },
                                update = {
                                    "$set": {
                                        "accept": { response: objet.response, id_admin: objet.id_admin},
                                        "dates.end": new Date().getTime() + parseInt(resultFound.dates.duration) * 30 * 24 * 60 * 60 * 1000
                                    }
                                };

                            collection.value.updateOne(filter, update, (err, resultUp) => {
                                if (err) {
                                    callback(false, "Une erreur lors de la mise à jour de la reponse accordé à la demande : " +err)
                                } else {
                                    if (resultUp) {
                                        callback(true, "La reponse de l'administration a été renvoyé", resultUp)
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
            callback(false, "Une exception a été lévée lors de la mise à jour de la reponse accordé à la demande : " + exception)
        }
    },

    /**
     * Récupération des nouvelles demande de VIP
     * @param {Object} objet 
     * @param {Function} callback 
     */
    getNewRequest(objet, callback) {
        try {
            admin.initialize(db);
            admin.isAdmin(objet.id_admin, (isTrue, message, result) => {
                if (isTrue) {
                    collection.value.aggregate([
                        {
                            "$match": {
                                "accept": {"$exists": 0}
                            }
                        }
                    ]).toArray((err, resultAggr) => {
                        if (err) {
                            callback(false, "Une erreur est survenue lors de la récupération des nouvelles demande : " +err)
                        } else {
                            if (resultAggr.length > 0) {
                                var outVip = 0,
                                    listOut = [];

                                users.initialize(db);
                                for (let index = 0; index < resultAggr.length; index++) {
                                    var format = {
                                        "_id": resultAggr[index].id_freelancer
                                    };

                                    users.getInfosForFreelancer(format, (isGet, message, resultWithData) => {
                                        outVip++;
                                        if (isGet) {
                                            listOut.push({
                                                infos: resultWithData, 
                                                id_vip: resultAggr[index]._id, 
                                                created_at: resultAggr[index].created_at
                                            })
                                        }

                                        if (outVip == resultAggr.length) {
                                            if (listOut.length > 0) {
                                                callback(true, "La liste des demandes VIP", listOut)
                                            } else {
                                                callback(false, "Aucun utilisateurs valide")
                                            }
                                        }
                                    })
                                }
                            } else {
                                callback(false, "Aucune nouvelle demande")
                            }
                        }
                    })
                } else {
                    callback(false, message)
                }
            })
        } catch (exception) {
            
        }
    }
}

/**
 * Recherche la demande de VIP qui si celui-ci n'a pas déjà été traité
 * @param {String} id 
 * @param {Function} callback 
 */
const findOneByIdAndNotTreat = (id, callback) => {
    collection.value.aggregate([
        {
            "$match": {
                "_id": require("mongodb").ObjectId(id),
                "flag": true,
                "accept": {"$exists": 0}
            }
        }
    ]).toArray((err, resultAggr) => {
        if (err) {
            callback(false, "Une erreur est survenue lors de la recherche d'une demande VIP : " +err)
        } else {
            if (resultAggr.length > 0) {
                callback(true, "La demande à été trouvé", resultAggr[0])
            } else {
                callback(false, "Aucune demande VIP ne porte cet lidentitifiant ou à déjà trouvé une reponse")
            }
        }
    })
}