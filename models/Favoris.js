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

//Détermine si oui ou non le freelancer est dans le favoris de l'employeur actuellement connecté
module.exports.isThisInFavorite = (objet, callback) => {
    try {
        if (objet.id_viewer && objet.id_viewer != null) {
            var users = require("./Users");

            users.initialize(db);
            users.isEmployer(objet.id_viewer, (isTrue, message, resultTest) => {
                if (isTrue) {
                    collection.value.aggregate([
                        {
                            "$match": {
                                "id_employer": objet.id_viewer,
                                "id_freelancer": "" + objet._id
                            }
                        }
                    ]).toArray((err, resultAggr) => {
                        if (err) {
                            objet.isThisInFavorite = false;
                            callback(false, "Une erreur lors de la récupération du favoris : " + err, objet)
                        } else {
                            if (resultAggr.length > 0) {
                                objet.isThisInFavorite = true;
                                callback(false, "Est pas dans ces favoris", objet)
                            } else {
                                objet.isThisInFavorite = false;
                                callback(false, "N'est pas dans ces favoris", objet)
                            }
                        }
                    })
                } else {
                    objet.isThisInFavorite = false;
                    callback(false, "N'est pas dans ces favoris", objet)
                }
            })
        } else {
            objet.isThisInFavorite = false;
            callback(false, "N'est pas dans ces favoris", objet)
        }
        
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la détermination des favoris : " +exception)
    }
}

//Module de récupération de tous les favoris d'un employeur
module.exports.favorisForEmployer = (id_employer, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_employer": id_employer,
                    "flag": true
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors de la récupération des favoris d'un employeur : " +err)
            } else {
                if (resultAggr.length > 0) {
                    var users = require("./Users"),
                        outUsers = 0,
                        listOut = [];

                    users.initialize(db);

                    for (let index = 0; index < resultAggr.length; index++) {
                        resultAggr[index]._id = resultAggr[index].id_freelancer;
                        resultAggr[index].id_viewer = resultAggr[index].id_employer;

                        users.getInfosForFreelancerWithAllData(resultAggr[index], (isGet, message, resultWithInfos) => {
                            outUsers++;
                            if (isGet) {
                                delete resultWithInfos.feedBacks;
                                listOut.push(resultWithInfos)
                            }

                            if (outUsers == resultAggr.length) {
                                callback(true, "Les freelancers en favoris sont renvoyé", listOut)
                            }
                        })    
                    }

                } else {
                    callback(false, "Aucun favoris")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des favoris d'un employeur : " + exception)
    }
}

module.exports.countFavorite = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_employer": objet.id_employer,
                    "flag": true
                }
            },
            {
                "$count": "nbreFavoris"
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors du comptage des favoris : " +err)
            } else {
                if (resultAggr.length > 0) {
                    objet.nbreFavoris = resultAggr[0].nbreFavoris;
                    callback(true, "Les favoris sont comptés", objet)
                } else {
                    objet.nbreFavoris = 0;
                    callback(false, "Aucun favoris", objet)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors du comptage des favoris : " + exception)
    }
}