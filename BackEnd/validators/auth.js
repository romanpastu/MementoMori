const { check } = require('express-validator')

exports.userLoginValidator = [
    check('email')
        .isEmail()
        .withMessage('Must be a valid email address'),
    check('password')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
        .withMessage("Must have a minimum of 8 characters, containing at least one uppercase, one lowercase, and a special character")
]