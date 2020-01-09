const express = require("express");
const app = express();
var mUserModel = require('./models/UserModel');
var mongoose = require("mongoose");

//mongo database connection
mongoose.connect('mongodb+srv://romancc:oTfbJbMyibBtESye@mementomori-ebeiv.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true })

//express use settings



//express calls
app.get("/hello", (req, res) => {
    res.send("Hello world");
  });

app.post("/test", (req, res) =>{
    
    const userData = new mUserModel({
        id: 1,
        birth_date: "sttring",
        years_to_live: 12,
        death_date: "sttring"
    });
    userData.save().then(() => console.log('Saved'));
    res.send("Saved");
    
})


//Express port
app.listen(1234, () => {
  console.log("Server is listening on port: 1234");
});