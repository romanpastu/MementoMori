import axios from 'axios'
import Cookies from 'js-cookie';
import qs from 'qs'
import constants from '../constants.js';


export default function refreshTheToken() {

    var accesstoken = Cookies.get('accesstoken');
    var uid = Cookies.get('user')

    return axios({ method: 'post', url: constants.urlBackend + "/auth/refresh_token", data: qs.stringify({ uid }), headers: { Authorization: `Bearer ${accesstoken}` } })
        .then(function (response) {
            accesstoken = response.data.accesstoken;
            Cookies.set('accesstoken', response.data.accesstoken)
            //Once ive got the new accesstoken, I do the verification of the token and return true or false based on the verification result.
            if (accesstoken != "") {
                //the refreshing process was correct, we attempt the verification of the freshly  obtained access token
                return axios({ method: 'post', url: constants.urlBackend + "/auth/verify", headers: { Authorization: `Bearer ${accesstoken}` } })
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
}

