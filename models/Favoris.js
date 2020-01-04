var db = require("./db");

var collection = {
    value: null
}

module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("Favoris");
}

//Pour définir ou faire viré de ces favoris
module.exports.set = (newFavoris, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_freelancer": newFavoris.id_freelancer,
                    "id_employer": newFavoris.id_employer
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une errreur est survenue lors de la recherche du favoris : " +err)
            } else {
                if (resultAggr.length > 0) {
                    var filter = {
                            "id_freelancer": newFavoris.id_freelancer,
                            "id_employer": newFavoris.id_employer
                        },
                        update = {
                            "$set": {
                                "flag": resultAggr[0].flag ? false : true
                            }
                        };

                    collection.value.updateOne(filter, update, (err, resultUp) => {
                        if (err) {
                            callback(false, "Une erreur est survenue lors de la mise à jour de ses favoris : " + err)
                        } else {
                            if (resultUp) {
                                callback(true, "Favoris mise à jour", resultUp)
                            } else {
                                callback(false, "Aucune mise à jour faites")
                            }
                        }
                    })
                } else {
                    var users = require("./Users");

                    users.initialize(db);
                    users.isEmployer(newFavoris.id_employer, (isTrue, message, resultTest) => {
                        if (isTrue) {
                            users.isEmployer(newFavoris.id_freelancer, (isTrue, message, resultTest) => {
                                if (!isTrue) {
                                    collection.value.insertOne(newFavoris, (err, result) => {
                                        if (err) {
                                            callback(false, "Une erreur lors de l'ajout dans les favoris : " +err)
                                        } else {
                                            if (result) {
                                                callback(true, "L'ajout dans le favoris est effectif", result.ops[0])
                                            } else {
                                                callback(false, "Aucune insertion")
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
                }
            }
        })
    } catch (exception) {
        
    }
}