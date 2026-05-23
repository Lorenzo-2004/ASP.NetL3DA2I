import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Bell, User, LogOut } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-0 z-30 flex items-center justify-between px-6 shadow-sm">
            {/* LOGO & TITRE GAUCHE */}
            <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-800 tracking-tight">EMIT Management</span>
            </div>

            {/* OPTIONS BARRE SUPÉRIEURE DROITE */}
            <div className="flex items-center gap-4">
                {/* Liens de Navigation rapides (comme sur la maquette) */}
                <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-500 mr-4">
                    <span className="text-blue-600 border-b-2 border-blue-600 pb-5 pt-5 cursor-pointer">Dashboard</span>
                    <span className="hover:text-slate-800 cursor-pointer transition-colors">Analytics</span>
                    <span className="hover:text-slate-800 cursor-pointer transition-colors">Reports</span>
                </nav>

                {/* Bouton Cloche Notifications */}
                <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-all relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-blue-500 rounded-full ring-2 ring-white"></span>
                </button>

                <div className="h-8 w-px bg-slate-200"></div>

                {/* Profil & Déconnexion */}
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-slate-100 rounded-full text-slate-600">
                        <User className="h-4 w-4" />
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-full transition-all"
                        title="Se déconnecter"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}