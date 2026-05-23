import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    BookOpen,
    Users,
    UserCheck,
    Home,
    Layers,
    LogOut
} from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();

    // Liste des liens de navigation principale de la Sidebar
    const menuItems = [
        {
            path: '/admin/dashboard',
            label: 'Tableau de bord',
            icon: LayoutDashboard
        },
        {
            path: '/admin/emplois-du-temps',
            label: 'Emploi du temps',
            icon: Calendar
        },
        {
            path: '/admin/cours',
            label: 'Cours',
            icon: BookOpen
        },
        {
            path: '/admin/mentions', // 🚀 Ta nouvelle page GestionMentions est connectée ici
            label: 'Mentions',
            icon: Layers
        },
        {
            path: '/admin/etudiants',
            label: 'Étudiants',
            icon: Users
        },
        {
            path: '/admin/professeurs',
            label: 'Professeurs',
            icon: UserCheck
        },
        {
            path: '/admin/salles',
            label: 'Salles',
            icon: Home
        }
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200 pt-20 flex flex-col justify-between z-40">

            {/* 📋 SECTION MENUS ET REPERTOIRES */}
            <div className="px-4 space-y-1.5">

                {/* Encadré d'identité administrative */}
                <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                    <div className="h-9 w-9 bg-[#002347] rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        EA
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-slate-800 leading-none">Admin EMIT</h4>
                        <span className="text-[10px] font-bold text-blue-600/80 tracking-wider uppercase mt-1 block">
                            Gestion Académique
                        </span>
                    </div>
                </div>

                {/* Génération dynamique des boutons avec gestion de l'état actif */}
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        // Vérifie si le chemin actuel correspond au bouton pour appliquer le style bleu EMIT
                        const isActive = location.pathname === item.path;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all ${isActive
                                        ? 'bg-[#002347] text-white shadow-sm shadow-blue-900/10'
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                    }`}
                            >
                                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* 🚪 SECTION DECONNEXION PIED DE PAGE */}
            <div className="p-4 border-t border-slate-100 space-y-3">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50/60 rounded-xl transition-all"
                >
                    <LogOut className="h-4 w-4 text-red-500 shrink-0" />
                    Déconnexion
                </button>

                <div className="text-center">
                    <span className="text-[9px] font-medium text-slate-400 tracking-wider">
                        Portail EMIT v1.0
                    </span>
                </div>
            </div>

        </aside>
    );
}