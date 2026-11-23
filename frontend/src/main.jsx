import React from 'react'; import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext'; import { Navbar, Protected } from './components';
import { Home, Login, Register, HotelPage, Bookings, Manager } from './pages';
import { Tours, TourBookings } from './TourPages';
import { AdminDashboard } from './AdminDashboard';
import { ProviderTours } from './ProviderTours';
import './style.css';
function App(){return <AuthProvider><BrowserRouter><Navbar/><Routes>
<Route path="/" element={<Home/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/hotels/:id" element={<HotelPage/>}/>
<Route path="/tours" element={<Tours/>}/>
<Route path="/bookings" element={<Protected roles={['customer']}><Bookings/></Protected>}/>
<Route path="/tour-bookings" element={<Protected roles={['customer']}><TourBookings/></Protected>}/>
<Route path="/manager" element={<Protected roles={['provider','admin']}><Manager/></Protected>}/>
<Route path="/provider/tours" element={<Protected roles={['provider']}><ProviderTours/></Protected>}/>
<Route path="/admin" element={<Protected roles={['admin']}><AdminDashboard/></Protected>}/>
<Route path="*" element={<main className="container"><h2>Page not found</h2></main>}/>
</Routes><footer>© 2026 StayEasy · Find a stay that feels right.</footer></BrowserRouter></AuthProvider>}
createRoot(document.getElementById('root')).render(<App/>);
