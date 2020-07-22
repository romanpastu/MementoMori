const express = require('express')
const router = express.Router()
const { db } = require('../database/database')
const PQ = require('pg-promise').ParameterizedQuery
const { requireLogin } = require("../controllers/auth")
const { decode } = require('jsonwebtoken')
var moment = require('moment');
moment().format();
const { getUserCalendar, getUserFieldsInfo, updateField, generateCalendar } = require('../controllers/calendar')
//get user
/**
 * @swagger
 * /getUserGenerateCalendar:
 *  get:
 *    security:
 *       - Bearer: []
 *    description: Returns the calendar of the user
 *    produces:
 *       - Array-Json
 *    responses:
 *      'array-json':
 *        description: Returns an array containing the json of the calendar.
 *      '$error':
 *        description: Various errors.
 */
router.get('/getUserGenerateCalendar', requireLogin, getUserCalendar)

//get user field info
/**
 * @swagger
 * /getUserFieldsInfo:
 *  get:
 *    security:
 *       - Bearer: []
 *    description: Returns the info of all calendar fields
 *    produces:
 *       - Array-Json
 *    responses:
 *      'array-json':
 *        description: Returns an array containing the json of the calendar fields.
 *      '$error':
 *        description: Various errors.
 */
router.get('/getUserFieldsInfo', requireLogin, getUserFieldsInfo)


//update field
/**
 * @swagger
 * /update/field:
 *  post:
 *    security:
 *       - Bearer: []
 *    description: Updates a calendar field
 *    produces:
 *       - Status / Error
 *    parameters:
 *       - name: Week Number
 *         description: The week number of the calendar
 *         in: Form Data
 *         required: true
 *       - name: Rating of the emotion
 *         description: The rationg of the emotion during the field week
 *         in: Form Data
 *         required: true
 *       - name: Description
 *         description: The description of the week
 *         in: Form Data
 *    responses:
 *      '200':
 *        description: Field updated successfully.
 *      '$error':
 *        description: Various errors.
 */
router.post('/update/field', requireLogin, updateField)

//generate calendar - user restricted
/**
 * @swagger
 * /generateCalendar:
 *  post:
 *    security:
 *       - Bearer: []
 *    description: Used to generate a new calendar for an user
 *    produces:
 *       - status code/string
 *    parameters:
 *       - name: Years To Live
 *         description: Used to calculate the calendar size.
 *         in: Form Data
 *         required: true
 *       - name: Register Date
 *         description: Used to calculate the calendar size.
 *         in: Form Data
 *         required: true
 *    responses:
 *      '100:res':
 *        description: Generated properly.
 *      '$error':
 *        description: Various errors.
 *      '400':
 *        description: Invalid amount of years, since they must be between 1 and 100
 *      '408':
 *         description: The resulting total weeks are smaller than the weeks spent up to register
 */
router.post('/generateCalendar', requireLogin, generateCalendar)



module.exports = router;