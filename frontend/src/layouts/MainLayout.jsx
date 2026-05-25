import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <Navbar />

            <div className="flex">
                {/* La Sidebar doit avoir une largeur fixe (w-64) */}
                <Sidebar />

                {/* --- MODIFICATION ICI --- */}
                {/* On enlève 'pl-64'. 'flex-1' dit au main de prendre tout l'espace restant */}
                <main className="flex-1 min-h-screen w-full overflow-hidden pl-32 pr-0">
                    <div className="w-full p-6 md:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}