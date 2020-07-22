const express = require('express')
const { db } = require('../database/database')
const PQ = require('pg-promise').ParameterizedQuery
const { verify, decode } = require('jsonwebtoken')
const { hash, compare } = require('bcryptjs')
const { createAccessToken, createRefreshToken, sendAccessToken, sendRefreshToken } = require('../helpers/token.js')
const { isAuth } = require('../helpers/isAuth.js')
const {refresh} = require('../helpers/refresh')

var moment = require('moment');
moment().format();

async function generatePieChart ( req, res)  {
    const authorization = req.headers['authorization'];
    if (authorization == undefined) {
        res.send("provide a valid token")
    }
    const token = authorization.split(' ')[1];
    var decoded = decode(token, { complete: true });
    var userId = decoded.payload.userId

    function getCurrentWeek(birth_date) {
        var current_date = moment();
        var weeks_to_date = moment(new Date(current_date)).diff(birth_date, 'days') / 7;
        return Math.floor(weeks_to_date);
    }

    function getWeeksToRegisterDate(register_date, birth_date) {
        var weeks_to_date = moment(new Date(register_date)).diff(birth_date, 'days') / 7;
        return Math.floor(weeks_to_date);
    }
    let selectData = new PQ({ text: 'SELECT birth_date::varchar, register_date::varchar from users where id = $1 ;', values: [userId] })
    db.query(selectData).then(data => {

        var currentWeek = getCurrentWeek(data[0].birth_date)
        // currentWeek = 1400 //dummy to select an incremented current week, delete
        var registerDate = getWeeksToRegisterDate(data[0].register_date, data[0].birth_date)
        let selectData2 = new PQ({ text: "SELECT cf.rating, cf.week_number from calendar_field cf join calendar c on (c.id = cf.calendar_id) where week_number >= $1 and week_number <= $2 and user_id = $3", values: [registerDate, currentWeek, userId] })
        db.query(selectData2).then(response => {
            var data = response;
            var data = data.map(function (obj) {
                return Object.keys(obj).sort().map(function (key) {
                    return obj[key];
                });
            });
            var counter = [["1", 0], ["2", 0], ["3", 0], ["4", 0], ["5", 0]]

            for (let i in data) {

                switch (data[i][0]) {
                    case 1:
                        counter[0][1]++
                        break;
                    case 2:
                        counter[1][1]++
                        break;
                    case 3:
                        counter[2][1]++
                        break;
                    case 4:
                        counter[3][1]++
                        break;
                    case 5:
                        counter[4][1]++
                        break;
                }
            }


            var parsedData = [
                {
                    "id": "rate 1",
                    "label": "rate 1",
                    "value": counter[0][1],
                    "color": "hsl(11, 70%, 50%)"
                },
                {
                    "id": "rate 2",
                    "label": "rate 2",
                    "value": counter[1][1],
                    "color": "hsl(197, 70%, 50%)"
                },
                {
                    "id": "rate 3",
                    "label": "rate 3",
                    "value": counter[2][1],
                    "color": "hsl(277, 70%, 50%)"
                },
                {
                    "id": "rate 4",
                    "label": "rate 4",
                    "value": counter[3][1],
                    "color": "hsl(335, 70%, 50%)"
                },
                {
                    "id": "rate 5",
                    "label": "rate 5",
                    "value": counter[4][1],
                    "color": "hsl(260, 70%, 50%)"
                }
            ]
            res.send(parsedData)
        })
    })
}

async function generateCumulativeMaxPotentialChart ( req, res)  {
    const authorization = req.headers['authorization'];
    if (authorization == undefined) {
        res.send("provide a valid token")
    }
    const token = authorization.split(' ')[1];
    var decoded = decode(token, { complete: true });
    var userId = decoded.payload.userId

    function getCurrentWeek(birth_date) {
        var current_date = moment();
        var weeks_to_date = moment(new Date(current_date)).diff(birth_date, 'days') / 7;
        return Math.floor(weeks_to_date);
    }

    function getWeeksToRegisterDate(register_date, birth_date) {
        var weeks_to_date = moment(new Date(register_date)).diff(birth_date, 'days') / 7;
        return Math.floor(weeks_to_date);
    }
    let selectData = new PQ({ text: "SELECT birth_date::varchar, register_date::varchar from users where id = $1;", values: [userId] })
    db.query(selectData).then(data => {

        var currentWeek = getCurrentWeek(data[0].birth_date)
        // currentWeek = 1189 //dummy to select an incremented current week, delete
        var registerDate = getWeeksToRegisterDate(data[0].register_date, data[0].birth_date)
        let selectData2 = new PQ({ text: "SELECT cf.rating, cf.week_number from calendar_field cf join calendar c on (c.id = cf.calendar_id) where week_number >= $1 and week_number <= $2 and user_id = $3", values: [registerDate, currentWeek, userId] })
        db.query(selectData2).then(response => {
            var data = response;
            var dataComposed = []
            var obj = {}
            for (let i in data) {

                obj["x"] = data[i]["week_number"]
                obj["y"] = data[i]["rating"]
                dataComposed.push(obj)
                obj = {}
            }

            //sort the dataComposed array based on week number from less to more week number
            function compare_weekN(a, b) {
                if (a.x < b.x) {
                    return -1
                } else if (a.x > b.x) {
                    return 1;
                } else {
                    return 0;
                }
            }
            dataComposed.sort(compare_weekN)

            var maxpotential = JSON.parse(JSON.stringify(dataComposed));
            //accumulates the data
            let initY = 0;
            dataComposed.map(item => {
                item.y += initY
                initY = item.y
                return item
            })
            //


            for (let i = 0; i < maxpotential.length; i++) {

                if (i == 0) {
                    maxpotential[i]["y"] = 0
                } else {
                    maxpotential[i]["y"] = maxpotential[i - 1]["y"] + 5
                }

            }

            var fullChart = [{
                "id": "CE",
                "color": "blue",
                "data": dataComposed
            }, {
                "id": "MPCE",
                "color": "green",
                "data": maxpotential
            }]
            //compose teh data
            res.send(fullChart)
        }).catch(err => {
            console.log(err)
        })
    }).catch(err => {
        console.log(err)
    })
}

