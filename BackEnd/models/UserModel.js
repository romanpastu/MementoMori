const Mongoose = require('mongoose')

const schema = new Mongoose.Schema({
    id: Number,
    birth_date : String,
    years_to_live: Number,
    death_date: String
})

const UserModel = Mongoose.model('userModels', schema)

module.exports = UserModel;