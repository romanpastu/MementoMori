
let constants = require('./constants.js')
//express use settings
const express = require("express");
const app = express();

//db settings
const pgp = require("pg-promise")();
const db = pgp(constants.dbUrl)

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


//Express port
app.listen(1234, () => {
  console.log("Server is listening on port: 1234");
});