module.exports = {
    Admin() {
        return {
            register: generate(),
            admin: String,
            password: String,
            created_at: new Date()
        }
    }
}

//Génération du matricule
const generate = () => {

    /**
     * Une collection des variables qui recupère chacun la valeur de retour de la fonction randomNumber()
     */
    var {
        begin,
        random1,
        random2
    } = randomNumber();

    return begin + random1 + random2;;

}

/**
 * Cette fonction permet de générer aléatoirement les cinq premier nombre du matricule 
 */
const randomNumber = () => {

    const begin = "BS_";
    var random1 = Math.floor(Math.random() * 10);

    var random2 = Math.floor(Math.random() * 10);

    return {
        begin,
        random1,
        random2
    };

}