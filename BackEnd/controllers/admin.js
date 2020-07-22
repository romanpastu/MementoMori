const PQ = require('pg-promise').ParameterizedQuery;
const { decode } = require('jsonwebtoken');
const { hash } = require('bcryptjs');
const moment = require('moment');
const { db } = require('../database/database');

moment().format();

async function getUserList(req, res) {
  const { authorization } = req.headers;
  if (authorization === undefined) {
    res.send('provide a valid token');
  }
  const token = authorization.split(' ')[1];
  const decoded = decode(token, { complete: true });

  const { permited } = decoded.payload;
  if (!permited.includes('admin')) {
    res.status(400).send('this actions is limited to admins');
    throw new Error("Token doesn't belong to an admin");
  }

  const selectUsers = new PQ({ text: 'SELECT * FROM users' });
  db.query(selectUsers).then((data) => {
    res.send(data);
  }).catch((err) => {
    res.send(err);
  });
}

async function deleteUser(req, res) {
  const { authorization } = req.headers;
  if (authorization === undefined) {
    res.send('provide a valid token');
  }
  const token = authorization.split(' ')[1];
  const decoded = decode(token, { complete: true });

  const { permited } = decoded.payload;
  if (!permited.includes('admin')) {
    res.status(400).send('this actions is limited to admins');
    throw new Error("Token doesn't belong to an admin");
  }
  const deleteUser = new PQ({ text: 'DELETE FROM users where id = $1', values: [req.params.id] });
  db.query(deleteUser).then(() => {
    res.status(200).send('deleted');
  }).catch((err) => res.send(err));
}

async function updateUser(req, res) {
  const { authorization } = req.headers;
  if (authorization == undefined) {
    res.send('provide a valid token');
  }
  const token = authorization.split(' ')[1];
  const decoded = decode(token, { complete: true });

  const { permited } = decoded.payload;
  if (!permited.includes('admin')) {
    res.status(400).send('this actions is limited to admins');
    throw new Error("Token doesn't belong to an admin");
  }

  const {
    firstName, secondName, mail, password1, password2,
  } = req.body;
  const userId = req.params.id;

  if (firstName === '' || secondName === '') {
    res.status(402).send('invalid names');
    throw new Error('invalid names');
  }

  // checks if the mail is valid
  if ((mail.match(/@/g) || []).length !== 1) {
    res.status(401).send('invalid mail');
    throw new Error('Invalid mail');
  }

  if (password1 !== password2) {
    res.status(403).send('password dont match');
    throw new Error('Passwords dont mach');
  }

  const updateUser = new PQ({ text: 'UPDATE users SET email = $1 , first_name = $2 , second_name = $3 where id = $4', values: [mail, firstName, secondName, userId] });
  db.query(updateUser).then(async () => {
    if (password1 != '') {
      const pass = await hash(password1, 10);
      const updateUserPassword = new PQ({ text: 'UPDATE users SET password = $1 where id = $2', values: [pass, userId] });
      db.query(updateUserPassword).then(() => {
        res.status(200).send('user data updated');
      }).catch((err) => {
        res.status(405).send('db error');
        console.log(err);
      });
    } else {
      res.status(200).send('user data updated');
    }
  }).catch((err) => {
    res.status(405).send('db error');
    console.log(err);
  });
}

module.exports = {
  getUserList, deleteUser, updateUser,
};
