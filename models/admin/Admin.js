var db = require("../db"),
    bcrypt = require("bcryptjs");

const PSWD_REGEX = /^(?=.*\d).{4,8}$/;//Le mot de passe doit comprendre entre 4 et 8 chiffres et inclure au moins un chiffre numérique.

var collection = {
    value: null
};

//Module exporter
module.exports = {
    /**
     * Initialisation de la collection
     * @param {String} db 
     */
    initialize(db) {
        collection.value = db.get().collection("Admin");
    },

    /**
     * Module d'ajout d'un nouvel admin
     * @param {Objet} newAdmin 
     * @param {Function} callback 
     */
    add(newAdmin, callback) {
        try {

            testUsername(newAdmin.admin, (isTrue) => {
                if (isTrue) {
                    var clearPswd = "AdminBeni" + newAdmin.password + "ragiService";

                    bcrypt.hash(clearPswd, 10, (err, hash) => {
                        if (err) {
                            callback(false, "Une erreur est lévée lors du hashage du mot de passe : " + err)
                        } else {
                            newAdmin.password = hash;

                            collection.value.insertOne(newAdmin, (err, result) => {
                                if (err) {
                                    callback(false, "Une erreur lors de l'ajout de l'admin : " + err)
                                } else {
                                    if (result) {
                                        delete result.ops[0].password;
                                        callback(true, "L'ajout de l'admin a été faites", result.ops[0])
                                    } else {
                                        callback(false, "Aucune insertion")
                                    }
                                }
                            })
                        }
                    })
                } else {
                    callback(false, "Ce nom d'admin a déjà été utlisé")
                }
            });

        } catch (exception) {
            callback(false, "Une exception a été lévée lors de l'ajout de l'admin : " + exception)
        }
    },

    /**
     * Permet de déterminer si l'utilisateur en argument est admin
     * @param {String} id
     * @param {Function} callback
     */
    isAdmin(id, callback) {
        try {
            collection.value.aggregate([
                {
                    "$match": {
                        "_id": require("mongodb").ObjectId(id)
                    }
                }
            ]).toArray((err, resultAggr) => {
                if (err) {
                    callback(false);
                } else {
                    return resultAggr.length > 0 ? callback(true) : callback(false);
                }
            })
        } catch (exception) {
            callback(false)
        }
    }
}

//Test si le username est déjà utilisé
function testUsername(username, callback) {
    collection.value.aggregate([
        {
            "$match": {
                "admin": new RegExp(username, "i")
            }
        }
    ]).toArray((err, resultAggr) => {
        if (err) {
            callback(false);
        } else {
            if (resultAggr.length > 0) {
                callback(false);
            } else {
                callback(true);
            }
        }
    })
}