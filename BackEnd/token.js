const {sign} = require("jsonwebtoken")

const createAccessToken = (userId,permited) =>{
    return sign({userId, permited}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1m'
    })
}

const createRefreshToken = (userId,userRole) =>{
    return sign({userId,userRole}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d'
    })
}
//it also sends the userId (encrypted) in order to have a value to identify the refresh tokens when asking to refresh a token
const sendAccessToken = (res , req, accesstoken) => {
    res.send({
        accesstoken
    })
}

const sendRefreshToken = (res, refreshtoken) => {
      res.cookie("refreshtoken", refreshtoken, {
         httpOnly: true,
          path: '/refresh_token'
      }) 

      
    
}



module.exports = {
    createAccessToken , createRefreshToken, sendAccessToken, sendRefreshToken
}