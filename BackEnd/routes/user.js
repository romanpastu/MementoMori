const express = require('express')
const router = express.Router()
const { db } = require('../database/database')
const PQ = require('pg-promise').ParameterizedQuery
const { requireLogin } = require("../controllers/auth")
const { decode } = require('jsonwebtoken')
var moment = require('moment');
moment().format();
const { updateUser, getUserInfo, deleteUser } = require('../controllers/user')
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
router.post('/update', requireLogin, updateUser)

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
router.get('/info', requireLogin, getUserInfo)

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
router.post("/delete", requireLogin, deleteUser)

module.exports = router;