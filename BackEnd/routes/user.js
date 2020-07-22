const express = require('express')
const router = express.Router()
const { db } = require('../database/database')
const PQ = require('pg-promise').ParameterizedQuery
const { requireLogin } = require("../controllers/auth")
const { decode } = require('jsonwebtoken')
var moment = require('moment');
moment().format();

//for user
/**
 * @swagger
 * /user/update:
 *  post:
 *    security:
 *       - Bearer: []
 *    description: Updates an user given an accesstoken
 *    produces:
 *       - Status code
 *    parameters:
 *       - id: User id
 *         description: The user id
 *         in: request parameter
 *         required: true
 *       - id: First Name
 *         required: true
 *         in: Form Data
 *       - id: Second Name
 *         required: true
 *         in: Form Data
 *       - id: Email
 *         required: true
 *         in: Form Data
 *       - id: Password 1
 *         in: Form Data
 *       - id: Password 2
 *         in: Form Data
 *    responses:
 *      '200':
 *        description: User updated properly.
 *      '402':
 *        description: Invalid Names.
 *      '401':
 *        description: Invalid Mail.
 *      '403':
 *        description: Passwords dont match.
 *      '404':
 *        description: Weak password
 *      '405':
 *        description: Error / DB Error.
 */
router.post('/update', requireLogin, function (req, res) {
    const authorization = req.headers['authorization'];
    if (authorization == undefined) {
        res.send("provide a valid token")
    }
    const token = authorization.split(' ')[1];
    var decoded = decode(token, { complete: true });
    var userId = decoded.payload.userId

    const { firstName, secondName, mail, password1, password2 } = req.body


    if (firstName == "" || secondName == "") {
        res.status(402).send("invalid names")
        throw new Error("invalid names");
    }

    //checks if the mail is valid
    if ((mail.match(/@/g) || []).length != 1) {
        res.status(401).send("invalid mail")
        throw new Error("Invalid mail");
    };

    if (password1 != password2) {
        res.status(403).send("password dont match")
        throw new Error("Passwords dont mach")
    }


    let updateQuery = new PQ({ text: 'UPDATE users SET email = $1 , first_name = $2 , second_name = $3 where id = $4', values: [mail, firstName, secondName, userId] })
    db.query(updateQuery).then(async (data) => {


        if (password1 != "") {
            if (!password2.match(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)) {
                res.status(404).send(new Error('Weak password, it must have, make sure it has 1 upper case, 1 lower case, 1 number/special character, and its at least 8 characters long.'))
                throw new Error("Weak password, it must have, make sure it has 1 upper case, 1 lower case, 1 number/special character, and its at least 8 characters long.")
            }

            var pass = await hash(password1, 10)
            let updatePasswordQuery = new PQ({ text: 'UPDATE users SET password = $1 where id = $2', values: [pass, userId] })
            db.query(updatePasswordQuery).then(data => {

                res.status(200).send("user data updated")
            }).catch(err => {
                res.status(405).send("db error")
                console.log(err)
            })
        } else {
            res.status(200).send("user data updated")
        }
    }
    ).catch(err => {
        res.status(405).send("db error")
        console.log(err)
    })
})

//for user
/**
* @swagger
* /user/info:
*  get:
*    security:
*       - Bearer: []
*    description: Returns the info of an user
*    produces:
*       - Status code | Array-Json
*    responses:
*      'user-info[JSON]':
*        description: Returns the info of the user.
*      '$error':
*        description: Various errors.
*/
router.get('/info', requireLogin, function (req, res) {
    const authorization = req.headers['authorization'];
    if (authorization == undefined) {
        res.send("provide a valid token")
    }
    const token = authorization.split(' ')[1];
    var decoded = decode(token, { complete: true });
    var userId = decoded.payload.userId
    let selectInfo = new PQ({ text: 'SELECT * FROM users where id= $1', values: [userId] })
    db.query(selectInfo).then(data => {
        res.send(data)
    }).catch(err => {
        res.send(err)
    })


})

//for user
/**
* @swagger
* /user/delete:
*  post:
*    security:
*       - Bearer: []
*    description: Deletes the user whose token is provided
*    produces:
*       - Status code
*    responses:
*      '200':
*        description: User deleted properly.
*      '$error':
*        description: Various errors.
*/
router.post("/delete", requireLogin, function (req, res) {
    const authorization = req.headers['authorization'];
    if (authorization == undefined) {
        res.send("provide a valid token")
    }
    const token = authorization.split(' ')[1];
    var decoded = decode(token, { complete: true });
    var userId = decoded.payload.userId
    let deleteUser = new PQ({ text: 'DELETE FROM users where id = $1', values: [userId] })
    db.query(deleteUser).then(data => {
        res.status(200).send("deleted");
    }).catch(err => res.send(err))
})

module.exports = router;