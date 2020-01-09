var db = require("./db");

var collection = {
    value: null
}

module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("Evaluation");
}

//Pour evaluer le freelancer
module.exports.evaluate = (newEvaluate, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_employer": newEvaluate.id_employer,
                    "id_freelancer": newEvaluate.id_freelancer,
                }
            }
        ]).toArray((err, resultAggr) => {
            if (resultAggr.length == 0) {
                var offer = require("./Offer");

                offer.initialize(db);
                offer.testOfferExist(newEvaluate.id_employer, newEvaluate.id_freelancer, (isTrue, message, resultTest) => {
                    if (isTrue) {

                        newEvaluate.inTime = newEvaluate.inTime ? 1 : 0;
                        collection.value.insertOne(newEvaluate, (err, result) => {
                            if (err) {
                                callback(false, "Une erreur lors de l'insertion de son evaluation : " + err)
                            } else {
                                if (result) {
                                    callback(true, "La note est enregister", result.ops[0])
                                } else {
                                    callback(false, "Aucun enreg.")
                                }
                            }
                        })

                    } else {
                        callback(false, "Vous ne pouvez le notez que si vous lui faites une offre dès le départ")
                    }
                })

            } else {
                var offer = require("./Offer");

                offer.initialize(db);
                offer.testOfferExist(newEvaluate.id_employer, newEvaluate.id_freelancer, (isTrue, message, resultTest) => {
                    if (isTrue) {

                        var filter = {
                                "_id": resultAggr[0]._id
                            },
                            update = {
                                "$set": {
                                    "note": parseInt(newEvaluate.note)
                                }
                            };

                        collection.value.updateOne(filter, update, (err, result) => {
                            if (err) {
                                callback(false, "Une erreur est survenue lors de la mise à jour de la note : " + err)
                            } else {
                                if (result) {
                                    callback(true, "La note a été mise à jour !", result)
                                } else {
                                    callback(false, "Aucune mise à jour")
                                }
                            }
                        })
                    } else {
                        callback(false, "La mise à jour de l'évaluation a été bloqué suite à la fin de l'offre")
                    }
                })
            }
        })
    } catch (exception) {
        callback(false, "Une exception lors de l'evaluation : " + exception)
    }
}

//Récupérer la note moyenne
module.exports.getAverageNote = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_freelancer": "" + objet._id
                }
            },
            {
                "$group": {
                    "_id": "$id_freelancer",
                    "average": {
                        "$avg": "$note"
                    },
                    "inTime": {
                        "$avg": "$inTime"
                    }
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors de la récupération de moyenne de note : " +err)
            } else {
                if (resultAggr.length > 0) {
                    objet.average = resultAggr[0].average;
                    objet.inTime = parseInt(Math.ceil(resultAggr[0].inTime * 100));
                    
                    this.getFeedBacks(objet, (isGet, message, resultWithFeedbacks) => {
                        callback(true, message, resultWithFeedbacks)
                    })
                } else {
                    objet.average = 0;
                    objet.inTime = 0;
                    callback(false, "Aucune note", objet)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception lors de la récupération de moyenne de note : " + exception)
    }
}

//Récupération des feedbacks
module.exports.getFeedBacks = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_freelancer": "" + objet._id
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la récupération des notes : " +err)
            } else {
                if (resultAggr.length > 0) {
                    var user = require("./Users"),
                        outEvaluation = 0,
                        listOut = [];

                    user.initialize(db);
                    for (let index = 0; index < resultAggr.length; index++) {
                        user.findOneById(resultAggr[index].id_employer, (isGet, message, result) => {
                            outEvaluation++;
                            if (isGet) {
                                //Suppression des datas en trop dans la réponse
                                delete result._id;
                                delete result.password;
                                delete result.id_type;
                                delete result.flag;
                                delete result.visibility;
                                delete result.created_at;
                                delete result.typeUser;

                                delete resultAggr[index]._id;
                                delete resultAggr[index].id_employer;
                                delete resultAggr[index].id_freelancer;

                                listOut.push({
                                    identity_employeur: result,
                                    evaluation: resultAggr[index]
                                });
                            }

                            if (outEvaluation == resultAggr.length) {
                                objet.feedBacks = listOut;
                                callback(true, "Les feedbacks des employeurs y sont", objet)
                            }
                        })
                    }
                } else {
                    objet.feedBacks = [];
                    callback(false, "Aucune evaluation", objet)
                }
            }
        })
    } catch (exception) {
        
    }
}

