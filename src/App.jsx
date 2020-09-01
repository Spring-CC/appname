import React from 'react';
import './styles/App.css';
import Nav from './components/Nav';
import Home from './components/Home';
import axios from 'axios'
async function getdata () {
  const data = await axios.get('https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=5d3350892d24701b473ca9748ac04669&pref=PREF13&hit_per_page=20&offset_page=1')
  console.log(data)
}

getdata()

export default function App() {

  return (
    <div className="App">
      <Nav />
      <Home />
    </div>
  );
}
