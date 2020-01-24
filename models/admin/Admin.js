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
                    resultAggr.length > 0 ? callback(true) : callback(false);
                }
            })
        } catch (exception) {
            callback(false)
        }
    },
    
    /**
     * Le module permettant de connecter un administrateur
     * @param {Object} objet 
     * @param {Function} callback 
     */
    login(objet, callback) {
        try {
            collection.value.aggregate([{
                "$match": {
                    "admin": objet.admin
                }
            },
            {
                "$project": {
                    "password": 1
                }
            }
            ]).toArray(function (errAggr, resultAggr) {

                if (errAggr) {
                    callback(false, "Une erreur est survenue lors de la connexion de l'utilisateur : " + errAggr);
                } else {

                    if (resultAggr.length > 0) {

                        var clearPwd = "AdminBeni" + objet.password + "ragiService";

                        bcrypt.compare(clearPwd, resultAggr[0].password, function (errCompareCrypt, resultCompareCrypt) {


                            if (errCompareCrypt) {
                                callback(false, "Une erreur est survenue lors du décryptage du mot de passe : " + errCompareCrypt);
                            } else {
                                if (resultCompareCrypt) {

                                    var id_admin = "" + resultAggr[0]._id,
                                        username = resultAggr[0].admin,
                                        objetRetour = {
                                            "id_admin": id_admin,
                                            "username": username
                                        };

                                    callback(true, "Vous êtes connectés", objetRetour)

                                } else {
                                    callback(false, "Le mot de passe est incorrect");
                                }
                            }
                        });

                    } else {
                        callback(false, "Username incorrect");
                    }
                }
            })
        } catch (exception) {
            callback(false, "Une exception a été lévée lors de la connexion du user : " + exception);
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