const PQ = require('pg-promise').ParameterizedQuery;
const moment = require('moment');
const { verify, decode } = require('jsonwebtoken');
const { hash, compare } = require('bcryptjs');
const { createAccessToken, createRefreshToken, sendAccessToken } = require('../helpers/token.js');
const { isAuth } = require('../helpers/isAuth.js');
const { refresh } = require('../helpers/refresh');
const { isAuthRefreshed } = require('../helpers/isAuthRefreshed');
const { db } = require('../database/database');

moment().format();

function requireLogin(req, res, next) {
  async function result() {
    const data = await refresh(req);
    const userId = isAuthRefreshed(data.accesstoken);
    if (userId !== null) {
      next();
    }
  }
  try {
    const userId = isAuth(req);
    if (userId !== null) {
      next();
    }
  } catch (err) {
    if (err.message === 'jwt expired') {
      result();
    }
    if (err.message !== 'jwt expired') {
      res.status(400).send({
        error: `${err.message}`,
      });
    }
  }
}

async function register(req, res) {
  const {
    email, firstName, secondName, password1, password2, birthDate,
  } = req.body;

  const current_date = moment().format('YYYY-MM-DD');
  // if moment(birthDate).isAfter(m)
  if (password1 != password2) {
    res.status(400).send(new Error('Passwords must be equal'));
    throw new Error('Passwords must be equal');
  }
  if (password2 == '') {
    res.status(405).send(new Error('Theres no password'));
    throw new Error('Theres no password');
  }
  if (!email.match(/@/g)) {
    res.status(401).send(new Error('wrong email'));
    throw new Error('wrong email');
  }
  if (firstName == '') {
    res.status(402).send(new Error('You must specify a first name'));
    throw new Error('You must specify a first name');
  }

  if (moment(birthDate).isAfter(current_date, 'day')) {
    res.status(403).send(new Error('You cant be born in the future'));
    throw new Error('You cant be born in the future');
  }

  if (birthDate == '') {
    res.status(404).send(new Error('No date'));
    throw new Error('No date');
  }

  if (!password2.match(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)) {
    res.status(406).send(new Error('Weak password, it must have, make sure it has 1 upper case, 1 lower case, 1 number/special character, and its at least 8 characters long.'));
    throw new Error('Weak password, it must have, make sure it has 1 upper case, 1 lower case, 1 number/special character, and its at least 8 characters long.');
  }

  const password = password2;
  const hashedPassword = await hash(password, 10);
  const insertUser = new PQ({ text: 'INSERT INTO USERS (email, password, birth_date, first_name, second_name) VALUES ($1, $2, $3, $4, $5)', values: [email, hashedPassword, birthDate, firstName, secondName] });
  db.query(insertUser).then((data) => {
    console.log('inserted cant');
    console.log(data);
    const selectUser = new PQ({ text: 'SELECT id from users where email = $1', values: [email] });
    db.query(selectUser).then((data) => {
      const setPermissions = new PQ({ text: 'INSERT INTO user_permissions values ($1, false, true, false, false, false)', values: [data[0].id] });
      db.query(setPermissions).then((data) => {
        res.status(200).send('inserted');
      }).catch((error) => {
        console.log('ERROR: ', error);
        res.send('error');
      });
    }).catch((error) => {
      console.log('ERROR: ', error);
      res.send('error');
    });
  }).catch((error) => {
    if (error.code = '23505') {
      console.log('se manda?');
      res.send('User already exists');
    }

    console.log('ERROR: ', error);
    res.send('error');
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    let user = '';
    const selectUser = new PQ({ text: 'SELECT * FROM users where email = $1', values: [email] });
    db.query(selectUser).then(async (data) => {
      user = data;
      if (!user[0]) {
        return res.status(403).json({
          error: 'User doesnt exist'
        });
      }
      const valid = await compare(password, user[0].password);

      if (!valid) {
       return res.status(403).json({
          error: 'Password not correct'
        });
      }

      // selects the permissions
      const selectUserPermissions = new PQ({ text: 'SELECT * FROM user_permissions WHERE user_id = $1', values: [user[0].id] });
      db.query(selectUserPermissions).then((data) => {
        const permited = [];
        delete data[0].user_id;
        for (const key in data[0]) {
          if (data[0].hasOwnProperty(key)) {
            if (data[0][key] === true) {
              permited.push(key);
            }
          }
        }

        const accesstoken = createAccessToken(user[0].id, permited);
        const refreshtoken = createRefreshToken(user[0].id);
        const setUserRefreshToken = new PQ({ text: 'UPDATE users SET refreshtoken = $1 where id = $2', values: [refreshtoken, user[0].id] });
        db.query(setUserRefreshToken).then((data) => {
          // sendRefreshToken(res, refreshtoken); //unnecesary
          sendAccessToken(res, req, accesstoken);
        }).catch((err) => {
          return res.status(500).json({
            error: `${err.message}`
          })
        });
      });
    }).catch((err) => {
      console.log('ERROR: ', error);
      return res.status(500).json({
        error: `${err.message}`
      })
    });
  } catch (err) {
    return res.status(500).json({
      error: `${err.message}`
    })
  }
}

async function verifyToken(req, res) {
  try {
    const userId = isAuth(req);
    if (userId !== null) {
      res.send({
        status: 'valid',
      });
    }
  } catch (err) {
    res.send({
      error: `${err.message}`,
    });
  }
}

async function logout(req, res) {
  const { authorization } = req.headers;
  if (authorization == undefined) {
    res.status(200).send('provide a valid token');
  }
  const token = authorization.split(' ')[1];
  const decoded = decode(token, { complete: true });
  const { userId } = decoded.payload;
  const setRefreshTokenNull = new PQ({ text: "UPDATE users set refreshtoken = 'null' where id = $1", values: [userId] });
  db.query(setRefreshTokenNull).then((data) => {
    res.status(200).send('logged out');
  }).catch((err) => {
    console.log(err);
    res.send(err);
  });
}

async function refreshToken(req, res) {
  const { authorization } = req.headers;
  if (!authorization) throw new Error('You need to login');
  accesstoken = authorization.split(' ')[1];
  let userId = verify(accesstoken, process.env.ACCESS_TOKEN_SECRET, { ignoreExpiration: true });
  userId = userId.userId;

  let token = '';
  const selectUserPermissions = new PQ({ text: 'SELECT * FROM user_permissions WHERE user_id = $1', values: [userId] });
  db.query(selectUserPermissions).then((data) => {
    const permited = [];
    console.log('permisos de usuario');
    delete data[0].user_id;
    for (const key in data[0]) {
      if (data[0].hasOwnProperty(key)) {
        if (data[0][key] === true) {
          permited.push(key);
        }
      }
    }
    const selectUser = new PQ({ text: 'SELECT * FROM users where id = $1', values: [userId] });
    // now the we need to grab the refreshtoken of the user knowing its id
    db.query(selectUser).then((data) => {
      let user = data;
      token = user[0].refreshtoken;
      const { id } = user[0];
      if (!token) return res.send({ accesstoken: '' });
      let payload = null;

      try {
        payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
      } catch (err) {
        return res.send({ accesstoken: '' });
      }

      user = '';
      const selectUser = new PQ({ text: 'SELECT * FROM users where id = $1', values: [id] });
      db.query(selectUser).then((data) => {
        user = data;
        if (!user) return res.send({ accesstoken: '' });
        // if user exists check if refreshtoken exist on user

        if (user[0].refreshtoken !== token) {
          return res.send({ accesstoken: '' });
        }

        // if token exist create a new Refresh and Accestoken
        const accesstoken = createAccessToken(user[0].id, permited);
        const refreshtoken = createRefreshToken(user[0].id);
        const setRefreshToken = new PQ({ text: 'UPDATE users SET refreshtoken = $1 where id = $2', values: [refreshtoken, user[0].id] });
        db.query(setRefreshToken).then(() => res.send({ accesstoken })).catch((error) => {
          console.log('ERROR: ', error);
        });
      }).catch((error) => {
        console.log('ERROR: ', error);
        res.send(error);
      });
    });
  });
}

module.exports = {
  requireLogin, register, login, verifyToken, logout, refreshToken,

};
