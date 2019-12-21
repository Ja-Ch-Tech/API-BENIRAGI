module.exports.SendOffer = function SendOffer() {
    return {
        id_offer: String,
        id_freelancer: String,
        flag: false,
        type: "Send Offer",
        created_at: new Date()
    }
}

module.exports.SendMessage = function SendMessage() {
    return {
        id_offer: String,
        id_freelancer: String,
        flag: false,
        type: "Send Message",
        created_at: new Date()
    }
}