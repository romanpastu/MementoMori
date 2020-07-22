const express = require('express')
const router = express.Router()
const { db } = require('../database/database')
const PQ = require('pg-promise').ParameterizedQuery
const { verify, decode } = require('jsonwebtoken')
const { hash, compare } = require('bcryptjs')
const { createAccessToken, createRefreshToken, sendAccessToken, sendRefreshToken } = require('../helpers/token.js')
const { isAuth } = require('../helpers/isAuth.js')

var moment = require('moment');
moment().format();

function requireLogin(req, res, next) {
  try {
    const userId = isAuth(req)
    if (userId !== null) {
      next();
    }
  } catch (err) {
    if (err.message == "jwt expired") {

      async function result() {
        var data = await refresh(req)

        const userId = isAuthRefreshed(data.accesstoken)
        if (userId !== null) {
          next();
        }
      }
      result();
    }
    if (err.message != "jwt expired") {
      res.status(400).send({
        error: `${err.message}`
      })
    }
  }
}

async function register(req, res) {

  const { email, firstName, secondName, password1, password2, birthDate } = req.body;

  var current_date = moment().format('YYYY-MM-DD');
  // if moment(birthDate).isAfter(m)
  if (password1 != password2) {
    res.status(400).send(new Error('Passwords must be equal'));
    throw new Error("Passwords must be equal");
  }
  if (password2 == '') {
    res.status(405).send(new Error('Theres no password'));
    throw new Error("Theres no password");
  }
  if (!email.match(/@/g)) {
    res.status(401).send(new Error('wrong email'))
    throw new Error("wrong email");
  }
  if (firstName == '') {
    res.status(402).send(new Error('You must specify a first name'))
    throw new Error("You must specify a first name");
  }

  if (moment(birthDate).isAfter(current_date, 'day')) {
    res.status(403).send(new Error('You cant be born in the future'))
    throw new Error("You cant be born in the future");
  }

  if (birthDate == '') {
    res.status(404).send(new Error('No date'))
    throw new Error("No date");
  }

  if (!password2.match(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)) {
    res.status(406).send(new Error('Weak password, it must have, make sure it has 1 upper case, 1 lower case, 1 number/special character, and its at least 8 characters long.'))
    throw new Error("Weak password, it must have, make sure it has 1 upper case, 1 lower case, 1 number/special character, and its at least 8 characters long.")
  }



  const password = password2;
  const hashedPassword = await hash(password, 10);
  let insertUser = new PQ({ text: 'INSERT INTO USERS (email, password, birth_date, first_name, second_name) VALUES ($1, $2, $3, $4, $5)', values: [email, hashedPassword, birthDate, firstName, secondName] })
  db.query(insertUser).then(function (data) {
    console.log("inserted cant")
    console.log(data)
    let selectUser = new PQ({ text: 'SELECT id from users where email = $1', values: [email] })
    db.query(selectUser).then(function (data) {
      let setPermissions = new PQ({ text: 'INSERT INTO user_permissions values ($1, false, true, false, false, false)', values: [data[0].id] })
      db.query(setPermissions).then(function (data) {
        res.status(200).send("inserted")

      }).catch(function (error) {
        console.log("ERROR: ", error)
        res.send("error")
      });
    }).catch(function (error) {
      console.log("ERROR: ", error)
      res.send("error")
    });
  }).catch(function (error) {

    if (error.code = '23505') {
      console.log("se manda?")
      res.send('User already exists')

    }

    console.log("ERROR: ", error)
    res.send("error")
  });


}

