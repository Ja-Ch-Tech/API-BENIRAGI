var db = require("./db");

var collection = {
    value: null
};

module.exports.initialize = (db) => {
    collection.value = db.get().collection("Offer");
}

//Envoi de l'offre
module.exports.makeOffer = (newOffer, callback) => {
    try {
        module.exports.testOfferExist(newOffer.id_employer, newOffer.id_freelancer, (isTrue, message, result) => {
            if (isTrue) {
                var user = require("./Users");

                user.initialize(db);
                user.isEmployer(newOffer.id_employer, (isEmployer, message, result) => {
                    if (isEmployer) {
                        user.isEmployer(newOffer.id_freelancer, (isEmployer, message, result) => {
                            if (!isEmployer) {
                                if (newOffer.message && newOffer.message.trim(" ")) {

                                    //Sauvegarde message
                                    newOffer.messages.push({
                                        id_sender: newOffer.id_employer,
                                        message: newOffer.message,
                                        send_at: new Date()
                                    });

                                    delete newOffer.message;

                                    collection.value.insertOne(newOffer, (err, result) => {
                                        if (err) {
                                            callback(false, "Une erreur lors de l'enregistrement de l'offre : " + err)
                                        } else {
                                            if (result) {
                                                var notification = require("./Notification"),
                                                    entitySendOffer = require("./entities/Notification").SendOffer();

                                                entitySendOffer.id_offer = "" + result.ops[0]._id;
                                                entitySendOffer.id_freelancer = result.ops[0].id_freelancer;

                                                notification.initialize(db);
                                                notification.sendNotificationOffer(entitySendOffer, (isSend, message, resultSend) => {
                                                    callback(true, "L'offre a été envoyé", result.ops[0])
                                                })
                                            } else {
                                                callback(false, "Pas d'enregistrement")
                                            }
                                        }
                                    })
                                } else {
                                    callback(false, "Il vous faut ecrire un message")
                                }
                            } else {
                                callback(false, "N'est pas un freelancer")
                            }
                        })
                    } else {
                        callback(false, message)
                    }
                })

            } else {
                var notification = require("./Notification");

                notification.initialize(db);
                notification.testSendingNotificationForOffer("" + result._id, result.id_freelancer, (isTrue, message, result) => {
                    callback(isTrue, message, result)
                })
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'enregistrement de l'offre : " + exception)
    }
}

//Test si l'offre existe déjà
module.exports.testOfferExist = (id_employer, id_freelancer, callback) => {
    collection.value.aggregate([
        {
            "$match": {
                "id_employer": id_employer,
                "id_freelancer": id_freelancer,
                "type": new RegExp("send offer", "i"),
                "flag": true
            }
        }
    ]).toArray((err, resultAggr) => {
        if (err) {
            callback(false, "Une erreur lors du test de l'offre : " + err)
        } else {
            if (resultAggr.length == 0) {
                callback(true, "Permission d'en créer un nouveau")
            } else {
                callback(false, "Pas de permission", resultAggr[0])
            }
        }
    })
}

//Définir un document attaché à l'offre
//N.B: Commer d'abord l'upload puis envoyé juste l'id_media ici
module.exports.setAttachment = (newAttachement, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": newAttachement.id_offer
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de l'attachement : " +err)
            } else {
                if (resultAggr.length > 0) {
                    var media = require("./Media");

                    media.initialize(db);
                    media.findOneById(newAttachement.id_docs, (isFound, message, result) => {
                        if (isFound) {
                            var filter = {
                                    "_id": resultAggr[0]._id
                                },
                                update = {
                                    "$set": {
                                        "attachment": "" + result._id
                                    }
                                };

                            collection.value.updateOne(filter, update, (err, result) => {
                                if (err) {
                                    callback(false, "Erreur lors de la mise à jour de l'attachment : " +err)
                                } else {
                                    if (result) {
                                        callback(true, "Mise à jour de l'attachment", result)
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
                    callback(false, "Aucune offre à ce propos")
                }
            }
        })
    } catch (exception) {
        callback(false, "Exception lévée lors de la mise à jour de l'attachment : " + exception)
    }
}

//Les détails d'une offre
module.exports.getDetails = (id, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(id)
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "id_employer": 1,
                    "attachment": 1
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors la  récupération des détails de l'offre : " +err)
            } else {
                if (resultAggr.length) {
                    var user = require("./Users");
                    
                    resultAggr[0].id_user = resultAggr[0].id_employer; 
                    delete resultAggr[0].id_employer;

                    user.initialize(db);
                    user.getInfos(resultAggr[0], (isGet, message, result) => {
                        if (isGet) {
                            if (resultAggr[0].attachment) {
                                var media = require("./Media");

                                media.initialize(db);
                                media.findOneById(resultAggr[0].attachment, (isFound, message, resultWithAttachment) => {
                                    if (condition) {
                                        result.attachment = resultWithAttachment;
                                        callback(true, message, result);
                                    } else {
                                        callback(true, message, result)
                                    }
                                })
                            } else {
                                callback(true, message, result)
                            }
                        } else {
                            callback(false, message)
                        }
                    })
                } else {
                    callback(false, "Aucune information à ce propos")
                }
            }
        })
    } catch (exception) {
        
    }
}

module.exports.findOneById = (id, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(id),
                    "flag": true
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur de recherche de l'offre : " + err)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "L'offre existe", resultAggr[0])
                } else {
                    callback(false, "Aucune offre ou offre clos")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception de recherche de l'offre : " + exception)
    }
}

//Pour envoyer un message dans une offre
module.exports.sendingMessage = (newMessage, callback) => {
    try {
        this.findOneById(newMessage.id_offer, (isFound, message, result) => {
            if (isFound) {
                if (newMessage.id_sender == result.id_employer || newMessage.id_sender == result.id_freelancer) {
                    if (newMessage.message && newMessage.message.trim(" ")) {
                        
                        delete newMessage.id_offer;

                        var filter = {
                                "_id": result._id
                            },
                            update = {
                                "$push": {
                                    "messages": newMessage
                                }
                            };

                        collection.value.updateOne(filter, update, (err, resultUp) => {
                            if (err) {
                                callback(false, "Une erreur de l'envoi du message de l'offre : " +err)
                            } else {
                                if (resultUp) {
                                    var notification = require("./Notification"),
                                        entitySendMessage = require("./entities/Notification").SendMessage();

                                    entitySendMessage.id_offer = "" + result._id;
                                    entitySendMessage.id_freelancer = result.id_freelancer;

                                    notification.initialize(db);
                                    notification.sendNotificationMessage(entitySendMessage, (isSend, message, result) => {
                                        callback(true, "Message envoyé", result)
                                    })
                                } else {
                                    callback(false, "Aucun message envoyé pour cet offre")
                                }
                            }
                        })
                    } else {
                        callback(false, "Message vide, ça passe pas !")
                    }
                } else {
                    callback(false, "Vous ne faites pas partie de cet offre")
                }
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        
    }
}