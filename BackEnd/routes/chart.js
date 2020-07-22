const express = require('express')
const router = express.Router()
const { db } = require('../database/database')
const PQ = require('pg-promise').ParameterizedQuery
const { requireLogin } = require("../controllers/auth")
const { decode } = require('jsonwebtoken')
var moment = require('moment');
moment().format();

const { generatePieChart, generateCumulativeMaxPotentialChart, generateCumulativeChart, generateLinealChart } = require('../controllers/chart')
//charts

/**
 * @swagger
 * /chart/pie/emotion:
 *  get:
 *    security:
 *       - Bearer: []
 *    description: Return a pie emotion chart
 *    produces:
 *       - Data-Array-Json
 *    responses:
 *      'Data-Array-Json':
 *        description: Chart Data.
 *      '$error':
 *        description: Various errors.
 */

router.get('/pie/emotion', requireLogin, generatePieChart)

//get cumulative emotion vs max potential emotion chart data
/**
 * @swagger
 * /chart/cumulative-maxpotential/emotion:
 *  get:
 *    security:
 *       - Bearer: []
 *    description: Return a cumulative vs maxpotential emotion chart
 *    produces:
 *       - Data-Array-Json
 *    responses:
 *      'Data-Array-Json':
 *        description: Chart Data.
 *      '$error':
 *        description: Various errors.
 */
router.get('/cumulative-maxpotential/emotion', generateCumulativeMaxPotentialChart)

//get cumulative emotion chart data
/**
 * @swagger
 * /chart/cumulative/emotion:
 *  get:
 *    security:
 *       - Bearer: []
 *    description: Return a cumulative emotion chart
 *    produces:
 *       - Data-Array-Json
 *    responses:
 *      'Data-Array-Json':
 *        description: Chart Data.
 *      '$error':
 *        description: Various errors.
 */
router.get('/cumulative/emotion', requireLogin, generateCumulativeChart)

//get lineal emotion chart data
/**
 * @swagger
 * /chart/lineal/emotion:
 *  get:
 *    security:
 *       - Bearer: []
 *    description: Return a lineal emotion chart
 *    produces:
 *       - Data-Array-Json
 *    responses:
 *      'Data-Array-Json':
 *        description: Chart Data.
 *      '$error':
 *        description: Various errors.
 */
router.get('/lineal/emotion', requireLogin, generateLinealChart)

module.exports = router;