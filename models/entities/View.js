module.exports.View = function View(id_freelancer, id_viewer) {
    return {
        id_freelancer: id_freelancer,
        id_viewer: id_viewer ? id_viewer : "Anonyme",
        created_at: new Date(),
        month: `${new Date().getMonth() + 1}/${new Date().getFullYear()}`
    }
}