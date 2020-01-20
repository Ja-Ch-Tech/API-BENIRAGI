var db = require("../db"),
    admin = require("./Admin");

var collection = {
    value: null
};

module.exports = {
    /**
     * Initialisation de la collection
     * @param {String} db 
     */
    initialize(db) {
        collection.value = db.get().collection("Jobs");
    },

    /**
     * Création d'un nouveau metier
     * @param {Object} newJobs 
     * @param {Function} callback 
     */
    create(newJobs, callback) {
        try {
            admin.initialize(db);
            admin.isAdmin(newJobs.id_admin, (isGet, message, resultTest) => {
                if (isGet) {
                    delete newJobs.id_admin;

                    collection.value.insertOne(newJobs, (err, result) => {
                        if (err) {
                            callback(false, "Une erreur lors de l'ajout du metier : " + err)
                        } else {
                            if (result) {
                                callback(true, "Le metier est ajouté", result.ops[0])
                            } else {
                                callback(false, "Aucun enregistrement")
                            }
                        }
                    })

                } else {
                    callback(false, message)
                }
            })
            
        } catch (exception) {
            callback(false, "Une exception a été lévée lors de l'ajout du metier : " + exception)
        }
    }
}