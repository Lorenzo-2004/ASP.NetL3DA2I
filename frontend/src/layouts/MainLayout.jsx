import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Barre de navigation supérieure */}
            <Navbar />

            <div className="flex">
                {/* Barre latérale fixe gauche */}
                <Sidebar />

                {/*ZONE DE CONTENU DYNAMIQUE : Étendue à 100% de la largeur restante */}
                <main className="flex-1 pt-16 pl-64 min-h-screen w-full overflow-x-hidden">
                    <div className="w-full p-6 md:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}