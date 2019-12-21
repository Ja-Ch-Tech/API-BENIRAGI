var db = require("./db");

var collection = {
    value: null
}

module.exports.initialize = function (db_js) {
    collection.value = db_js.get().collection("Media");
}

//Creaton du media
module.exports.create = (newMedia, callback) => {
    try {
        collection.value.insertOne(newMedia, (err, result) => {
            if (err) {
                callback(false, "Une erreur lors de l'insertion du media : " + err)
            } else {
                if (result) {
                    callback(true, "Le media a été insérer", result.ops[0])
                } else {
                    callback(false, "Aucun enregistrement")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'insertion du media :" + exception)
    }
}

//Recherche de media via _id
module.exports.findOneById = (id_media, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(id_media)
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Un erreur est survenue lors de la recherche du media : " + err)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, `Le media y est et c'est un ${resultAggr[0].for.toUpperCase()}`, resultAggr[0])
                } else {
                    callback(false, "Ce media n'existe pas")
                }
            }
        })
    } catch (exception) {
        callback(false, "Un exception a été lévée lors de la recherche du media : " + exception)
    }
}

//Récupération des infos supplémentaire
module.exports.getInfos = (objet, callback) => {
    try {
        if (objet.id_avatar) {
            module.exports.findOneById(objet.id_avatar, (isFound, message, result) => {
                delete objet.id_avatar;

                if (isFound) {
                    delete result._id;
                    objet.avatar = result;

                    var jobs = require("./Jobs");

                    jobs.initialize(db);
                    jobs.getInfos(objet, (isGet, message, resultWithJob) => {
                        callback(true, message, resultWithJob)
                    })
                } else {
                    
                    var jobs = require("./Jobs");

                    jobs.initialize(db);
                    jobs.getInfos(objet, (isGet, message, resultWithJob) => {
                        callback(true, message, resultWithJob)
                    })
                }

            })
        } else {
            var jobs = require("./Jobs");

            jobs.initialize(db);
            jobs.getInfos(objet, (isGet, message, resultWithJob) => {
                callback(true, message, resultWithJob)
            })
        }
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des info supp. : " + exception)
    }
}