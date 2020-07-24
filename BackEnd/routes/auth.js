const express = require('express');

const router = express.Router();

const {userLoginValidator} = require('../validators/auth')
const {runValidation} = require('../validators/index')

const moment = require('moment');

moment().format();

const {
  register, login, verifyToken, logout, refreshToken,
} = require('../controllers/auth');
/**
 * @swagger
 * /register:
 *  post:
 *    description: Use to register an user
 *    produces:
 *       - Status Code
 *    parameters:
 *       - name: email
 *         description: email to use for the login.
 *         in: formData
 *         required: true
 *       - name: First Name
 *         description: First Name.
 *         in: formData
 *         required: true
 *       - name: Second Name
 *         description: Second Name.
 *         in: formData
 *         required: true
 *       - name: Password 1
 *         description: Password.
 *         in: formData
 *         required: true
 *       - name: Password 2
 *         description: Password Confirmation.
 *         in: formData
 *         required: true
 *       - name: Birth Date
 *         description: Birth Date to calculate the user calendar.
 *         in: formData
 *         required: true
 *    responses:
 *      '200':
 *        description: A successful response
 *      '400':
 *        description: Passwords must be equal
 *      '401':
 *        description: Wrong email format
 *      '402':
 *        description: First Name must be Specified
 *      '403':
 *        description: Invalid Birth Date
 *      '404':
 *        description: Birth Date is missing
 *      '405':
 *        description: Password is missing
 *      '406':
 *        description: A successful response
 */
router.post('/register', register);
/**
 * @swagger
 * /login:
 *  post:
 *    description: Use to login an user
 *    produces:
 *       - Status Code/Access token
 *    parameters:
 *       - name: email
 *         description: email to use for the login.
 *         in: formData
 *         required: true
 *       - name: password
 *         description: password to use for the login.
 *         in: formData
 *         required: true
 *    responses:
 *      'accesstoken':
 *        description: Returns an access token if the login is successful
 *      '400':
 *        description: Wrong password and email combinations
 *      '401':
 *        description: Wrong password and email combinations
 */
router.post('/login',  login);
/**
 * @swagger
 * /refresh_token:
 *  post:
 *    security:
 *       - Bearer: []
 *    description: Use to refresh your access token
 *    produces:
 *       - Access token
 *    responses:
 *      'accesstoken':
 *        description: Empty if a wrong token is provided, else it will return a new accesstoken
 */
router.post('/refresh_token', refreshToken);
/**
 * @swagger
 * /logout:
 *  post:
 *    security:
 *       - Bearer: []
 *    description: Used to revoke an accesstoken refreshing (logout)
 *    produces:
 *       - status code
 *    responses:
 *      '200':
 *        description: Access Token Loged out Successfully || Provide a valid token.
 *        Logging out happens in both cases, but access token might not get invalidated
 *        if the connection was lost.
 */
// logout
router.post('/logout', logout);

// token verification route
/**
 * @swagger
 * /verify:
 *  post:
 *    security:
 *       - Bearer: []
 *    description: Used to check if an accesstoken is valid
 *    produces:
 *       - status code
 *    responses:
 *      'valid:res':
 *        description: Access token is valid.
 *      '$error':
 *        description: An error might happen [Token expired, token malformed, Token invalid....].
 */
router.post('/verify', verifyToken);

module.exports = router;
