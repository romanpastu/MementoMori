import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

export default function checkLifeExpectancySet(){
    var decoded = [];
    decoded.permited = [];
    var accesstoken = Cookies.get('accesstoken');
 
   
    if((accesstoken)){
     var decoded  = jwtDecode(accesstoken)
    }
    //if it includes the life_expectancy it means it hasnt been set
    if(decoded.permited.includes("life_expectancy")){
        return false;
    }
}