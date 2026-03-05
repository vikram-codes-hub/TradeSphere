import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Authpage from './Pages/Authpage';
import Home from './Pages/Home';
import Navbar from './Components/Utils/Navbar';
import Aboutus from './Pages/Aboutus';
import Contactus from './Pages/Contactus';
import HowItWorks from './Pages/Howitworks';
import AboutUs from './Pages/Aboutus';
import ContactUs from './Pages/Contactus';
import UpgradePage from './Pages/Upgrade';
import ProfilePage from './Pages/Profile';
import Dashboard from './Pages/DashboardPage';
import MarketsPage from './Pages/MarketPage';

const App = () => {
  return (
    <BrowserRouter>
    <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/auth/:type" element={<Authpage />} />
      <Route path="/how-it-works"  element={<HowItWorks />}  />
      <Route path="/my-profile"  element={<ProfilePage/>}  />
<Route path="/about"         element={<AboutUs />}     />
<Route path="/contact"       element={<ContactUs />}   />
<Route path="/upgrade"       element={<UpgradePage />} />
<Route path="/Dashboard"       element={<Dashboard/>} />
<Route path="/market" element={<MarketsPage/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;