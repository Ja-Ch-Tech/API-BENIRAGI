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
        id_sender: String,
        id_receiver: String,
        flag: false,
        type: "Send Message",
        created_at: new Date()
    }
}

module.exports.EndOffer = function EndOffer() {
    return {
        id_offer: String,
        id_resiler: String,
        flag: false,
        type: "End Offer",
        created_at: new Date()
    }
}

module.exports.VIP = function VIP(id_freelancer) {
    return {
        id_freelancer: id_freelancer,
        flag: false,
        type: "Become VIP",
        created_at: new Date()
    }
}