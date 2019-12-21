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
                    }
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors de la récupération de moyenne de note : " +err)
            } else {
                if (resultAggr.length > 0) {
                    objet.average = resultAggr[0].average;
                    callback(true, "La note moyenne", objet)
                } else {
                    objet.average = 0;
                    callback(false, "Aucune note", objet)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception lors de la récupération de moyenne de note : " + exception)
    }
}