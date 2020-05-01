import { Route } from 'react-router-dom';
import React from 'react';
import { Redirect } from 'react-router';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';
export default ({ component: Component, render: renderFn, authed, name, ...rest }) => {

   var decoded = [];
   decoded.permited = [];
   var accesstoken = Cookies.get('accesstoken');

  
   if((accesstoken)){
    var decoded  = jwtDecode(accesstoken)
   }
   console.log("------")
   console.log(decoded.permited)
console.log(decoded.permited.includes("life_expectancy"))
console.log("------")
    return ( //Second case is for iframe based renders
      <Route {...rest} render={props => ( ( decoded.permited.includes(name) === true)) ? renderFn(props) : <Redirect to={{ pathname: '/dashboard', state: { from: props.location } }} />} />
    );
  
}