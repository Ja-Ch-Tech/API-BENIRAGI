module.exports.SendOffer = function SendOffer() {
    return {
        id_offer: String,
        id_freelancer: String,
        flag: false,
        type: "Send Offer",
        created_at: new Date()
    }
}