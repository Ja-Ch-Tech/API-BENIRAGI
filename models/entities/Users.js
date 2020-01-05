module.exports.Users = function Users() {
    return {
        email: String,
        password: String,
        id_type: String,
        flag: false,
        visibility: false,
        created_at: new Date()
    }
}

module.exports.Identity = function Identity(id_user) {
    return {
        id_user: id_user,
        name: String,
        lastName: String,
        postName: String,
        phoneNumber: String,
        created_at: new Date() 
    }
}

module.exports.Job = function Job(id_user) {
    return  {
        id_user: id_user,
        id_job: String
    }
}

module.exports.Bio = function Bio(id_user) {
    return {
        id_user: id_user,
        bio: String
    }
}

module.exports.Avatar = function Avatar(id_user) {
    return {
        id_user: id_user,
        id_avatar: String
    }
}

module.exports.Docs = function Docs(id_user) {
    return {
        id_user: id_user,
        id_docs: String
    }
}

module.exports.Skills = function Skills(id_user) {
    return {
        id_user: id_user,
        skills: Array
    }
}

module.exports.Town = function Town(id_user) {
    return {
        id_user: id_user,
        id_town: String
    }
}

module.exports.Attachment = function Attachment(id_user) {
    return {
        id_user: id_user,
        attachment: String
    }
}

module.exports.HourlyRate = function HourlyRate(id_user) {
    return {
        id_user: id_user,
        rate: String
    }
}