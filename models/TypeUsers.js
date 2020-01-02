var db = require("./db");

var collection = {
    value: null
}

//Pour initialisation
module.exports.initialize = (db) => {

    collection.value = db.get().collection("TypeUsers");
}

//Récupération des types des utilisateurs
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
                    "intitule": 1,
                    "describe": 1,
                    "icon": 1
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Erreur de recupération des types : " + err)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "les resultats", resultAggr)
                } else {
                    callback(false, "Il nl'y en a aucun")
                }
            }
        })
    } catch (exception) {
        callback(false, "Exception lors de la recupération des types : " + exception)
    }
}

module.exports.findOne = (id, callback) => {
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
                callback(false, "Une erreur de recherche de type : " + err)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "Le type y est", resultAggr[0])
                } else {
                    callback(false, "Ce type n'existe pas ou n'est pas autorisé")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception de recherche de type : " + exception)
    }
}

//Détermine le types d'un user
module.exports.isEmployer = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(objet.id_type),
                    "intitule": new RegExp("Employeur", "i")
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur de détermination : " + err)
            } else {
                if (resultAggr.length) {
                    objet.isEmployer  = true;
                    callback(true, "Est employeur", objet)
                } else {
                    objet.isEmployer  = false;
                    callback(false, "N'est pas employeur", objet)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception de détermination : " + exception)
    }
}

//Récupère le type de l'utilisateur
module.exports.getTypeForUser = (obj, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(obj.id_type)
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "intitule": 1
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors de la récupération du type de l'utilisateur : " +err)
            } else {
                if (resultAggr.length > 0) {

                    obj.typeUser = resultAggr[0].intitule;
                    callback(true, `L'utilisateur existe en tant que ${obj.typeUser}`, obj)
                } else {
                    callback(false, "Pas de type pour cela")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération du type de l'utilisateur : " + exception)
    }
}