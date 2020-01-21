var db = require("./db");

var collection = {
    value: null
}

module.exports.initialize = (db) => {
    collection.value = db.get().collection("VIP");
}

//Demande à devenir un VIP
module.exports.becomeVIP = (newVIP, callback) => {
    try {
        var users = require("./Users");

        users.initialize(db);
        users.isEmployer(newVIP.id_freelancer, (isTrue, message, result) => {
            if (!isTrue) {
                collection.value.insertOne(newVIP, (err, result) => {
                    if (err) {
                        callback(false, "Une erreur est survenue lors de la passation de la demande de devenir un VIP : " +err)
                    } else {
                        if (result) {
                            callback(true, "Votre demande a été envoyé", result.ops[0])
                        } else {
                            callback(false, "Aucune insertion d'un VIP")
                        }
                    }
                })
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la passation de la demande de devenir un VIP : " + exception)
    }
}

//Récupération de la liste des VIP valable à afficher 
module.exports.getVIP = (limit, callback) => {
    try {
        var formatLimit = limit && parseInt(limit) ? { "$limit": parseInt(limit) } : { "$match": {} };

        collection.value.aggregate([
            {
                "$match": {
                    "dates.end" : { "$gte" : new Date().getTime() },
                    "flag": true,
                    "accept": { "$exists": 1},
                    "accept.response": true
                }
            },
            {
                "$sort": { "created_at": 1 }
            },
            formatLimit
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche de la liste des VIP : " +err)
            } else {
                if (resultAggr.length > 0) {
                    var users = require("./Users"),
                        outVip = 0,
                        listOut = [];

                    users.initialize(db);
                    for (let index = 0; index < resultAggr.length; index++) {
                        var format = {
                            "_id": resultAggr[index].id_freelancer
                        };

                        users.getInfosForFreelancer(format, (isGet, message, resultWithData) => {
                            outVip++;
                            if (isGet) {
                                resultWithData.feedBacks ? delete resultWithData.feedBacks : null;
                                resultWithData.expires = new Date(resultAggr[index].dates.end);

                                listOut.push(resultWithData);
                            }

                            if (outVip == resultAggr.length) {
                                if (listOut.length > 0) {
                                    callback(true, "Voici la liste des VIP-BENIRAGI", listOut)
                                } else {
                                    callback(false, "Selon les critères d'affichage d'un freelancer nous n'avons trouvé aucun qui ait donné la permission d'affichage")
                                }
                            }
                        })
                    }
                } else {
                    callback(false, "Aucun VIP")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche de la liste des VIP : " + exception)
    }
}