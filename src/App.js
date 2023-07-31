import React from 'react';
import Navbar from './Component/Navbar';
import Registration from './Component/Registration';
import Login from './Component/Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes> 
          <Route path="/" element={<Navbar />} /> 
        <Route path="/Registration" element={<Registration />}/> 
        <Route path="/Login" element={<Login/>}/> 
      </Routes>
    </Router>
  );
}

export default App;
