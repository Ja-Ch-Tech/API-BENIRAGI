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
                        user.isEmployer(newOffer.id_freelancer, (isFreelancer, message, result) => {
                            if (!isFreelancer) {
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
                callback(false, "Une erreur est survenue lors de l'attachement : " + err)
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
                                    callback(false, "Erreur lors de la mise à jour de l'attachment : " + err)
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
                callback(false, "Une erreur est survenue lors la  récupération des détails de l'offre : " + err)
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
                                callback(false, "Une erreur de l'envoi du message de l'offre : " + err)
                            } else {
                                if (resultUp) {
                                    var notification = require("./Notification"),
                                        entitySendMessage = require("./entities/Notification").SendMessage();

                                    entitySendMessage.id_offer = "" + result._id;
                                    entitySendMessage.id_receiver = result.id_freelancer == newMessage.id_sender ? result.id_employer : result.id_freelancer;
                                    entitySendMessage.id_sender = newMessage.id_sender;

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

//Récupérations des messages des offres pour un utilisateur
module.exports.getAllMessagesForDifferentOffer = (id_user, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "$or": [
                        { "id_employer": id_user },
                        { "id_freelancer": id_user }
                    ]
                }
            },
            {
                "$group": {
                    "_id": "$_id",
                    "messages": {
                        "$push": {
                            "messages": "$messages"
                        }
                    },
                    "flag": { "$addToSet": {"flag" : "$flag"} }
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche des messages des offres pour ce user : " + err)
            } else {
                if (resultAggr.length) {
                    var user = require("./Users"),
                        outOffer = 0,
                        listOut = [];

                    user.initialize(db);

                    for (let index = 0; index < resultAggr.length; index++) {

                        this.getEntrants(resultAggr[index]._id, (isGet, message, resultWithEntrant) => {
                            outOffer++;
                            if (isGet) {
                                resultAggr[index].entrants = resultWithEntrant;
                                listOut.push(resultAggr[index]);
                            }

                            if (outOffer == resultAggr.length) {
                                callback(true, "Les messages sont renvoyé", listOut)
                            }

                            /*for (let indexMessage = 0; indexMessage < resultAggr[index].messages[0].messages.length; indexMessage++) {

                                resultAggr[index].messages[0].messages[indexMessage].id_user = resultAggr[index].messages[0].messages[indexMessage].id_sender;

                                user.getInfos(resultAggr[index].messages[0].messages[indexMessage], (isGet, message, result) => {
                                    outOffer++;
                                    if (isGet) {
                                        delete resultAggr[index].messages[0].messages[indexMessage].id_sender;

                                        resultAggr[index].messages[0].messages[indexMessage].infos_sender = result;
                                        
                                        listOut.push(resultAggr[index]);
                                    }

                                    if (outOffer == resultAggr.length) {
                                    }

                                })
                            }*/
                        })
                        
                    }
                } else {
                    callback(false, "Aucun message n'a été repertorié")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche des messages des offres pour ce user : " + exception)
    }
}

module.exports.getCountForEmployer = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_employer": objet.id_employer
                }
            },
            {
                "$group": {
                    "_id": "$id_employer",
                    "nbreOffer": { "$sum": 1 }
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors du comptage des évaluation : " + err)
            } else {
                var favoris = require("./Favoris");

                favoris.initialize(db);

                if (resultAggr.length > 0) {
                    objet.nbreOffer = resultAggr[0].nbreOffer;

                    favoris.countFavorite(objet, (isCount, message, resultWithFavorite) => {
                        callback(true, "Le stats pour lui", resultWithFavorite);
                    })

                } else {
                    objet.nbreOffer = 0;
                    
                    favoris.countFavorite(objet, (isCount, message, resultWithFavorite) => {
                        callback(false, message, resultWithFavorite);
                    })
                }
            }
        })
    } catch (exception) {
        
    }
}

