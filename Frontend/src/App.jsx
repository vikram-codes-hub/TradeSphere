import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Authpage from './Pages/Authpage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/:type" element={<Authpage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;