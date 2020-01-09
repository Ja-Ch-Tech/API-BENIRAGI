module.exports.Evaluation = function Evaluation() {
    return {
        id_employer: String,
        id_freelancer: String,
        note: Number,
        message: String,
        inTime: Number,
        created_at: new Date()
    }
}