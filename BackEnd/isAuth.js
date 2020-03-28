const {verify} = require('jsonwebtoken');
//Service to verify if the received auth token is valid
const isAuth = req => {
     const authorization = req.headers['authorization'];
     if(!authorization) throw new Error("You need to login");

     const token = authorization.split(' ')[1]; 
     const {userId} = verify(token, process.env.ACCESS_TOKEN_SECRET);
     return userId;
    
}

module.exports =  {
    isAuth
}