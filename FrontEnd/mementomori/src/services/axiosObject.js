import axios from 'axios';
import constants from '../constants.js';
import Cookies from 'js-cookie';

const API = axios.create({
  baseURL: `${constants.urlBackend}`,
  timeout: 10000,
  // headers: {
  //   'Content-Type': 'application/json'
  // },
});

API.interceptors.request.use(
  config => {
    var accesstoken = Cookies.get('accesstoken');

    if (accesstoken) {
      config.headers.Authorization = `Bearer ${accesstoken}`;
    } else {
      delete API.defaults.headers.common.Authorization;
    }
    return config;
  },

  error => Promise.reject(error)
);

export default API;