async function login (req, res) {
  const { email, password } = req.body;

  try {
    var user = "";
    let selectUser = new PQ({ text: 'SELECT * FROM users where email = $1', values: [email] })
    db.query(selectUser).then(async function (data) {
      user = data;
      if (!user[0]) {
        res.status(400).send("error");
        throw new Error("User doesnt exist");
      }
      const valid = await compare(password, user[0].password);
      if (!valid) {
        res.status(401).send("error");
        throw new Error("Password not corect");
      }
      //selects the permissions
      let selectUserPermissions = new PQ({ text: 'SELECT * FROM user_permissions WHERE user_id = $1', values: [user[0].id] })
      db.query(selectUserPermissions).then(function (data) {
        var permited = [];
        delete data[0].user_id
        for (var key in data[0]) {
          if (data[0].hasOwnProperty(key)) {
            if (data[0][key] === true) {
              permited.push(key)
            }
          }
        }

        const accesstoken = createAccessToken(user[0].id, permited);
        const refreshtoken = createRefreshToken(user[0].id);
        let setUserRefreshToken = new PQ({ text: 'UPDATE users SET refreshtoken = $1 where id = $2', values: [refreshtoken, user[0].id] })
        db.query(setUserRefreshToken).then(function (data) {
          // sendRefreshToken(res, refreshtoken); //unnecesary 
          sendAccessToken(res, req, accesstoken);
        }).catch(function (error) {
          console.log("ERROR: ", error)
        })
      })
    }).catch(function (error) {
      console.log("ERROR: ", error)
      res.send(error)
    })



  } catch (err) {
    res.send({
      error: `${err.message}`
    })
  }
}

async function verifyToken (req, res) {
  try {
    const userId = isAuth(req)
    if (userId !== null) {
      res.send({
        status: "valid"
      })
    }
  } catch (err) {
    res.send({
      error: `${err.message}`
    })
  }
}

async function logout (req, res) {
  const authorization = req.headers['authorization'];
  if (authorization == undefined) {
    res.status(200).send("provide a valid token")
  }
  const token = authorization.split(' ')[1];
  var decoded = decode(token, { complete: true });
  var userId = decoded.payload.userId
  let setRefreshTokenNull = new PQ({ text: "UPDATE users set refreshtoken = 'null' where id = $1", values: [userId] })
  db.query(setRefreshTokenNull).then(data => {
    res.status(200).send("logged out")
  }).catch(err => {
    console.log(err)
    res.send(err)
  })
}

async function refreshToken(req, res){
  const authorization = req.headers['authorization'];
  if (!authorization) throw new Error("You need to login");
  accesstoken = authorization.split(' ')[1];
  var userId = verify(accesstoken, process.env.ACCESS_TOKEN_SECRET, { ignoreExpiration: true })
  userId = userId.userId

  var token = ""
  let selectUserPermissions = new PQ({ text: 'SELECT * FROM user_permissions WHERE user_id = $1', values: [userId] })
  db.query(selectUserPermissions).then(function (data) {
    var permited = [];
    console.log("permisos de usuario")
    delete data[0].user_id
    for (var key in data[0]) {
      if (data[0].hasOwnProperty(key)) {
        if (data[0][key] === true) {
          permited.push(key)
        }
      }
    }
    let selectUser = new PQ({ text: 'SELECT * FROM users where id = $1', values: [userId] })
    //now the we need to grab the refreshtoken of the user knowing its id
    db.query(selectUser).then(function (data) {
      var user = data;
      token = user[0].refreshtoken;
      var id = user[0].id;
      if (!token) return res.send({ accesstoken: '' });
      let payload = null;

      try {
        payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
      } catch (err) {
        return res.send({ accesstoken: '' });
      }

      user = "";
      let selectUser = new PQ({ text: 'SELECT * FROM users where id = $1', values: [id] })
      db.query(selectUser).then(function (data) {
        user = data;
        if (!user) return res.send({ accesstoken: '' });
        //if user exists check if refreshtoken exist on user

        if (user[0].refreshtoken !== token) {
          return res.send({ accesstoken: '' })
        }

        //if token exist create a new Refresh and Accestoken
        const accesstoken = createAccessToken(user[0].id, permited);
        const refreshtoken = createRefreshToken(user[0].id);
        let setRefreshToken = new PQ({ text: 'UPDATE users SET refreshtoken = $1 where id = $2', values: [refreshtoken, user[0].id] })
        db.query(setRefreshToken).then(function (data) {
          // sendRefreshToken(res, refreshtoken); //unnecesary
          return res.send({ accesstoken });

        }).catch(function (error) {
          console.log("ERROR: ", error)
        })


      }).catch(function (error) {
        console.log("ERROR: ", error)
        res.send(error);
      })
    })

  })
}

module.exports = {
  requireLogin, register, login, verifyToken, logout, refreshToken

}