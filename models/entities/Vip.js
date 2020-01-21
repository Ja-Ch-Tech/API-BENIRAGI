module.exports = {
    VIP(id_freelancer, duration) {
        return {
            id_freelancer: id_freelancer,
            flag: true,
            accept: Boolean,
            dates: {
                duration: duration
            },
            created_at: new Date()
        }
    }
}