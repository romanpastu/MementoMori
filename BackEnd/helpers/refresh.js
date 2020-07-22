const { verify } = require('jsonwebtoken');
const { db } = require('../database/database.js');
const {
  createAccessToken, createRefreshToken,
} = require('./token.js');

const refresh = async (req) => {
  const { authorization } = req.headers;

  if (!authorization) throw new Error('You need to login');
  const accesstoken = authorization.split(' ')[1];
  let userId = verify(accesstoken, process.env.ACCESS_TOKEN_SECRET, { ignoreExpiration: true });
  userId = userId.userId;

  let token = '';

  return db.query(`SELECT * FROM user_permissions WHERE user_id='${userId}'`).then((data) => {
    const permited = [];
    // console.log("permisos de usuario")
    delete data[0].user_id;
    for (const key in data[0]) {
      if (data[0].hasOwnProperty(key)) {
        if (data[0][key] === true) {
          permited.push(key);
        }
        // console.log(key + " -> " + data[0][key]);
      }
    }
    // console.log(permited)

    // CASE 1(Front end): this is for the case when its coming from rect and is unable to
    // read the private cookie, so it received an encrypted id that will identify the user
    // so we are able to get its refresh token, client to server connection

    // now the we need to grab the refreshtoken of the user knowing its id
    return db.query(`SELECT * FROM users WHERE id='${userId}'`).then((data) => {
      let user = data;
      token = user[0].refreshtoken;
      const { id } = user[0];
      if (!token) return { accesstoken: '' };
      let payload = null;

      try {
        payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
      } catch (err) {
        return { accesstoken: '' };
      }

      user = '';
      return db.query(`SELECT * FROM users WHERE id='${id}'`).then((data) => {
        user = data;
        if (!user) return { accesstoken: '' };
        // if user exists check if refreshtoken exist on user

        if (user[0].refreshtoken !== token) {
          return { accesstoken: '' };
        }

        // if token exist create a new Refresh and Accestoken
        const accesstoken = createAccessToken(user[0].id, permited);
        const refreshtoken = createRefreshToken(user[0].id);

        return db.query(`UPDATE users SET refreshtoken = '${refreshtoken}' WHERE id = '${user[0].id}';`).then((data) =>
        // sendRefreshToken(res, refreshtoken); //unnecesary

          ({ accesstoken })).catch((error) => {
          console.log('ERROR: ', error);
        });
      }).catch((error) => {
        console.log('ERROR: ', error);
        return error;
      });
    });
  });
};
module.exports = {
  refresh,
};