//Récupération des stats
module.exports.getStats = (id, callback) => {
    try {
        
        collection.value.aggregate([
            {
                "$match": {
                    "id_freelancer": id
                }
            },
            {
                "$group": {
                    "_id": "$id_freelancer",
                    "average": {
                        "$avg": "$note"
                    },
                    "nbreFeedBack": { "$sum": 1 }
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors du comptage des évaluation ou de la récuoération de la moyenne : " + err)
            } else {
                var objet = {};

                if (resultAggr.length > 0) {
                    objet.average = resultAggr[0].average;
                    objet.nbreFeedBack = resultAggr[0].nbreFeedBack;
                    objet.id_freelancer = resultAggr[0]._id;
                    
                    var view = require("./View");
                    
                    view.initialize(db);
                    view.getStats(objet, (isGet, message, result) => {
                        delete result.id_freelancer;
                        callback(isGet, message, result)
                    });

                } else {
                    objet.average = 0;
                    objet.nbreFeedBack = 0;
                    objet.id_freelancer = id;

                    var view = require("./View");

                    view.initialize(db);
                    view.getStats(objet, (isGet, message, result) => {
                        delete result.id_freelancer;
                        callback(isGet, message, result)
                    });
                }
            }
        })
            
    } catch (exception) {
        
    }
}

//Récupération des stats de l'employeur
module.exports.getStatsForEmployer = (id, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_employer": id
                }
            },
            {
                "$group": {
                    "_id": "$id_employer",
                    "nbreFeedBack": { "$sum": 1 }
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors du comptage des évaluation : " + err)
            } else {
                var objet = {};

                if (resultAggr.length > 0) {
                    objet.nbreFeedBack = resultAggr[0].nbreFeedBack;
                    objet.id_employer = resultAggr[0]._id;

                    var offer = require("./Offer");

                    offer.initialize(db);
                    offer.getCountForEmployer(objet, (isGet, message, resultWithOfferCount) => {
                        callback(true, "Le stats pour lui", resultWithOfferCount);
                    })

                } else {
                    objet.nbreFeedBack = 0;
                    objet.id_employer = id;
                    
                    var offer = require("./Offer");

                    offer.initialize(db);
                    offer.getCountForEmployer(objet, (isGet, message, resultWithOfferCount) => {
                        callback(true, "Le stats pour lui", resultWithOfferCount);
                    })
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors du comptage des évaluation : " + exception)
    }
}

//Module de récupération de top freelancer
module.exports.getTop = (id_viewer, limit, callback) => {
    try {
        var limitLess = limit && parseInt(limit) ? {"$limit": parseInt(limit)} : {"$match": {}};

        collection.value.aggregate([
            {
                "$group": {
                    "_id": "$id_freelancer",
                    "average": {
                        "$avg": "$note"
                    },
                    "inTime": {
                        "$avg": "$inTime"
                    }
                }
            },
            {
                "$sort": {"average": 1}
            },
            limitLess
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la récupération des top freelancer : " + err)
            } else {
                var users = require("./Users");

                users.initialize(db);

                if (resultAggr.length > 0) {
                    var outTopFreelance = 0,
                        listOut = [];

                    for (let index = 0; index < resultAggr.length; index++) {
                        resultAggr[index].id_viewer = id_viewer;
                        users.getInfosForFreelancer(resultAggr[index], (isGet, message, resultWithInfos) => {
                            outTopFreelance++;
                            if (isGet) {
                                listOut.push(resultWithInfos);
                            }

                            if (outTopFreelance == resultAggr.length) {
                                if (listOut.length == parseInt(limit)) {
                                    callback(true, "Voici le top freelancer", listOut);
                                } else {
                                    
                                    var reste = parseInt(limit) - listOut.length;
                                    users.getFreelancers(reste, "old", (isGet, message, resultOld) => {
                                        if (isGet) {
                                            var concatList = listOut.concat(resultOld);
                                            callback(true, "Voici le top freelancer avec un plus", concatList)
                                        }else{
                                            callback(true, "Voici le top freelancer avec un plus", listOut)
                                        }

                                    })
                                }
                            }
                        })
                    }
                }else {
                    users.getFreelancers(limit, "new", (isDefine, message, resultNew) => {
                        callback(isDefine, message, resultNew)
                    })
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des top freelancer : " + exception)
    }
}

//Récupération de la moyenne de ces notes dans le temps
module.exports.getAverageInTime = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_freelancer": objet._id
                }
            },
            {
                "$group": {
                    "_id": "$id_freelancer",
                    "inTime": {
                        "$avg": "$inTime"
                    }
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la moyenne de inTime : " + err)
            } else {
                if(resultAggr.length > 0) {
                    objet.inTime = resultAggr[0].inTime;
                    callback(true, "La moyenne a été faites", objet)
                }else{
                    objet.inTime = 0;
                    callback(false, "Personne n'y a défini", objet)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exceptiona a été lévée lors de la moyenne de inTime : " + exception)
    }
}