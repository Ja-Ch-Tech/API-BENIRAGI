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
        if (newView.id_freelancer != newView.id_viewer) {
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
        } else {
            callback(false, "La création de la vue ne peut pas se faire sur vous même")
        }


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

//Module permettant d'y générer le graphe pour un freelancer
module.exports.graphForVisitProfileFreelancer = (id_freelancer, callback) => {
    try {
        var users = require("./Users");

        users.initialize(db);
        users.isEmployer(id_freelancer, (isEmployer, message, result) => {
            if (!isEmployer) {
                collection.value.aggregate([
                    {
                        "$match": {
                            "id_freelancer": id_freelancer
                        }
                    },
                    {
                        "$group": {
                            "_id": "$month",
                            "nbreVisite": {"$sum": 1},
                            "created_at": {
                                "$push": {
                                    "created_at": "$created_at"
                                }
                            }
                        }
                    },
                    {
                        "$sort": {"created_at.created_at": -1}
                    },
                    {
                        "$limit": 6
                    }
                ]).toArray((err, resultAggr) => {
                    if (err) {
                        callback(false, "Une erreur est survenue lors de la récupération du graph : " + err)
                    } else {
                        if (resultAggr.length > 0) {
                            var outGraph = 0,
                                listOut = [];

                            var sixNextMonth = getSixNextMonth();
                            console.log(sixNextMonth);
                            

                            for (let index = 0; index < sixNextMonth.length; index++) {

                                var item = getItem(resultAggr, sixNextMonth[index]);
                                
                                if (~sixNextMonth.indexOf(item) || !item) {
                                    var month = getMonth(sixNextMonth[index]);
                                    listOut.push({ month: month, nbreVisite: 0 })
                                } else {
                                    var month = getMonth(sixNextMonth[index]); 
                                    listOut.push({ month: month, nbreVisite: item.nbreVisite })
                                }

                                outGraph++;

                                if (outGraph == sixNextMonth.length) {
                                    callback(true, "Le graphe a été renvoyé", listOut)
                                }
                            }
                            

                        } else {
                            callback(false, "Aucune vue, donc aucun grapphe")
                        }
                    }
                })
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération du graph : " + exception)
    }
}

/**
 * Permet la rcherche d'un élément dans un tableau à une propriété spécifié
 * @param {Array} tableau Le tableau dont on cherche un élément
 * @param {Number} id L'id en question
 */
function getItem(tableau, id) {
    const item = tableau.find(item => item._id === id);

    return item;
}

/**
 * Récupération du mois en question
 * @param {Number} month Le mois en question
 */
function getMonth(month) {
    var monthLetters = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    return monthLetters[parseInt(month) - 1];
}

/**
 * Module permettant de récupérer le six prochains incluant le mois de départ
 */
function getSixNextMonth() {
    var number = parseInt(new Date().getMonth() + 1) + 6;
    var monthLetters = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
        out = [];

    for (let index = number; index <= (number + 6); index++) {
        if (index > monthLetters.length) {
            var indexReste = index - monthLetters.length;
            out.push(indexReste);
        } else {
            out.push(index)
        }
    }

    return out;
}