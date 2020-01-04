module.exports.Favoris = function Favoris(id_freelancer, id_employer) {
    return {
        id_freelancer: id_freelancer,
        id_employer: id_employer,
        flag: true,
        created_at: new Date()
    }
}