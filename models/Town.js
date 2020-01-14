var db = require("./db");

var collection = {
    value: null
}

module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("Town");
}

//Création des villes
module.exports.create = (newTown, callback) => {
    try {
        collection.value.insertOne(newTown, (err, result) => {
            if (err) {
                callback(false, "Une erreur lors de l'insertion de la ville : " +err)
            } else {
                if (result) {
                    callback(true, "La ville a été crée", result.ops[0])
                } else {
                    callback(false, "Aucune insertion de ville")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'insertion de la ville : " + exception)
    }
}

//Récupération de toutes les villes
module.exports.getAll = (callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "flag": true
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "name": 1
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la récupération des villes : " +err)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "Les villes ont été renvoyé", resultAggr)
                } else {
                    callback(false, "Aucune ville")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des villes : " + exception)
    }
}

//La suite des récupération des infos de l'utilisateur
module.exports.getInfos = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(objet.id_town),
                    "flag": true
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur a été lévée lors de la récupération de la ville de l'utilisateur : " +err)
            } else {
                if (resultAggr.length > 0) {
                    delete objet.id_town;
                    objet.town = resultAggr[0].name;

                    callback(true, "Sa ville a été renvoyé", objet)
                } else {
                    delete objet.id_town;
                    callback(false, "Aucune ville n'a été trouvé par ces informations", objet)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une erreur a été lévée lors de la récupération de la ville de l'utilisateur : " + exception)
    }
}

//Récupère les détails d'une ville
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
                callback(false, "Une erreur de recherche de la ville : " + err)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "Ville renvoyé", resultAggr[0])
                } else {
                    callback(false, "Cette ville n'existe pas ou n'est pas autorisé")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception de recherche de la ville : " + exception)
    }
}

/**
 * La recherche via ville et métier
 */
module.exports.smartSearch = (objet, callback) => {
    try {
        if (objet.town) {
            collection.value.aggregate([
                {
                    "$match": {
                        "name": { "$regex": new RegExp(objet.town, "i") }
                    }
                },
            ]).toArray((err, resultAggr) => {
                if (err) {
                    callback(false, "Une erreur est survenue lors de la recherche du job : " + err)
                } else {
                    if (resultAggr.length > 0) {
                        callback(true, "La ville est là", resultAggr[0])
                    } else {
                        callback(false, "Nous n'avons rien trouvé")                        
                    }
                }
            })
        } else {
            callback(false, "Ville inexistant")
        }
    } catch (exception) {

    }
}