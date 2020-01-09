var db = require("./db");

var collection = {
    value: null
}

module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("Notifications");
}

//Envoi de la notification de l'offre au freelancer
module.exports.sendNotificationOffer = (newOffer, callback) => {
    try {
        collection.value.insertOne(newOffer, (err, result) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la sauvegarde de la notification de l'offre : " +err)
            } else {
                if (result) {
                    callback(true, "La notification a été enregistrer")
                } else {
                    callback(false, "Aucune enregistrement")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la sauvegarde de la notification de l'offre : " + exception)
    }
}

//Test l'envoi de la notification
module.exports.testSendingNotificationForOffer = (id_offer, id_freelancer,  callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_offer": id_offer
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Erreur lors du test de notification : " +err)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "La notification a été envoyé")
                } else {
                    var entity = require("./entities/Notification").SendOffer();

                    entity.id_offer = id_offer;
                    entity.id_freelancer = id_freelancer;

                    this.sendNotificationOffer(entity, (isSend, message, result) => {
                        callback(isSend, "La notification a été renvoyée", result)
                    })
                }
            }
        })
    } catch (exception) {
        callback(false, "Exception lors du test de notification : " + exception)
    }
}

//Les notifications d'offre pour un freelancer
module.exports.getOfferForFreelancer = (id_freelancer, limit, callback) => {
    try {
        var limit = limit && parseInt(limit) ? {"$limit": parseInt(limit)} : {"$match": {}};
        collection.value.aggregate([
            {
                "$match": {
                    "id_freelancer": id_freelancer,
                    "flag": false,
                    "type": new RegExp("send offer", "i")
                }
            },
            {
                "$sort": {
                    "created_at": -1
                }
            },
            limit
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors de la récupération des notifications du freelancer : " + err)
            } else { 
                if (resultAggr.length > 0) {
                    var offer = require("./Offer"),
                        outOffer = 0,
                        listOut = [];
                    
                    offer.initialize(db);
                    
                    for (let index = 0; index < resultAggr.length; index++) {
                        offer.getDetails(resultAggr[index].id_offer, (isGet, message, result) => {
                            outOffer++;
                            if (isGet) {
                                listOut.push(result)
                            }

                            if (outOffer == resultAggr.length) {
                                callback(true, "Les notifications pour ce freelancer sont renvoyé", listOut)
                            }
                        })
                    }
                } else {
                    callback(false, "Aucune notification")
                }
            }
        })
    } catch (exception) {
        
    }
}

//Envoi de la notification 
module.exports.sendNotificationMessage = (newMessage, callback) => {
    try {
        collection.value.insertOne(newMessage, (err, result) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la sauvegarde de la notification du message : " + err)
            } else {
                if (result) {
                    callback(true, "La notification a été enregistrer")
                } else {
                    callback(false, "Aucune enregistrement")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la sauvegarde de la notification du message : " + exception)
    }
}

//Les notifications de message pour un freelancer
module.exports.getNewMessageNotRead = (id_user, limit, callback) => {
    try {
        var limit = limit && parseInt(limit) ? { "$limit": parseInt(limit) } : { "$match": {} };
        collection.value.aggregate([
            {
                "$match": {
                    "id_receiver": id_user,
                    "flag": false,
                    "type": new RegExp("send message", "i")
                }
            },
            {
                "$group": {
                    "_id": {
                        "id_receiver": "$id_receiver",
                        "id_sender": "$id_sender",
                        "id_offer": "$id_offer"
                    },
                    "data": {
                        "$push": {
                            "created_at": "$created_at",
                            "_id": "$_id"
                        }
                    },
                    "nbreMessage": {"$sum": 1}
                }
            },
            {
                "$sort": {
                    "data.created_at": -1
                }
            },
            limit
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors de la récupération des notifications du freelancer : " + err)
            } else {
                if (resultAggr.length > 0) {
                    var outMessage = 0,
                        listOut = [],
                        offer = require("./Offer");

                    offer.initialize(db);
                    for (let index = 0; index < resultAggr.length; index++) {
                        offer.getMessage(resultAggr[index], (isGet, message, resultToLast) => {
                            outMessage++;
                            if (isGet) {
                                resultToLast.otherMessageNotRead = resultAggr[index].nbreMessage - 1;
                                resultToLast.send_at = resultAggr[index].data[0].created_at;
                                resultToLast._id = "" + resultAggr[index].data[0]._id;

                                //Suppression des données en surplus
                                resultToLast.bio ? delete resultToLast.bio : "";
                                resultToLast.feedBacks ? delete resultToLast.feedBacks : "";
                                resultToLast.flag ? delete resultToLast.flag : "";
                                resultToLast.hourly ? delete resultToLast.hourly : "";
                                resultToLast.skills ? delete resultToLast.skills : "";
                                resultToLast.town ? delete resultToLast.town : "";

                                listOut.push(resultToLast);
                            }

                            if (outMessage == resultAggr.length) {
                                callback(true, "Les messages y sont", listOut)
                            }
                        })
                    }
                } else {
                    callback(false, "Aucune notification")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des notifications du freelancer : " + exception)
    }
}

//Marqué une notification lue
module.exports.setAlreadyRead = (id, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(id)
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors de la récupération de la notification : " + err)
            } else {
                if (resultAggr.length > 0) {
                    var filter = {
                            "_id": resultAggr[0]._id
                        },
                        update = {
                            "$set": {
                                "flag": true
                            }
                        };

                    collection.value.updateOne(filter, update, (err, resultUp) => {
                        if (err) {
                            callback(false, "Une erreur lors de la désactivation de la notification : " +err)
                        } else {
                            callback(true, "La notification a été lue", resultUp)
                        }
                    })
                } else {
                    callback(false, "Notification inéxistant")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération de la notification : " + exception)
    }
}