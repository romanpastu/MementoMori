import React from 'react';
import './App.css';
import Prueba from "./components/Prueba"
import Calendario from "./components/Calendario"
import LoginPage from "./components/LoginPage"
import {BrowserRouter, Route, Switch} from 'react-router-dom'
function App() {
  return (
    <div >
      <BrowserRouter>
      <Switch>
        <Route exact path="/dashboard" render={(props) => <Calendario />}/>
        <Route exact path="/login" render={(props) => <LoginPage />}/>
      </Switch>
    </BrowserRouter>
    </div>
  );
}

export default App;
