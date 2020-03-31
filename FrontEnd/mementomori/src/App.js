import React from 'react';
import './App.css';
import Calendario from "./components/Calendario"
import LoginPage from "./components/LoginPage"
import { Route, Switch, withRouter } from 'react-router-dom'
import qs from 'qs'
import axios from 'axios'
import Cookies from 'js-cookie';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    }
  }

  login = (email, password) => {
    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        url: "http://localhost:1234/login",
        data: qs.stringify({ email, password }),
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
      }).then((res) => {
        console.log(res.data.accesstoken)
        if(res.data.accesstoken != undefined){
          Cookies.set('accesstoken',res.data.accesstoken)
        }
      })
    })
  }

  render() {
    return (
      <div>
        <Switch>
          <Route exact path="/dashboard" render={(props) => <Calendario />} />
          <Route exact path="/login" render={(props) => <LoginPage login={this.login}/>} />
        </Switch>
      </div>
    )
  }
}

export default withRouter(App);