import React from 'react';
import './styles/App.css';
import Nav from './components/Nav';
import Home from './components/Home';
import About from './components/About';
import Details from './components/Details';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';


export default function App() {

  return (
    <Router>
      <div className="App">
        <Nav />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/about" component={About} />
          <Route path="/details" component={Details} />
        </Switch>
      </div>
    </Router>
  );
}
