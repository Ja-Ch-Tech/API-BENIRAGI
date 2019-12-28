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
                    "name": { "$regex": objet.name }
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