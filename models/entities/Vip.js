module.exports = {
    VIP(id_freelancer) {
        return {
            id_freelancer: id_freelancer,
            flag: true,
            accept: Boolean,
            dates: {
                duration: 3
            },
            created_at: new Date()
        }
    }
}