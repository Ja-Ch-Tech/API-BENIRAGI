var db = require("./db");

var collection = {
    value: null
};

module.exports.initialize = (db) => {
    collection.value = db.get().collection("Jobs");
}

//Récupération des métier
module.exports.getJobs = (limit, callback) => {
    try {
        var limit = limit && parseInt(limit) ? {"$limit": parseInt(limit)} : {"$match": {}};

        collection.value.aggregate([
            {
                "$match": {}
            },
            limit,
            {
                "$sort": { "created_at": -1 }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors de la récupération des metier : " +err)
            } else {
                if (resultAggr.length > 0) {
                    var users = require("./Users"),
                        outJobs = 0,
                        listJobs = [];

                    users.initialize(db);

                    for (let index = 0; index < resultAggr.length; index++) {
                        users.countUsersForJobs(resultAggr[index], (isCount, message, result) => {
                            outJobs++;
                            listJobs.push(result);

                            if (outJobs == resultAggr.length) {
                                callback(true, "Les metiers sont renvoyés", resultAggr)
                            }
                        })
                    }

                } else {
                    callback(false, "Aucun metier")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exceptiona été lévée de la récupération des metier : " + exception)
    }
}

//Recherche d'un job
module.exports.findOneById = (id, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(id)
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche du job : " +err)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "Le job y est", resultAggr[0])
                } else {
                    callback(false, "Ce job n'existe pas")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exceptiona été lévée lors de la recherche du job : " + exception)
    }
}

//Recherche intelligent d'un job
module.exports.searchJob = (value, callback) => {
    try {
        collection.value([
            {
                "$match": {
                    "$or": [
                        {"name": new RegExp(value, "i")},
                        {"describe": new RegExp(value, "i")}
                    ]
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "name": 1,
                    "icon": 1,
                    "describe": 1
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors de la recherche du job : " +err)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "Voici les jobs", resultAggr)
                } else {
                    callback(false, "Aucun job n'y correspond")
                }
            }
        })
    } catch (exception) {
        
    }
}

//Récupération des infos supplémentaire
module.exports.getInfos = (objet, callback) => {
    try {
        if (objet.jobs && objet.jobs.id_job) {
            module.exports.findOneById(objet.jobs.id_job, (isFound, message, result) => {
            
                if (isFound) {
                    objet.job = result;
                    
                    callDocs(objet, (isCall, message, result) => {
                        callback(isCall, message, result);
                    })

                } else {
                    callDocs(objet, (isCall, message, result) => {
                        callback(false, message, result);
                    })
                }

            })
        } else {
            callDocs(objet, (isCall, message, result) => {
                callback(false, message, result);
            })
        }
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des info supp. : " + exception)
    }
}

//Pour ajouter les documents
function callDocs(obj, callback) {
    if (obj.docs && obj.docs.length > 0) {
        var media = require("./Media"),
            outDocs = 0,
            listDocs = [];

        media.initialize(db);

        for (let index = 0; index < obj.docs.length; index++) {
            media.findOneById(obj.docs[index].id_docs, (isFound, message, result) => {
                outDocs++;
                if (isFound) {
                    listDocs.push(result)
                }

                if (outDocs == obj.docs) {
                    delete obj.docs;
                    obj.docs = listDocs;
                    
                    var evaluation = require("./Evaluation");

                    evaluation.initialize(db);
                    evaluation.getAverageNote(obj, (isGet, message, resultWithAverage) => {
                        callback(true, message, resultWithAverage)
                    })
                }
            })
        }
    } else {
        var evaluation = require("./Evaluation");

        evaluation.initialize(db);
        evaluation.getAverageNote(obj, (isGet, message, resultWithAverage) => {
            callback(true, message, resultWithAverage)
        })
    }
}