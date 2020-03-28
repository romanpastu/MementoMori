
let constants = require('./constants.js')

//express use settings
const express = require("express");
const app = express();


//express settings
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//db settings
const pgp = require("pg-promise")();
const db = pgp(constants.dbUrl)

//requires for jwt management and auth
const { hash, compare } = require('bcryptjs')

//express calls
app.get("/hello", (req, res) => {
    res.send("Hello world");
  });

app.post("/test", (req, res) =>{
    db.query("SELECT * FROM test").then( data => {
      console.log(data)
      res.send(data);
    }).catch( err => {
      err.send("fail")
    })
    
})

//User register related queries

app.post('/register', async(req,res) => {

  const {email,password} = req.body;

  const hashedPassword = await hash(password,10);
  db.query("INSERT INTO USERS (email, password) VALUES ('" + email + "','" + hashedPassword + "')").then(function (data) {
    db.query("SELECT id from users where email='" + email + "';").then(function (data) {
      db.query("INSERT INTO user_permissions values ('" + data[0].id + "', 'true')").then(function(data){
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

//Express port
app.listen(1234, () => {
  console.log("Server is listening on port: 1234");
});