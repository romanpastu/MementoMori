require('dotenv/config')

//express use settings
const express = require("express");
const app = express();
const cors = require('cors');
const https = require('https');
const fs = require('fs');
//express settings
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

//Swagger doc
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express')
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "MementoMori API",
      description: "MementoMori API information. API tokens should be inputed like: 'Bearer: [token]'",
      contact: {
        name: "Román Pastshenko Slautskiy"
      },
      servers: ["http://localhost:1234"]
    }
  },
  apis: ["index.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))


/* Uncomment for https deployment (prod)
//Certificate

const privateKey = fs.readFileSync('/etc/letsencrypt/live/api.mementomori.io/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/api.mementomori.io/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/api.mementomori.io/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

const httpsServer = https.createServer(credentials, app);

*/

//db settings
const { db } = require('./database.js')
const PQ = require('pg-promise').ParameterizedQuery
//moment
var moment = require('moment');
moment().format();

//requires for jwt management and auth
const cookieParser = require('cookie-parser')
const { verify, decode } = require('jsonwebtoken')

const { hash, compare } = require('bcryptjs')
const { createAccessToken, createRefreshToken, sendAccessToken, sendRefreshToken } = require('./token.js')
const { isAuth } = require('./isAuth.js')
const { refresh } = require('./refresh.js')
const { isAuthRefreshed } = require('./isAuthRefreshed.js')

//express protection middleware
//this is yet to have implemented the refreshing route
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

//express calls

/**
 * @swagger
 * securityDefinitions:
 *  Bearer:
 *    type: apiKey
 *    name: Authorization
 *    in: header
 */

//User login/register/auth related queries

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
app.post('/register', async (req, res) => {

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
  let insertUser = new PQ({text: 'INSERT INTO USERS (email, password, birth_date, first_name, second_name) VALUES ($1, $2, $3, $4, $5)', values: [email, hashedPassword, birthDate, firstName, secondName]})
  db.query(insertUser).then(function (data) {
    console.log("inserted cant")
    console.log(data)
    let selectUser = new PQ({text: 'SELECT id from users where email = $1', values: [email]})
    db.query(selectUser).then(function (data) {
      let setPermissions = new PQ({text: 'INSERT INTO user_permissions values ($1, false, true, false, false, false)', values: [data[0].id]})
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
    
    if(error.code = '23505'){
      console.log("se manda?")
      res.send('User already exists')
      
    }
    
    console.log("ERROR: ", error)
    res.send("error")
  });

})
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
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    var user = "";
    let selectUser = new PQ({text: 'SELECT * FROM users where email = $1', values: [email]})
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
      let selectUserPermissions = new PQ({text: 'SELECT * FROM user_permissions WHERE user_id = $1',values: [user[0].id]})
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
        let setUserRefreshToken = new PQ({text:'UPDATE users SET refreshtoken = $1 where id = $2',values: [refreshtoken,user[0].id]})
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
})
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
app.post('/refresh_token', (req, res) => {
  const authorization = req.headers['authorization'];
  if (!authorization) throw new Error("You need to login");
  accesstoken = authorization.split(' ')[1];
  var userId = verify(accesstoken, process.env.ACCESS_TOKEN_SECRET, { ignoreExpiration: true })
  userId = userId.userId

  var token = ""
  let selectUserPermissions = new PQ({text: 'SELECT * FROM user_permissions WHERE user_id = $1', values: [userId]})
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
    let selectUser = new PQ({text: 'SELECT * FROM users where id = $1', values:[userId]})
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
      let selectUser = new PQ({text: 'SELECT * FROM users where id = $1', values:[id]})
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
        let setRefreshToken = new PQ({text: 'UPDATE users SET refreshtoken = $1 where id = $2', values:[refreshtoken, user[0].id]})
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

})
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
 *        description: Access Token Loged out Successfully || Provide a valid token. Logging out happens in both cases, but access token might not get invalidated if the connection was lost.
 */
//logout
app.post('/logout', async (req, res) => {

  const authorization = req.headers['authorization'];
  if (authorization == undefined) {
    res.status(200).send("provide a valid token")
  }
  const token = authorization.split(' ')[1];
  var decoded = decode(token, { complete: true });
  var userId = decoded.payload.userId
  let setRefreshTokenNull = new PQ({text: "UPDATE users set refreshtoken = 'null' where id = $1", values:[userId]})
  db.query(setRefreshTokenNull).then(data => {
    res.status(200).send("logged out")
  }).catch(err => {
    console.log(err)
    res.send(err)
  })

})

//token verification route 
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
app.post('/verify', async (req, res) => {
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
})

//protected route test

app.post('/protected', async (req, res) => {
  try {
    const userId = isAuth(req)
    if (userId !== null) {
      res.send({
        data: "This is protected data."
      })
    }
  } catch (err) {
    res.send({
      error: `${err.message}`
    })
  }
})

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
app.post('/generateCalendar', requireLogin, async (req, res) => {

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
})

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
app.get('/chart/lineal/emotion', requireLogin, async (req, res) => {
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
})


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
app.get('/chart/cumulative/emotion', requireLogin, async (req, res) => {
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
})

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
app.get('/chart/cumulative-maxpotential/emotion', requireLogin, async (req, res) => {
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
  let selectData = new PQ({text: "SELECT birth_date::varchar, register_date::varchar from users where id = $1;", values: [userId]})
  db.query(selectData).then(data => {

    var currentWeek = getCurrentWeek(data[0].birth_date)
    // currentWeek = 1189 //dummy to select an incremented current week, delete
    var registerDate = getWeeksToRegisterDate(data[0].register_date, data[0].birth_date)
    let selectData2 = new PQ({text:"SELECT cf.rating, cf.week_number from calendar_field cf join calendar c on (c.id = cf.calendar_id) where week_number >= $1 and week_number <= $2 and user_id = $3", values: [registerDate,currentWeek,userId]})
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
})

//Get pie chart
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
app.get('/chart/pie/emotion', requireLogin, async (req, res) => {
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
  let selectData = new PQ({text: 'SELECT birth_date::varchar, register_date::varchar from users where id = $1 ;', values: [userId]})
  db.query(selectData).then(data => {

    var currentWeek = getCurrentWeek(data[0].birth_date)
    // currentWeek = 1400 //dummy to select an incremented current week, delete
    var registerDate = getWeeksToRegisterDate(data[0].register_date, data[0].birth_date)
    let selectData2 = new PQ({text: "SELECT cf.rating, cf.week_number from calendar_field cf join calendar c on (c.id = cf.calendar_id) where week_number >= $1 and week_number <= $2 and user_id = $3", values: [registerDate, currentWeek, userId]})
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
})

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
app.post('/update/field', requireLogin, async (req, res) => {
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



})



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
app.get('/getUserGenerateCalendar', requireLogin, async (req, res) => {
  const authorization = req.headers['authorization'];
  if (authorization == undefined) {
    res.send("provide a valid token")
  }
  const token = authorization.split(' ')[1];
  var decoded = decode(token, { complete: true });
  var userId = decoded.payload.userId
  let selectCalendar = new PQ({text: 'SELECT birth_date::varchar, years_to_live::varchar, register_date::varchar, death_date::varchar, weeks_to_live from users where id = $1', values:[userId]})
  db.query(selectCalendar).then(data =>{
    var dataToSend = [{}]
    dataToSend[0].birthDate = data[0].birth_date;
    dataToSend[0].years_to_live = data[0].years_to_live;
    dataToSend[0].register_date = data[0].register_date;
    dataToSend[0].death_date = data[0].death_date;
    dataToSend[0].weeks_to_live = data[0].weeks_to_live;
    res.send(dataToSend[0])

  }).catch(err =>{
    console.log(err)
    res.send(err)
  })


  
})

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
app.get('/getUserFieldsInfo', requireLogin, async (req, res) => {
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

})

//User Crud Related Routes
/**
 * @swagger
 * /userlist:
 *  get:
 *    security:
 *       - Bearer: []
 *    description: Returns the info of all users
 *    produces:
 *       - application/json, text/plain
 *    responses:
 *      'array-json':
 *        description: Returns an array containing an object with all the users.
 *      '400':
 *        description: Admin restricted action.
 *      '$error':
 *        description: Various errors.
 */
app.get("/userlist", requireLogin, function (req, res) {

  const authorization = req.headers['authorization'];
  if (authorization == undefined) {
    res.send("provide a valid token")
  }
  const token = authorization.split(' ')[1];
  var decoded = decode(token, { complete: true });

  var permited = decoded.payload.permited;
  if (!permited.includes("admin")) {
    res.status(400).send("this actions is limited to admins")
    throw new Error("Token doesn't belong to an admin")
  }

  let selectUsers = new PQ({text: 'SELECT * FROM users'})
  db.query(selectUsers).then(data => {
    res.send(data)
  }).catch(err => {
    res.send(err)
  })
})

//for admin
/**
 * @swagger
 * /user/delete/:id:
 *  post:
 *    security:
 *       - Bearer: []
 *    description: Deletes an user given his id
 *    produces:
 *       - Status code
 *    parameters:
 *       - id: User id
 *         description: The user id
 *         in: request parameter
 *         required: true
 *    responses:
 *      '200':
 *        description: User deleted properly.
 *      '400':
 *        description: Admin restricted action.
 *      '$error':
 *        description: Various errors.
 */
app.post("/user/delete/:id", requireLogin, function (req, res) {
  const authorization = req.headers['authorization'];
  if (authorization == undefined) {
    res.send("provide a valid token")
  }
  const token = authorization.split(' ')[1];
  var decoded = decode(token, { complete: true });

  var permited = decoded.payload.permited;
  if (!permited.includes("admin")) {
    res.status(400).send("this actions is limited to admins")
    throw new Error("Token doesn't belong to an admin")
  }
  let deleteUser = new PQ({text: 'DELETE FROM users where id = $1', values: [req.params.id]})
  db.query(deleteUser).then(data => {
    res.status(200).send("deleted");
  }).catch(err => res.send(err))
})

//for admin
/**
 * @swagger
 * /user/update/:id:
 *  post:
 *    security:
 *       - Bearer: []
 *    description: Updates an user given his id
 *    produces:
 *       - Status code
 *    parameters:
 *       - id: User id
 *         description: The user id
 *         in: request parameter
 *         required: true
 *       - id: First Name
 *         required: true
 *         in: Form Data
 *       - id: Second Name
 *         required: true
 *         in: Form Data
 *       - id: Email
 *         required: true
 *         in: Form Data
 *       - id: Password 1
 *         in: Form Data
 *       - id: Password 2
 *         in: Form Data
 *    responses:
 *      '200':
 *        description: User updated properly.
 *      '400':
 *        description: Token doesnt belon to the admin.
 *      '402':
 *        description: Invalid Names.
 *      '401':
 *        description: Invalid Mail.
 *      '403':
 *        description: Passwords dont match.
 *      '405':
 *        description: Error / DB Error.
 */
app.post("/user/update/:id", requireLogin, async (req, res) => {
  const authorization = req.headers['authorization'];
  if (authorization == undefined) {
    res.send("provide a valid token")
  }
  const token = authorization.split(' ')[1];
  var decoded = decode(token, { complete: true });

  var permited = decoded.payload.permited;
  if (!permited.includes("admin")) {
    res.status(400).send("this actions is limited to admins")
    throw new Error("Token doesn't belong to an admin")
  }

  const { firstName, secondName, mail, password1, password2 } = req.body
  const userId = req.params.id

  if (firstName == "" || secondName == "") {
    res.status(402).send("invalid names")
    throw new Error("invalid names");
  }

  //checks if the mail is valid
  if ((mail.match(/@/g) || []).length != 1) {
    res.status(401).send("invalid mail")
    throw new Error("Invalid mail");
  };

  if (password1 != password2) {
    res.status(403).send("password dont match")
    throw new Error("Passwords dont mach")
  }

  let updateUser = new PQ({text: 'UPDATE users SET email = $1 , first_name = $2 , second_name = $3 where id = $4', values:[mail, firstName, secondName, userId]})
  db.query(updateUser).then(async (data) => {


    if (password1 != "") {

      var pass = await hash(password1, 10)
      let updateUserPassword = new PQ({text: 'UPDATE users SET password = $1 where id = $2', values: [pass, userId]})
      db.query(updateUserPassword).then(data => {
        res.status(200).send("user data updated")
      }).catch(err => {
        res.status(405).send("db error")
        console.log(err)
      })
    } else {
      res.status(200).send("user data updated")
    }
  }
  ).catch(err => {
    res.status(405).send("db error")
    console.log(err)
  })
})


//for user
/**
 * @swagger
 * /user/update:
 *  post:
 *    security:
 *       - Bearer: []
 *    description: Updates an user given an accesstoken
 *    produces:
 *       - Status code
 *    parameters:
 *       - id: User id
 *         description: The user id
 *         in: request parameter
 *         required: true
 *       - id: First Name
 *         required: true
 *         in: Form Data
 *       - id: Second Name
 *         required: true
 *         in: Form Data
 *       - id: Email
 *         required: true
 *         in: Form Data
 *       - id: Password 1
 *         in: Form Data
 *       - id: Password 2
 *         in: Form Data
 *    responses:
 *      '200':
 *        description: User updated properly.
 *      '402':
 *        description: Invalid Names.
 *      '401':
 *        description: Invalid Mail.
 *      '403':
 *        description: Passwords dont match.
 *      '404':
 *        description: Weak password
 *      '405':
 *        description: Error / DB Error.
 */
app.post('/user/update', requireLogin, function (req, res) {
  const authorization = req.headers['authorization'];
  if (authorization == undefined) {
    res.send("provide a valid token")
  }
  const token = authorization.split(' ')[1];
  var decoded = decode(token, { complete: true });
  var userId = decoded.payload.userId

  const { firstName, secondName, mail, password1, password2 } = req.body


  if (firstName == "" || secondName == "") {
    res.status(402).send("invalid names")
    throw new Error("invalid names");
  }

  //checks if the mail is valid
  if ((mail.match(/@/g) || []).length != 1) {
    res.status(401).send("invalid mail")
    throw new Error("Invalid mail");
  };

  if (password1 != password2) {
    res.status(403).send("password dont match")
    throw new Error("Passwords dont mach")
  }

  
  let updateQuery = new PQ({text: 'UPDATE users SET email = $1 , first_name = $2 , second_name = $3 where id = $4', values:[mail, firstName, secondName, userId]})
  db.query(updateQuery).then(async (data) => {


    if (password1 != "") {
      if (!password2.match(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)) {
        res.status(404).send(new Error('Weak password, it must have, make sure it has 1 upper case, 1 lower case, 1 number/special character, and its at least 8 characters long.'))
        throw new Error("Weak password, it must have, make sure it has 1 upper case, 1 lower case, 1 number/special character, and its at least 8 characters long.")
      }
      
      var pass = await hash(password1, 10)
      let updatePasswordQuery = new PQ({text: 'UPDATE users SET password = $1 where id = $2', values:[pass, userId]})
      db.query(updatePasswordQuery).then(data => {

        res.status(200).send("user data updated")
      }).catch(err => {
        res.status(405).send("db error")
        console.log(err)
      })
    } else {
      res.status(200).send("user data updated")
    }
  }
  ).catch(err => {
    res.status(405).send("db error")
    console.log(err)
  })
})
//for user
 /**
 * @swagger
 * /user/info:
 *  get:
 *    security:
 *       - Bearer: []
 *    description: Returns the info of an user
 *    produces:
 *       - Status code | Array-Json
 *    responses:
 *      'user-info[JSON]':
 *        description: Returns the info of the user.
 *      '$error':
 *        description: Various errors.
 */
app.get('/user/info', requireLogin, function (req, res) {
  const authorization = req.headers['authorization'];
  if (authorization == undefined) {
    res.send("provide a valid token")
  }
  const token = authorization.split(' ')[1];
  var decoded = decode(token, { complete: true });
  var userId = decoded.payload.userId
  let selectInfo = new PQ({text: 'SELECT * FROM users where id= $1', values: [userId]})
  db.query(selectInfo).then(data => {
    res.send(data)
  }).catch(err => {
    res.send(err)
  })


})
//for user
 /**
 * @swagger
 * /user/delete:
 *  post:
 *    security:
 *       - Bearer: []
 *    description: Deletes the user whose token is provided
 *    produces:
 *       - Status code
 *    responses:
 *      '200':
 *        description: User deleted properly.
 *      '$error':
 *        description: Various errors.
 */
app.post("/user/delete", requireLogin, function (req, res) {
  const authorization = req.headers['authorization'];
  if (authorization == undefined) {
    res.send("provide a valid token")
  }
  const token = authorization.split(' ')[1];
  var decoded = decode(token, { complete: true });
  var userId = decoded.payload.userId
  let deleteUser = new PQ({text: 'DELETE FROM users where id = $1', values: [userId]})
  db.query(deleteUser).then(data => {
    res.status(200).send("deleted");
  }).catch(err => res.send(err))
})

//Express port

/*Replace app with httpsServer for prod deployment , deployment port == 1111*/

app.listen(1234, () => {
  console.log("Server is listening on port: 1234");
});
