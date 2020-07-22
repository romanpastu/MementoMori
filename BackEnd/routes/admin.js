const express = require('express')
const router = express.Router()
const { db } = require('../database/database')
const PQ = require('pg-promise').ParameterizedQuery
const { requireLogin } = require("../controllers/auth")
const {  decode } = require('jsonwebtoken')
var moment = require('moment');
moment().format();

const { getUserList, deleteUser, updateUser } = require('../controllers/admin')
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
router.get("/userlist", requireLogin, getUserList)

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
router.post("/user/delete/:id", requireLogin, deleteUser)

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
router.post("/user/update/:id", requireLogin, updateUser)

module.exports = router;