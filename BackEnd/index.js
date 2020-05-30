require('dotenv/config')
let constants = require('./constants.js')

//express use settings
const express = require("express");
const app = express();
const cors = require('cors');

//express settings
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());





//db settings
const pgp = require("pg-promise")();
const db = pgp(constants.dbUrl)

//moment
var moment = require('moment');
moment().format();

//requires for jwt management and auth
const cookieParser = require('cookie-parser')
const { verify } = require('jsonwebtoken')
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
//default helloworld
app.get("/hello", (req, res) => {
  res.send("Hello world");
});
//protected helloworld
app.get("/helloP", requireLogin, (req, res) => {
  res.send("Hello world");
});

app.post("/test", (req, res) => {
  db.query("SELECT * FROM test").then(data => {
    console.log(data)
    res.send(data);
  }).catch(err => {
    err.send("fail")
  })

})

//User login/register/auth related queries

app.post('/register', async (req, res) => {
  console.log(req.body)
  const { email, firstName, secondName, password1, password2, birthDate } = req.body;
  console.log(email, firstName, secondName, password1, password2, birthDate)
  var current_date = moment().format('YYYY-MM-DD');
  // if moment(birthDate).isAfter(m)
  if (password1 != password2) {
    res.status(400).send(new Error('Passwords must be equal'));
  }
  if (password2 == '') {
    res.status(405).send(new Error('Theres no password'));
  }
  if (!email.match(/@/g)) {
    res.status(401).send(new Error('wrong email'))
  }
  if (firstName == '') {
    res.status(402).send(new Error('You must specify a first name'))
  }

  if (moment(birthDate).isAfter(current_date, 'day')) {
    console.log("date")
    res.status(403).send(new Error('You cant be born in the future'))
  }

  if (birthDate == '') {
    res.status(404).send(new Error('No date'))
  }


  const password = password2;
  const hashedPassword = await hash(password, 10);
  db.query("INSERT INTO USERS (email, password, birth_date, first_name, second_name) VALUES ('" + email + "','" + hashedPassword + "','" + birthDate + "','" + firstName + "','" + secondName + "')").then(function (data) {
    db.query("SELECT id from users where email='" + email + "';").then(function (data) {
      db.query("INSERT INTO user_permissions values ('" + data[0].id + "', 'false', 'true')").then(function (data) {
        res.send("inserted");
        console.log("inserted")
      }).catch(function (error) {
        console.log("ERROR: ", error)
        res.send("error")
      });
    }).catch(function (error) {
      console.log("ERROR: ", error)
      res.send("error")
    });
  }).catch(function (error) {
    console.log("ERROR: ", error)
    res.send("error")
  });

})

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password)
  try {
    var user = "";
    db.query("SELECT * FROM users WHERE email='" + email + "'").then(async function (data) {
      user = data;
      if (!user[0]) {
        res.send("error");
        throw new Error("User doesnt exist");
      }
      const valid = await compare(password, user[0].password);
      if (!valid) {
        res.send("error");
        throw new Error("Password not corect");
      }
      //selects the permissions
      db.query("SELECT * FROM user_permissions WHERE user_id='" + user[0].id + "'").then(function (data) {
        var permited = [];
        console.log("permisos de usuario")
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
        const accesstoken = createAccessToken(user[0].id, permited);
        console.log(accesstoken)
        const refreshtoken = createRefreshToken(user[0].id);
        db.query("UPDATE users SET refreshtoken = '" + refreshtoken + "' WHERE id = '" + user[0].id + "';").then(function (data) {
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

app.post('/refresh_token', (req, res) => {

  const authorization = req.headers['authorization'];

  if (!authorization) throw new Error("You need to login");
  accesstoken = authorization.split(' ')[1];
  var userId = verify(accesstoken, process.env.ACCESS_TOKEN_SECRET, { ignoreExpiration: true })
  userId = userId.userId

  var token = ""

  db.query("SELECT * FROM user_permissions WHERE user_id='" + userId + "'").then(function (data) {
    var permited = [];
    console.log("permisos de usuario")
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

    //now the we need to grab the refreshtoken of the user knowing its id
    db.query("SELECT * FROM users WHERE id='" + userId + "'").then(function (data) {
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
      db.query("SELECT * FROM users WHERE id='" + id + "'").then(function (data) {
        user = data;
        if (!user) return res.send({ accesstoken: '' });
        //if user exists check if refreshtoken exist on user

        if (user[0].refreshtoken !== token) {
          return res.send({ accesstoken: '' })
        }

        //if token exist create a new Refresh and Accestoken
        const accesstoken = createAccessToken(user[0].id, permited);
        const refreshtoken = createRefreshToken(user[0].id);

        db.query("UPDATE users SET refreshtoken = '" + refreshtoken + "' WHERE id = '" + user[0].id + "';").then(function (data) {
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

//token verification route 
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

//generate calendar
app.post('/generateCalendar', requireLogin, async (req, res) => {

  const userId = req.body.userId
  const yearsToLive = Math.trunc(req.body.yearsToLive).toString()
  const registerDate = req.body.registerDate

  function filterDate(date) {
    var stringDate = moment(date).format('YYYY-MM-DD').toString();
    console.log("dentro del filter date")
    var result = stringDate.match(/(?:(?!T).)*/)
    return result[0];
  }

  function getWeeksToLive(death_date, birth_date) {
    //returns the weeks to live between death and birth date, rounded to upper week

    var weeks_to_live = moment(death_date).diff(moment(birth_date), 'days') / 7;
    console.log("semanas a vivir: " + Math.ceil(weeks_to_live))
    return Math.ceil(weeks_to_live);
  }


  if (yearsToLive > 100 || yearsToLive < 1) {
    res.status(400).send(new Error('Invalid years'));
  }


  //sets the deathDate and weeksToLive in the database
  db.query("SELECT * from users where id =" + userId).then(data => {
    var birth_date = data[0].birth_date
    var deathDate = ""
    //sets the death_date and the weeks to live
    deathDate = moment(filterDate(birth_date)).add(yearsToLive, 'years')
    db.query("UPDATE users SET death_date = '" + moment(deathDate).format('YYYY-MM-DD').toString() + "' , weeks_to_live = '" + getWeeksToLive(deathDate, birth_date) + "' WHERE id = '" + userId + "';").then(data => {
      console.log(data)
      /*******/
      //Sets the yearsToLive and registerDate in the database
      db.query("UPDATE users SET years_to_live =  '" + yearsToLive + "' , register_date = '" + registerDate + "'  WHERE id = '" + userId + "';").then(data => {
        console.log(data)
        db.query("INSERT INTO calendar (user_id) values ('" + userId + "');").then(data => {
          console.log(data)
          // res.send(data)
          /*******/
          /*gets the calendar id related to the current user*/
          db.query("SELECT id from calendar where user_id='" + userId + "';").then(data => {
            console.log(data[0].id)
            /*******/
            //Sets all the field for the calendar
            db.query("INSERT INTO calendar_field (text, rating, calendar_id, week_number) select '', 0, c.id, g.wn from calendar c join users u on u.id = c.user_id cross join generate_series(1, u.weeks_to_live) as g(wn) where c.id='" + data[0].id + "';").then(data => {
              console.log(data);
              console.log("series generated")
              /******/
              //the lifeExpectanceSet restriction is removed and access to dashboard is granted
              db.query("UPDATE user_permissions SET life_expectancy =  'false' , dashboard = 'true' , stats = 'true', admin = 'false'  WHERE user_id = '" + userId + "';").then(data => {
                console.log("everything generated")
                res.send("100")
                console.log(data)
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
app.get('/chart/lineal/emotion/:id', requireLogin, async (req, res) => {
  const userId = req.params.id

  function getCurrentWeek(birth_date) {
    var current_date = moment();
    var weeks_to_date = moment(new Date(current_date)).diff(birth_date, 'days') / 7;
    return Math.floor(weeks_to_date);
  }

  function getWeeksToRegisterDate(register_date, birth_date) {
    var weeks_to_date = moment(new Date(register_date)).diff(birth_date, 'days') / 7;
    return Math.floor(weeks_to_date);
  }

  db.query("SELECT birth_date::varchar, register_date::varchar from users where id = '" + userId + "';").then(data => {
    // console.log(data[0].birth_date)
    var currentWeek = getCurrentWeek(data[0].birth_date)
    // currentWeek = 1189 //dummy to select an incremented current week, delete
    var registerDate = getWeeksToRegisterDate(data[0].register_date, data[0].birth_date)
    console.log(currentWeek)
    console.log(registerDate)
    db.query("SELECT cf.rating, cf.week_number from calendar_field cf join calendar c on (c.id = cf.calendar_id) where week_number >='" + registerDate + "' and week_number <= '" + currentWeek + "' and user_id='" + userId + "';").then(response => {
      console.log(data)
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
        "id": "emotion",
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
app.get('/chart/cumulative/emotion/:id', requireLogin, async (req, res) => {
  const userId = req.params.id

  function getCurrentWeek(birth_date) {
    var current_date = moment();
    var weeks_to_date = moment(new Date(current_date)).diff(birth_date, 'days') / 7;
    return Math.floor(weeks_to_date);
  }

  function getWeeksToRegisterDate(register_date, birth_date) {
    var weeks_to_date = moment(new Date(register_date)).diff(birth_date, 'days') / 7;
    return Math.floor(weeks_to_date);
  }

  db.query("SELECT birth_date::varchar, register_date::varchar from users where id = '" + userId + "';").then(data => {

    var currentWeek = getCurrentWeek(data[0].birth_date)
    // currentWeek = 1189 //dummy to select an incremented current week, delete
    var registerDate = getWeeksToRegisterDate(data[0].register_date, data[0].birth_date)

    db.query("SELECT cf.rating, cf.week_number from calendar_field cf join calendar c on (c.id = cf.calendar_id) where week_number >='" + registerDate + "' and week_number <= '" + currentWeek + "' and user_id='" + userId + "';").then(response => {
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
        "id": "cumulative emotion",
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
app.get('/chart/cumulative-maxpotential/emotion/:id', requireLogin, async (req, res) => {
  const userId = req.params.id

  function getCurrentWeek(birth_date) {
    var current_date = moment();
    var weeks_to_date = moment(new Date(current_date)).diff(birth_date, 'days') / 7;
    return Math.floor(weeks_to_date);
  }

  function getWeeksToRegisterDate(register_date, birth_date) {
    var weeks_to_date = moment(new Date(register_date)).diff(birth_date, 'days') / 7;
    return Math.floor(weeks_to_date);
  }

  db.query("SELECT birth_date::varchar, register_date::varchar from users where id = '" + userId + "';").then(data => {

    var currentWeek = getCurrentWeek(data[0].birth_date)
    // currentWeek = 1189 //dummy to select an incremented current week, delete
    var registerDate = getWeeksToRegisterDate(data[0].register_date, data[0].birth_date)

    db.query("SELECT cf.rating, cf.week_number from calendar_field cf join calendar c on (c.id = cf.calendar_id) where week_number >='" + registerDate + "' and week_number <= '" + currentWeek + "' and user_id='" + userId + "';").then(response => {
      var data = response;
      var dataComposed = []
      var obj = {}
      for (let i in data) {

        obj["x"] = data[i]["week_number"]
        obj["y"] = data[i]["rating"]
        dataComposed.push(obj)
        obj = {}
      }
      // console.log("composed data-------------")
      // console.log(dataComposed)
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
        "id": "cumulative emotion",
        "color": "blue",
        "data": dataComposed
      }, {
        "id": "max potential accumulated emotion",
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
app.get('/chart/pie/emotion/:id', requireLogin, async (req, res) => {
  const userId = req.params.id

  function getCurrentWeek(birth_date) {
    var current_date = moment();
    var weeks_to_date = moment(new Date(current_date)).diff(birth_date, 'days') / 7;
    return Math.floor(weeks_to_date);
  }

  function getWeeksToRegisterDate(register_date, birth_date) {
    var weeks_to_date = moment(new Date(register_date)).diff(birth_date, 'days') / 7;
    return Math.floor(weeks_to_date);
  }

  db.query("SELECT birth_date::varchar, register_date::varchar from users where id = '" + userId + "';").then(data => {

    var currentWeek = getCurrentWeek(data[0].birth_date)
    // currentWeek = 1400 //dummy to select an incremented current week, delete
    var registerDate = getWeeksToRegisterDate(data[0].register_date, data[0].birth_date)

    db.query("SELECT cf.rating, cf.week_number from calendar_field cf join calendar c on (c.id = cf.calendar_id) where week_number >='" + registerDate + "' and week_number <= '" + currentWeek + "' and user_id='" + userId + "';").then(response => {
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
app.post('/update/field', requireLogin, async (req, res) => {
  const userId = req.body.userId
  const week_number = req.body.week_number
  const emotionrating = req.body.emotionRating
  const description = req.body.description


  db.query("SELECT cf.id from calendar_field cf join calendar c on (c.id = cf.calendar_id) where week_number='" + week_number + "' and user_id='" + userId + "';").then(data => {

    db.query("UPDATE calendar_field SET text = '" + description + "' , rating = '" + emotionrating + "' where id= '" + data[0].id + "';").then(data => {

      res.send(200)
    }).catch(err => {
      console.log(err)
    });
  }).catch(err => {
    console.log(err)
  })



})



//get user
app.get('/getUserGenerateCalendar/:id', requireLogin, async (req, res) => {
  const userId = req.params.id

  db.query("SELECT * FROM users where id = '" + userId + "';").then(data => {


    //individuals selects are done to skip the formating of a multiselect where a string should be reparsed
    var dataToSend = [{}]
    db.query("SELECT (birth_date::varchar) from users where id ='" + userId + "';").then(data => {

      dataToSend[0].birthDate = data[0].birth_date;

      db.query("SELECT (years_to_live::varchar) from users where id ='" + userId + "';").then(data => {
        dataToSend[0].years_to_live = data[0].years_to_live;

        db.query("SELECT (register_date::varchar) from users where id ='" + userId + "';").then(data => {
          dataToSend[0].register_date = data[0].register_date;

          db.query("SELECT (death_date::varchar) from users where id ='" + userId + "';").then(data => {
            dataToSend[0].death_date = data[0].death_date;

            db.query("SELECT (weeks_to_live) from users where id ='" + userId + "';").then(data => {
              dataToSend[0].weeks_to_live = data[0].weeks_to_live;

              res.send(dataToSend[0])
            })


          })
        })
      })
    })
    // dataToSend[0].birthDate = data[0].birth_date;
    // dataToSend[0].years_to_live = data[0].years_to_live;
    // dataToSend[0].register_date = data[0].register_date;
    // dataToSend[0].death_date = data[0].death_date

  }).catch(err => {

    console.log(err)
    res.send(err)
  })
})

//get user field info
app.get('/getUserFieldsInfo/:id', requireLogin, async (req, res) => {
  const userId = req.params.id
  console.log(userId)
  db.query("SELECT CF.text, CF.rating, CF.week_number from calendar C join calendar_field CF on C.id = CF.calendar_id where C.user_id = '" + userId + "';").then(data =>
    res.send(data)
  ).catch(err => {
    console.log(err)
    res.send(err)
  })

})

//User Crud Related Routes

app.get("/userlist", function (req, res) {
  db.query("SELECT * FROM users").then(data => {
    console.log(data)
    res.send(data)
  })
})

app.post("/user/delete/:id", requireLogin, function (req, res) {
  console.log(req.params.id)
  db.query("DELETE FROM users where id=" + req.params.id).then(data => {
    res.status(200).send("deleted");
  }).catch(err => res.send(err))
})

app.post("/user/update/:id", requireLogin, async (req, res) => {
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
  } else if (password1 != "") {
    var pass = await hash(req.password1, 10)

    db.query("UPDATE users SET password='" + pass + "' where id='" + userId + "';").then(data => {
      console.log("primer update")
    }).catch(err => {
      res.status(405).send("db error")
      console.log(err)
    })
  }

  db.query("UPDATE users SET email='" + mail + "' , first_name='" + firstName + "',second_name='" + secondName + "' where id='" + userId + "' ;").then(data => {
    console.log("ultimo update")
    res.status(200).send("user data updated")
  }).catch(err => {
    res.status(405).send("db error")
    console.log(err)
  })


  // console.log(firstName, secondName, mail, password1, password2)
})

//Express port
app.listen(1234, () => {
  console.log("Server is listening on port: 1234");
});
