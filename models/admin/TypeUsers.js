var db = require("../db"),
    admin = require("./Admin");

var collection = {
    value: null
}

//Création des types d'utilisateurs
module.exports = {
    /**
     * Initialisation de la collection
     * @param {String} db 
     */
    initialize(db) {
        collection.value = db.get().collection("TypeUsers");
    },

    /**
     * Création d'un nouveau type de d'utilisateur
     * @param {Object} new_type_user 
     * @param {Function} callback 
     */
    create(new_type_user, callback) {
        try {

            admin.initialize(db);
            admin.isAdmin(new_type_user.id_admin, (isTrue, message, resultTest) => {
                if (isTrue) {
                    delete new_type_user.id_admin;
                    
                    collection.value.insertOne(new_type_user, (err, result) => {
                        if (err) {
                            callback(false, "Une erreur de type : " + err)
                        } else {
                            callback(true, "Enregistrer avec succès", result.ops[0])
                        }
                    })
                } else {
                    callback(false, message)
                }
            })

        } catch (exception) {
            callback(false, "Une exception sur le type : " + exception)
        }
    }
}
