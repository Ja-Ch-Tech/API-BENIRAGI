var mongodb = require("mongodb");

var state = {
    db: null
}

//Connexion à la base de données
module.exports.connect = (url, callback) => {

    if (state.db) {
        callback(true, "Une connexion existe déjà!");
    } else {

        if (url) {
            mongodb.MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
                if (err) {
                    callback(false, "Une erreur est survenue lors de la connection : " + err);
                } else {

                    state.db = client.db("Beniragi");
                    callback(true, ">>> Connexion établie avec la base de données de BENIRAGI...")
                }
            })
        } else {
            callback(false, "La chaine de connexion est null");
        }
    }
}

//Récupération de la base de données courant
module.exports.get = () => {
    return state.db;
}