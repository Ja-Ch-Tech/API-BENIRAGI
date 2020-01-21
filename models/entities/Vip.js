module.exports = {
    VIP(id_freelancer) {
        return {
            id_freelancer: id_freelancer,
            flag: true,
            accept: Boolean,
            dates: {
                duration: Number
            },
            created_at: new Date()
        }
    }
}