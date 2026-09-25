import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-vh-100 d-flex flex-column bg-body-tertiary">
      {/* Top Horizontal Navigation Menu */}
      <Navbar />

      {/* Main Full-Width Content Container */}
      <main className="flex-grow-1 py-4">
        <div className="container-fluid px-3 px-md-4 px-xl-5">
          <Outlet />
        </div>
      </main>

      {/* Modern Gym Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
