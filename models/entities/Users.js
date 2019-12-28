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

module.exports.Identity = function Identity() {
    return {
        name: String,
        lastName: String,
        postName: String,
        phoneNumber: String,
        created_at: new Date() 
    }
}

module.exports.Job = function Job() {
    return  {
        id_user: String,
        id_job: String
    }
}

module.exports.Avatar = function Avatar() {
    return {
        id_user: String,
        id_avatar: String
    }
}

module.exports.Docs = function Docs() {
    return {
        id_user: String,
        id_docs: String
    }
}

module.exports.Skills = function Skills() {
    return {
        id_user: String,
        skills: Array
    }
}