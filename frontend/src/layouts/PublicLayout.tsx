import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PublicLayout: React.FC = () => (
  <>
    <Navbar />
    <main className="min-h-screen overflow-x-hidden">
      <Outlet />
    </main>
    <Footer />
  </>
);

export default PublicLayout;
