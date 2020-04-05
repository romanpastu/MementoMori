const Cookies = require('js-cookie');
const jwtDecode = require('jwt-decode');

// const isAdmin = () =>{

//     var decoded = [];
//     decoded.permited = [];
//     var accesstoken = Cookies.get('accesstoken');
//     if(accesstoken){
//      var decoded  = jwtDecode(accesstoken)
//     }

//     if(decoded.permited.includes("admin")){
//         return true;
//     }else{
//         return false;
//     }
// }

const getUserId = () =>{
    
    var decoded = [];
    decoded.userId = [];
    var accesstoken = Cookies.get('accesstoken');
    if(accesstoken){
     var decoded  = jwtDecode(accesstoken)
    }
    return decoded.userId;
    
}

module.exports = {
     getUserId
}