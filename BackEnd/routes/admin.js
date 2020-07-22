const express = require('express')
const router = express.Router()
const { db } = require('../database/database')
const PQ = require('pg-promise').ParameterizedQuery
const { requireLogin } = require("../controllers/auth")
const {  decode } = require('jsonwebtoken')
var moment = require('moment');
moment().format();


//User Crud Related Routes
/**
 * @swagger
 * /userlist:
 *  get:
 *    security:
 *       - Bearer: []
 *    description: Returns the info of all users
 *    produces:
 *       - application/json, text/plain
 *    responses:
 *      'array-json':
 *        description: Returns an array containing an object with all the users.
 *      '400':
 *        description: Admin restricted action.
 *      '$error':
 *        description: Various errors.
 */
router.get("/userlist", requireLogin, function (req, res) {

    const authorization = req.headers['authorization'];
    if (authorization == undefined) {
      res.send("provide a valid token")
    }
    const token = authorization.split(' ')[1];
    var decoded = decode(token, { complete: true });
  
    var permited = decoded.payload.permited;
    if (!permited.includes("admin")) {
      res.status(400).send("this actions is limited to admins")
      throw new Error("Token doesn't belong to an admin")
    }
  
    let selectUsers = new PQ({text: 'SELECT * FROM users'})
    db.query(selectUsers).then(data => {
      res.send(data)
    }).catch(err => {
      res.send(err)
    })
  })

//for admin
/**
 * @swagger
 * /user/delete/:id:
 *  post:
 *    security:
 *       - Bearer: []
 *    description: Deletes an user given his id
 *    produces:
 *       - Status code
 *    parameters:
 *       - id: User id
 *         description: The user id
 *         in: request parameter
 *         required: true
 *    responses:
 *      '200':
 *        description: User deleted properly.
 *      '400':
 *        description: Admin restricted action.
 *      '$error':
 *        description: Various errors.
 */
router.post("/user/delete/:id", requireLogin, function (req, res) {
    const authorization = req.headers['authorization'];
    if (authorization == undefined) {
      res.send("provide a valid token")
    }
    const token = authorization.split(' ')[1];
    var decoded = decode(token, { complete: true });
  
    var permited = decoded.payload.permited;
    if (!permited.includes("admin")) {
      res.status(400).send("this actions is limited to admins")
      throw new Error("Token doesn't belong to an admin")
    }
    let deleteUser = new PQ({text: 'DELETE FROM users where id = $1', values: [req.params.id]})
    db.query(deleteUser).then(data => {
      res.status(200).send("deleted");
    }).catch(err => res.send(err))
  })

  //for admin
/**
 * @swagger
 * /user/update/:id:
 *  post:
 *    security:
 *       - Bearer: []
 *    description: Updates an user given his id
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
 *      '400':
 *        description: Token doesnt belon to the admin.
 *      '402':
 *        description: Invalid Names.
 *      '401':
 *        description: Invalid Mail.
 *      '403':
 *        description: Passwords dont match.
 *      '405':
 *        description: Error / DB Error.
 */
router.post("/user/update/:id", requireLogin, async (req, res) => {
    const authorization = req.headers['authorization'];
    if (authorization == undefined) {
      res.send("provide a valid token")
    }
    const token = authorization.split(' ')[1];
    var decoded = decode(token, { complete: true });
  
    var permited = decoded.payload.permited;
    if (!permited.includes("admin")) {
      res.status(400).send("this actions is limited to admins")
      throw new Error("Token doesn't belong to an admin")
    }
  
    const { firstName, secondName, mail, password1, password2 } = req.body
    const userId = req.params.id
  
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
  
    let updateUser = new PQ({text: 'UPDATE users SET email = $1 , first_name = $2 , second_name = $3 where id = $4', values:[mail, firstName, secondName, userId]})
    db.query(updateUser).then(async (data) => {
  
  
      if (password1 != "") {
  
        var pass = await hash(password1, 10)
        let updateUserPassword = new PQ({text: 'UPDATE users SET password = $1 where id = $2', values: [pass, userId]})
        db.query(updateUserPassword).then(data => {
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

module.exports = router;