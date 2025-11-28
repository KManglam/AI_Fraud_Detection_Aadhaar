import React from 'react';
import Header from './ui/Header';
import Footer from './ui/Footer';

function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-secondary-50">
            <Header />
            <main className="flex-1 w-full">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default Layout;
