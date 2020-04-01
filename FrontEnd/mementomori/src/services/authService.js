
import axios from 'axios'
import Cookies from 'js-cookie';
import qs from 'qs'
import constants from '../constants.js';

export default function isAuthenticated() {

    var accesstoken = Cookies.get('accesstoken');

    return axios({ method: 'post', url: constants.urlBackend+"/verify", headers: { Authorization: `Bearer ${accesstoken}` } })
        .then(function (response) {
            //console.log(JSON.stringify(response))
            if (response.data.status === "valid") {
                //case 1 : token valid, no need to refresh
                //console.log("valid no need to refresh")
                return true;
            } else if (response.data.error === "jwt expired") {
                //console.log("expired needs refreshing")
                //case 2 : token expired  , a refresh attempt is done
                //the access token is sent to the refresh server and returns true or false based on refreshing process
                //We also send the userId back to the server in order to identify the refreshtoken that belongs to the user
                var uid = Cookies.get('user')

                return axios({ method: 'post', url: constants.urlBackend+"/refresh_token", data: qs.stringify({ uid }), headers: { Authorization: `Bearer ${accesstoken}` } })
                    .then(function (response) {
                        accesstoken = response.data.accesstoken;
                        Cookies.set('accesstoken', response.data.accesstoken)
                        //Once ive got the new accesstoken, I do the verification of the token and return true or false based on the verification result.
                        if (accesstoken != "") {
                            //the refreshing process was correct, we attempt the verification of the freshly  obtained access token
                            return axios({ method: 'post', url: constants.urlBackend+"/verify", headers: { Authorization: `Bearer ${accesstoken}` } })
                                .then(function (response) {
                                    if (response.data.status === "valid") {
                                        //the new accesstoken is valid, returns true
                                        return true;
                                    } else {
                                        //the refresh process started, but the new token failed to pass the verification
                                        return false;
                                    }
                                })
                        } else {
                            //the accesstoken was empty / malformed / failed to return there was a problem in the refreshing process
                            return false;
                        }
                    })
            } else {
                //case 3 : other cases, token invalid / malformed...  
                //console.log("token invalid")
                return false;
            }
        }).catch((error) => {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
            console.log(error.config);
        });
}
