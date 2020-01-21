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