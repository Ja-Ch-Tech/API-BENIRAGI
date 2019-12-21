module.exports.Evaluation = function Evaluation() {
    return {
        id_employer: String,
        id_freelancer: String,
        note: Number,
        message: String,
        created_at: new Date()
    }
}