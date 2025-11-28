import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './ui/Header';
import Footer from './ui/Footer';

function LandingLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />
            <main className="flex-1 w-full">
                {children || <Outlet />}
            </main>
            <Footer />
        </div>
    );
}

export default LandingLayout;
