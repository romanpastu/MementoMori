const { verify } = require('jsonwebtoken');
let constants = require('./constants.js')
let pgp = require("pg-promise")(/*options*/);
let db = pgp(constants.dbUrl);
const { createAccessToken, createRefreshToken, sendAccessToken, sendRefreshToken } = require('./token.js')


const refresh = async (req) => {
    const authorization = req.headers['authorization'];
    
    if (!authorization) throw new Error("You need to login");
    accesstoken = authorization.split(' ')[1];
    var userId = verify(accesstoken, process.env.ACCESS_TOKEN_SECRET, { ignoreExpiration: true })
    userId = userId.userId

    var token = ""

    return db.query("SELECT * FROM user_permissions WHERE user_id='" + userId + "'").then(function (data) {
        var permited = [];
        // console.log("permisos de usuario")
        delete data[0].user_id
        for (var key in data[0]) {
            if (data[0].hasOwnProperty(key)) {
                if (data[0][key] === true) {
                    permited.push(key)
                }
                // console.log(key + " -> " + data[0][key]);
            }
        }
        // console.log(permited)

        //CASE 1(Front end): this is for the case when its coming from rect and is unable to read the private cookie, so it received an encrypted id that will identify the user so we are able to get its refresh token, client to server connection
        //now the we need to grab the refreshtoken of the user knowing its id
        return db.query("SELECT * FROM users WHERE id='" + userId + "'").then(function (data) {
            var user = data;
            token = user[0].refreshtoken;
            var id = user[0].id;
            if (!token) return { accesstoken: '' };
            let payload = null;

            try {
                payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
            } catch (err) {
                return { accesstoken: '' };
            }

            user = "";
            return db.query("SELECT * FROM users WHERE id='" + id + "'").then(function (data) {
                user = data;
                if (!user) return { accesstoken: '' };
                //if user exists check if refreshtoken exist on user

                if (user[0].refreshtoken !== token) {
                    return { accesstoken: '' }
                }

                //if token exist create a new Refresh and Accestoken
                const accesstoken = createAccessToken(user[0].id, permited);
                const refreshtoken = createRefreshToken(user[0].id);


                return db.query("UPDATE users SET refreshtoken = '" + refreshtoken + "' WHERE id = '" + user[0].id + "';").then(function (data) {
                    // sendRefreshToken(res, refreshtoken); //unnecesary
                    
                    return { accesstoken };

                }).catch(function (error) {
                    console.log("ERROR: ", error)
                })


            }).catch(function (error) {
                console.log("ERROR: ", error)
                return error;
            })
        })
})
}
module.exports =  {
 refresh
}