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

    return ( //Second case is for iframe based renders
      <Route {...rest} render={props => ((authed === true) && ( decoded.permited.includes(name) === true)) ? renderFn(props) : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />} />
    );
  
}