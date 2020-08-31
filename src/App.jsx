import React from 'react';
import './styles/App.css';
import Nav from './components/Nav';
import Home from './components/Home';

export default function App() {
  return (
    <div className="App">
      <Nav />
      <Home />
    </div>
  );
}
