import React from 'react';
import './App.css';
import Calendario from "./components/Calendario"
import LoginPage from "./components/LoginPage"
import { Route, Switch, withRouter } from 'react-router-dom'
import qs from 'qs'
import axios from 'axios'
import Cookies from 'js-cookie';
import constants from './constants.js'
import isAuthenticated from './services/authService';
import PrivateRoute from './components/PrivateRoute'
import LifeExpectancyRoute from './components/LifeExpectancyRoute' 
import LifeExpectancy from './components/LifeExpectancy'
class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      authenticationChecked: false,
      isAuthenticated: false
    }
  }

  componentDidMount() {
    //calls the auth service to decide the auth state value
    isAuthenticated().then((result) => {
      if (result === true) {
        this.setState({ isAuthenticated: true, authenticationChecked: true })
      } else {
        this.setState({ isAuthenticated: false, authenticationChecked: true })
      }
    });
  }

  login = (email, password, direction) => {
    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        url: constants.urlBackend + "/login",
        data: qs.stringify({ email, password }),
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
      }).then((res) => {
        console.log(res.data.accesstoken)
        if (res.data.accesstoken != undefined) {
          Cookies.set('accesstoken', res.data.accesstoken)
        }
        console.log(direction)
        if (direction == "login") {
          console.log("this is pushing to login")
          isAuthenticated().then((result) => {

            if (result === true) {
              this.setState({ isAuthenticated: true, authenticationChecked: true }, () => {
                this.props.history.push('/dashboard');
              })
              resolve(true);
            } else {
              this.setState({ isAuthenticated: false, authenticationChecked: true })
              if (res.data == "error") {
                reject("error");
              } else if (res.data.code == "ETIMEDOUT") {
                reject("Network error");
              }
            }
          });
        } else if (direction == "register") {
          console.log("this is pushing to register")
          this.props.history.push("/lifeExpectancy")
        }

      }).catch(err => {

        if (err == "Error: Network Error") {
          reject("Network error");
        }
      })

    })

  }

  setYearsRedirect = () => {
    isAuthenticated().then((result) => {

      if (result === true) {
        this.setState({ isAuthenticated: true, authenticationChecked: true }, () => {
          this.props.history.push('/dashboard');
        })
        
      } else {
        this.setState({ isAuthenticated: false, authenticationChecked: true })
        
      }
    })
  }

  render() {
    //isAuthticated() is async, so we block the rendering until we have the result.
    if (!this.state.authenticationChecked) return null;
    return (
      <div>
        <Switch>
          <PrivateRoute name={"dashboard"} authed={this.state.isAuthenticated} path="/dashboard" render={(props) => <Calendario {...props} />} />
          <LifeExpectancyRoute name={"life_expectancy"} path="/lifeExpectancy" render={(props) => <LifeExpectancy {...props} setYearsRedirect={this.setYearsRedirect} />} />
          <Route exact path="/login" render={(props) => <LoginPage login={this.login} authed={this.state.isAuthenticated} {...props} />} />
        </Switch>
      </div>
    )
  }
}

export default withRouter(App);