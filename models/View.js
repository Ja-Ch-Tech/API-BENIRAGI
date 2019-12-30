var db = require("./db");

var collection = {
    value: null
}

module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("View");
}

//Création d'une vue de profile
module.exports.create = (newView, callback) => {
    try {
        var users = require("./Users");

        users.initialize(db);
        users.isEmployer(newView.id_freelancer, (isEmployer, message, result) => {
            if (!isEmployer) {
                if (!/anonyme|anonymous|anonymes/i.test(newView.id_viewer)) {

                    users.findOneById(newView.id_viewer, (isFound, message, result) => {
                        if (isFound) {
                            insertView(newView, (isInsert, message, result) => {
                                callback(isInsert, message, result)
                            })
                        } else {
                            callback(false, message)
                        }
                    })
                } else {
                    insertView(newView, (isInsert, message, result) => {
                        callback(isInsert, message, result)
                    })
                }
            } else {
                callback(false, message)
            }
        })
        
    } catch (exception) {
        callback(false, "Une exception a été lévé lors de l'insertion de la vue : " + exception)
    }
}

//Fonction pour l'insertion de la vue
function insertView(objet, callback) {
    collection.value.insertOne(objet, (err, result) => {
        if (err) {
            callback(false, "Une erreur lors de l'insertion de la vue : " + err)
        } else {
            if (result) {
                callback(true, "L'insertion de la vue a été faite", result.ops[0])
            } else {
                callback(false, "Aucune insertion")
            }
        }
    })
}


//La suite des récupérations des stats
module.exports.getStats = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_freelancer": objet._id
                }
            },
            {
                "$count": "nbreView"
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors du comptage des vues : " + err)
            } else {
                if (resultAggr.length > 0) {
                    objet.nbreView = resultAggr[0].nbreView;
                    callback(true, "Les vues ont été renvoyé", objet)
                } else {
                    objet.nbreView = 0;
                    callback(false, "Aucune vue", objet);
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée du comptage des vues : " + exception)
    }
}