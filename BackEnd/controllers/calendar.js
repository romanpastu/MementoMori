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

async function getUserCalendar ( req , res) {
    const authorization = req.headers['authorization'];
    if (authorization == undefined) {
      res.send("provide a valid token")
    }
    const token = authorization.split(' ')[1];
    var decoded = decode(token, { complete: true });
    var userId = decoded.payload.userId
    let selectCalendar = new PQ({text: 'SELECT birth_date::varchar, years_to_live::varchar, register_date::varchar, death_date::varchar, weeks_to_live from users where id = $1', values:[userId]})
    db.query(selectCalendar).then(data =>{
      data[0]['birthDate'] = data[0]["birth_date"]
      delete data[0]["birth_date"]
      res.send(data[0])
    }).catch(err =>{
      console.log(err)
      res.send(err)
    })
}

async function getUserFieldsInfo (req, res) {
    const authorization = req.headers['authorization'];
    if (authorization == undefined) {
      res.send("provide a valid token")
    }
    const token = authorization.split(' ')[1];
    var decoded = decode(token, { complete: true });
    var userId = decoded.payload.userId
    let selectUserFieldsInfo = new PQ({text: "SELECT CF.text, CF.rating, CF.week_number from calendar C join calendar_field CF on C.id = CF.calendar_id where C.user_id = $1 ;", values:[userId]})
    db.query(selectUserFieldsInfo).then(data =>
      res.send(data)
    ).catch(err => {
      console.log(err)
      res.send(err)
    })
}

async function updateField (req, res) {
    const authorization = req.headers['authorization'];
    if (authorization == undefined) {
      res.send("provide a valid token")
    }
    const token = authorization.split(' ')[1];
    var decoded = decode(token, { complete: true });
    var userId = decoded.payload.userId
  
    const week_number = req.body.week_number
    const emotionrating = req.body.emotionRating
    const description = req.body.description
  
    let selectData = new PQ({text: "SELECT cf.id from calendar_field cf join calendar c on (c.id = cf.calendar_id) where week_number= $1 and user_id = $2", values:[week_number, userId]})
    db.query(selectData).then(data => {
      let updateField = new PQ({text: "UPDATE calendar_field SET text = $1, rating = $2 where id= $3", values:[description,emotionrating,data[0].id]})
      db.query(updateField).then(data => {
  
        res.send(200)
      }).catch(err => {
        console.log(err)
      });
    }).catch(err => {
      console.log(err)
    })
}

async function generateCalendar(req, res){
    const authorization = req.headers['authorization'];
    if (authorization == undefined) {
      res.send("provide a valid token")
    }
    const token = authorization.split(' ')[1];
    var decoded = decode(token, { complete: true });
    var userId = decoded.payload.userId
  
    const yearsToLive = Math.trunc(req.body.yearsToLive).toString()
    const registerDate = req.body.registerDate
  
    function filterDate(date) {
      var stringDate = moment(date).format('YYYY-MM-DD').toString();
      var result = stringDate.match(/(?:(?!T).)*/)
      return result[0];
    }
  
    function getWeeksToLive(death_date, birth_date) {
      //returns the weeks to live between death and birth date, rounded to upper week
      var weeks_to_live = moment(death_date).diff(moment(birth_date), 'days') / 7;
      return Math.ceil(weeks_to_live);
    }
  
    function getWeeksToRegisterDate(register_date, birth_date) {
      var weeks_to_date = moment(new Date(filterDate(register_date))).diff(birth_date, 'days') / 7;
      //Returns lived weeks to date rounded to lower number because we dont want to overwrite the current ongoing week
      return Math.floor(weeks_to_date);
    }
  
  
    if (yearsToLive > 100 || yearsToLive < 1) {
      res.status(400).send(new Error('Invalid years'));
      throw new Error('Invalid years')
    }
  
  
    //sets the deathDate and weeksToLive in the database
    let selectUser = new PQ({text: 'SELECT * FROM users where id = $1', values:[userId]})
    db.query(selectUser).then(data => {
      var birth_date = data[0].birth_date
      var deathDate = ""
      //sets the death_date and the weeks to live
      deathDate = moment(filterDate(birth_date)).add(yearsToLive, 'years')
  
      //check that the weeks to live are bigger than the weeks to register date
      if (getWeeksToLive(deathDate, birth_date) <= (getWeeksToRegisterDate(birth_date, registerDate) * -1)) {
        res.status(408).send(new Error("The resulting total weeks are smaller than the weeks spent up to register"))
        throw new Error("The resulting total weeks are smaller than the weeks spent up to register")
      }
  
      let setUserData = new PQ({text: 'UPDATE users SET death_date = $1 , weeks_to_live = $2 where id = $3', values: [moment(deathDate).format('YYYY-MM-DD').toString(),getWeeksToLive(deathDate, birth_date),userId]})
      db.query(setUserData).then(data => {
        /*******/
        //Sets the yearsToLive and registerDate in the database
        let setUserData2 = new PQ({text: 'UPDATE users SET years_to_live = $1, register_date = $2 where id = $3', values: [yearsToLive,registerDate,userId]})
        db.query(setUserData2).then(data => {
          let insertCalendar = new PQ({text: 'INSERT INTO calendar (user_id) values ($1)', values: [userId]})
          db.query(insertCalendar).then(data => {
  
            // res.send(data)
            /*******/
            /*gets the calendar id related to the current user*/
            let selectCalendarId = new PQ({text: 'SELECT id from calendar where user_id = $1', values:[userId]})
            db.query(selectCalendarId).then(data => {
  
              /*******/
              //Sets all the field for the calendar
              let generateCalendarSeries = new PQ({text: "INSERT INTO calendar_field (text, rating, calendar_id, week_number) select '', 0, c.id, g.wn from calendar c join users u on u.id = c.user_id cross join generate_series(1, u.weeks_to_live) as g(wn) where c.id= $1 ;", values: [data[0].id]})
              db.query(generateCalendarSeries).then(data => {
  
                /******/
                //the lifeExpectanceSet restriction is removed and access to dashboard is granted
                let removeRestriction = new PQ({text: "UPDATE user_permissions SET life_expectancy =  'false' , dashboard = 'true' , stats = 'true', admin = 'false' , profile_info = 'true' WHERE user_id = $1", values:[userId]})
                db.query(removeRestriction).then(data => {
  
                  res.send("100")
  
                }).catch(err => console.log(err))
              }).catch(err => console.log(err))
            })
          })
  
  
        }).catch(err => {
          console.log(err)
          res.send(err)
        })
      }).catch(err => console.log(err))
  
    })
}

module.exports = {
    getUserCalendar, getUserFieldsInfo, updateField, generateCalendar
}