//Récupération des offres envoyés
module.exports.gets = (id_employer, callback) => {
    try {
        var users = require("./Users");

        users.initialize(db);
        users.isEmployer(id_employer, (isTrue, message, resultTest) => {
            if (isTrue) {
                collection.value.aggregate([
                    {
                        "$match": {
                            "id_employer": id_employer
                        }
                    },
                    {
                        "$group": {
                            "_id": "$id_freelancer",
                            "nbreOffer": {"$sum": 1}
                        }
                    }
                ]).toArray((err, resultAggr) => {
                    if (err) {
                        callback(false, "Une erreur est survenue lors de la récupération des offres : " +err)
                    } else {
                        if (resultAggr.length > 0) {
                            var outFreelancer = 0,
                                listOut = [],
                                users = require("./Users");

                            users.initialize(db);
                            for (let index = 0; index < resultAggr.length; index++) {
                                resultAggr[index].id_viewer = id_employer;
                                users.getInfosForFreelancer(resultAggr[index], (isGet, message, resultWithDetails) => {
                                    outFreelancer++;
                                    if (isGet) {
                                        var feedBack = getItemForFeedback(resultWithDetails.feedBacks, resultWithDetails.id_viewer);

                                        delete resultWithDetails.feedBacks;

                                        resultWithDetails.thisFeedBack = feedBack;

                                        listOut.push({
                                            infos: resultWithDetails,
                                            nbreOffer: resultAggr[index].nbreOffer
                                        })
                                    }

                                    if (outFreelancer == resultAggr.length) {
                                        callback(true, "Les freelancers dont vous avez fait affaires", listOut)
                                    }
                                })
                            }
                        } else {
                            callback(false, "Aucune n'offre n'a été passé")
                        }
                    }
                })
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des offres : " + exception)
    }
}

function getItemForFeedback(tableau, id) {
    const itemOut = tableau.find(item => item.identity_employeur._id == id);

    return itemOut;
}

//Récupération des messages
module.exports.getMessage = (props, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(props._id.id_offer)
                }
            },
            {
                "$unwind": "$messages"
            },
            {
                "$match": {
                    "messages.id_sender": props._id.id_sender
                }
            },
            {
                "$sort": {"messages.send_at": -1}
            },
            { "$limit": 1}

        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la récupération des messages  pour la notification : " +err)
            } else {
                if (resultAggr.length > 0) {
                    var users = require("./Users"),
                        objet = {
                            id_user: resultAggr[0].messages.id_sender,
                            id_viewer: resultAggr[0].messages.id_sender
                        };

                    users.initialize(db);
                    users.getInfos(objet, (isGet, message, resultWithInfo) => {
                        if (isGet) {
                            resultWithInfo.message = resultAggr[0].messages.message;
                            callback(true, "Le message est renvoyé avec ces infos", resultWithInfo);

                        } else {
                            callback(false, message)
                        }
                        
                    })

                } else {
                    callback(false, "Aucun message n'y correspond")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des messages  pour la notification : " + exception)
    }
}

module.exports.getEntrants = (id, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": id
                }
            },
            {
                "$project": {
                    "id_employer": 1,
                    "id_freelancer": 1
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors de la récupération des participants à l'offre : " + err)
            } else {
                if (resultAggr.length > 0) {
                    //callback(true, "les participant sont récupérer", resultAggr[0])
                    var users = require("./Users"),
                        objetRetour = {};

                    users.initialize(db);
                    var employer = {
                        "id_user": resultAggr[0].id_employer,
                        "id_viewer": resultAggr[0].id_employer
                    };

                    users.getInfos(employer, (isGet, message, resultWithInfosEmployer) => {
                        if (isGet) {
                            objetRetour.employer = resultWithInfosEmployer;
                            
                            var freelancer = {
                                "id_user": resultAggr[0].id_freelancer,
                                "id_viewer": resultAggr[0].id_freelancer
                            };

                            users.getInfos(freelancer, (isGet, message, resultWithInfosFreelancer) => {
                                if (isGet) {
                                    objetRetour.freelancer = resultWithInfosFreelancer;

                                    callback(true, "Les participants sont renvoyé", objetRetour);
                                } else {
                                    callback(false, "Il faut deux participant")
                                }
                            })
                        } else {
                            callback(false, "Il faut deux participant")
                        }
                    })
                } else {
                    callback(false, "Aucun participant")
                }
            }
        })
    } catch (exception) {

    }
}

//Bloquer ou relancer la conversation
module.exports.toggleOffer = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(objet.id)
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors de la recherche de l'offre : " +err)
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
                            callback(false, "Une erreur est survenue lors du toggle de l'offre : " + err)
                        } else {
                            if (resultUp) {
                                if (resultAggr[0].flag == false) {
                                    var notifier = require("./Notification"),
                                        entityEndOffer = require("./entities/Notification").EndOffer();

                                    entityEndOffer.id_offer = "" + resultAggr[0]._id;
                                    entityEndOffer.id_resiler = objet.id_resiler;

                                    notifier.sendNotificationOffer(entityEndOffer, (isSend, message, result) => {
                                        callback(true, message, {flag: false})
                                    })
                                } else {
                                    callback(true, "La conversation a été rélancé", {flag: true})
                                }

                            } else {
                                callback(false, "Aucune mise à jour")
                            }
                        }
                    })
                } else {
                    callback(false, "Aucune offre n'y correspond")
                }
            }
        })
            
    } catch (exception) {
        
    }
}