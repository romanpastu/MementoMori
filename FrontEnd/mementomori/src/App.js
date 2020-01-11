import React from 'react';
import './App.css';
import Prueba from "./components/Prueba"
import Calendario from "./components/Calendario"
import {BrowserRouter, Route, Switch} from 'react-router-dom'
function App() {
  return (
    <div >
      <BrowserRouter>
      <Switch>
        <Route exact path="/" render={(props) => <Calendario />}/>

      </Switch>
    </BrowserRouter>
    </div>
  );
}

export default App;
