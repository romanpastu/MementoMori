import React from 'react';
import './App.css';
import Prueba from "./components/Prueba"
import Calendario from "./components/Calendario"
import LoginPage from "./components/LoginPage"
import {BrowserRouter, Route, Switch, withRouter} from 'react-router-dom'

class App extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      
    }
  }

  render(){
    return(
      <div>
        <Switch>
        <Route exact path="/dashboard" render={(props) => <Calendario />}/>
        <Route exact path="/login" render={(props) => <LoginPage />}/>
        </Switch>
      </div>
    )
  }
}

export default withRouter(App);