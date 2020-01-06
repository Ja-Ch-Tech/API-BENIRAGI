var db = require("./db");

var collection = {
    value: null
}

module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("Skills");
}

//Création d'un skill
module.exports.create = (newSkill, callback) => {
    try {
        collection.value.insertOne(newSkill, (err, result) => {
            if (err) {
                callback(false, "Une erreur lors de l'insertion du skills : " +err)
            } else {
                if (result) {
                    callback(true, "Le skill a été insérer", result.ops[0])
                } else {
                    callback(false, "Aucune insertion")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'insertion du skills : " + exception)
    }
}

//Petite recherche lors de l'insertion du skills
module.exports.smallSearch = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_job": objet.id_job,
                    "name": { "$regex": new RegExp(objet.name, "i") }
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche du skills : " +err)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "Le skills a été trouvé", resultAggr[0])
                } else {
                    var entity = require("./entities/Skills").Skills();

                    entity.id_job = objet.id_job;
                    entity.name = objet.name;

                    this.create(entity, (isCreated, message, result) => {
                        callback(isCreated, message, result)
                    })
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche du skills : " + exception)
    }
}

module.exports.findOne = (id, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(id)
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la recherche du skills : " +err)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "Le skills est renvoyé", resultAggr[0])
                } else {
                    callback(false, "Le skills n'est pas trouvé")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la recherche du skills : " +exception)
    }
}

//Recherche d'auto-completion
module.exports.autoComplete = (objet, callback) => {
    try {
        var users = require("./Users");

		users.initialize(db);
        users.isEmployer(objet.id_freelancer, (isTrue, message, result) => {
            if (!isTrue) {
                if (result.jobs.id_job) {
                    collection.value.aggregate([
                        {
                            "$match": {
								"id_job": result.jobs.id_job,
                                "name": { "$regex": new RegExp(objet.name, "i") }
                            }
                        }
                    ]).toArray((err, resultAggr) => {
                        if (err) {
                            callback(false, "Une erreur est survenue lors de la recherche d'autocompletion : " + err)
                        } else {
                            if (resultAggr.length > 0) {
								callback(true, "L'autocompletion fini", resultAggr)
							} else {
								callback(false, "Si vous valider cela ça aura pour effet l'ajout de ce skills dans votre metier ")
							}
                        }
                    })
                } else {
                    callback(false, "Veuillez d'abord définir un job")
                }
                
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
		callback(false, "Une exception a été lévée lors de la recherche d'autocompletion : " + exception)
    }
}