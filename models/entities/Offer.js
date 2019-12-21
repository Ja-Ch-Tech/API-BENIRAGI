module.exports.Offer = function Offer() {
    return {
        id_employer: String,
        id_freelancer: String,
        messages: [],
        flag: true,
        created_at: new Date()
    }
}

module.exports.Attachments = function Attachments() {
    return {
        id_offer: String,
        id_docs: String
    }
}