async function generateCumulativeChart ( req, res)  {
    const authorization = req.headers['authorization'];
    if (authorization == undefined) {
      res.send("provide a valid token")
    }
    const token = authorization.split(' ')[1];
    var decoded = decode(token, { complete: true });
    var userId = decoded.payload.userId
  
    function getCurrentWeek(birth_date) {
      var current_date = moment();
      var weeks_to_date = moment(new Date(current_date)).diff(birth_date, 'days') / 7;
      return Math.floor(weeks_to_date);
    }
  
    function getWeeksToRegisterDate(register_date, birth_date) {
      var weeks_to_date = moment(new Date(register_date)).diff(birth_date, 'days') / 7;
      return Math.floor(weeks_to_date);
    }
    let selectChartData = new PQ({text: "SELECT birth_date::varchar, register_date::varchar from users where id = $1;", values: [userId]})
    db.query(selectChartData).then(data => {
      
      var currentWeek = getCurrentWeek(data[0].birth_date)
      // currentWeek = 1189 //dummy to select an incremented current week, delete
      var registerDate = getWeeksToRegisterDate(data[0].register_date, data[0].birth_date)
      let selectChartData2 = new PQ({text: "SELECT cf.rating, cf.week_number from calendar_field cf join calendar c on (c.id = cf.calendar_id) where week_number >= $1 and week_number <= $2 and user_id = $3", values: [registerDate,currentWeek,userId]})
      db.query(selectChartData2).then(response => {
        var data = response;
        var dataComposed = []
        var obj = {}
        for (let i in data) {
  
          obj["x"] = data[i]["week_number"]
          obj["y"] = data[i]["rating"]
          dataComposed.push(obj)
          obj = {}
        }
  
        //sort the dataComposed array based on week number from less to more week number
        function compare_weekN(a, b) {
          if (a.x < b.x) {
            return -1
          } else if (a.x > b.x) {
            return 1;
          } else {
            return 0;
          }
        }
        dataComposed.sort(compare_weekN)
  
        //accumulates the data
        let initY = 0;
        dataComposed.map(item => {
          item.y += initY
          initY = item.y
          return item
        })
  
        var fullChart = [{
          "id": "CE",
          "color": "hsl(196, 97%, 50%)",
          "data": dataComposed
        }]
        //compose teh data
        res.send(fullChart)
      }).catch(err => {
        console.log(err)
      })
    }).catch(err => {
      console.log(err)
    })
}

async function generateLinealChart ( req, res)  {
    const authorization = req.headers['authorization'];
    if (authorization == undefined) {
      res.send("provide a valid token")
    }
    const token = authorization.split(' ')[1];
    var decoded = decode(token, { complete: true });
    var userId = decoded.payload.userId
  
    function getCurrentWeek(birth_date) {
      var current_date = moment();
      var weeks_to_date = moment(new Date(current_date)).diff(birth_date, 'days') / 7;
      return Math.floor(weeks_to_date);
    }
  
    function getWeeksToRegisterDate(register_date, birth_date) {
      var weeks_to_date = moment(new Date(register_date)).diff(birth_date, 'days') / 7;
      return Math.floor(weeks_to_date);
    }
    let selectChartData = new PQ({text: "SELECT birth_date::varchar, register_date::varchar from users where id = $1 ;", values : [userId]})
    db.query(selectChartData).then(data => {
  
      var currentWeek = getCurrentWeek(data[0].birth_date)
      // currentWeek = 1189 //dummy to select an incremented current week, delete
      var registerDate = getWeeksToRegisterDate(data[0].register_date, data[0].birth_date)
      let selectChartData2 = new PQ({text: "SELECT cf.rating, cf.week_number from calendar_field cf join calendar c on (c.id = cf.calendar_id) where week_number >= $1 and week_number <= $2 and user_id = $3", values : [registerDate,currentWeek,userId]})
      db.query(selectChartData2).then(response => {
  
        var data = response;
        var dataComposed = []
        var obj = {}
        for (let i in data) {
  
          obj["x"] = data[i]["week_number"]
          obj["y"] = data[i]["rating"]
          dataComposed.push(obj)
          obj = {}
        }
  
        //sort the dataComposed array based on week number from less to more week number
        function compare_weekN(a, b) {
          if (a.x < b.x) {
            return -1
          } else if (a.x > b.x) {
            return 1;
          } else {
            return 0;
          }
        }
        dataComposed.sort(compare_weekN)
  
        var fullChart = [{
          "id": "E",
          "color": "blue",
          "data": dataComposed
        }]
        //compose teh data
        res.send(fullChart)
      }).catch(err => {
        console.log(err)
      })
    }).catch(err => {
      console.log(err)
    })
}

module.exports = {
    generatePieChart, generateCumulativeMaxPotentialChart, generateCumulativeChart, generateLinealChart
}
