import React, { useState, useEffect } from 'react';
import {
    Layers,
    BarChart3,
    Home,
    Users,
    UserCheck,
    BookOpen,
    Calendar,
    AlertTriangle,
    Clock,
    PlusCircle,
    Eye,
    Edit3,
    RefreshCw,
    Inbox
} from 'lucide-react';

export default function Dashboard() {
    // 💡 Initialisation stricte à 0 et tableau vide au démarrage
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalProfessors: 0,
        activeClasses: 0,
        pendingCancellations: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fonction dynamique pour aller chercher les vrais chiffres en base de données
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:51488/api/admin/dashboard-stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                // 💡 On mappe les clés c# (PascalCase) vers les états de ton UI
                setStats({
                    totalStudents: data.totalEtudiants ?? 0,
                    totalProfessors: data.totalProfessors ?? 0,
                    activeClasses: data.totalCours ?? 0,
                    pendingCancellations: data.annulationsEnAttente ?? 0
                });
                setRecentActivity(data.recentActivity || []); // Sera vide au début comme souhaité
            }
        } catch (err) {
            console.error("Maintien des valeurs à 0 :", err);
            setStats({ totalStudents: 0, totalProfessors: 0, activeClasses: 0, pendingCancellations: 0 });
            setRecentActivity([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <div className="p-6 bg-slate-50 min-h-screen font-sans antialiased text-slate-800">

            {/* ENTÊTE DU TABLEAU DE BORD */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Tableau de bord</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Espace d'administration de l'EMIT. Vue d'ensemble en temps réel de l'établissement.
                    </p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all shadow-sm disabled:opacity-50"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Actualiser
                </button>
            </div>

            {/* 📊 BLOC COMPTEURS NUMÉRIQUES REÉLS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

                {/* Total Étudiants */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[130px]">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Étudiants</span>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Actifs</span>
                    </div>
                    <div className="mt-4">
                        {loading ? (
                            <div className="h-9 w-16 bg-slate-200 animate-pulse rounded"></div>
                        ) : (
                            <span className="text-3xl font-extrabold text-slate-900">{stats.totalStudents}</span>
                        )}
                    </div>
                    <div className="mt-2 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#002347]" style={{ width: `${Math.min(stats.totalStudents, 100)}%` }}></div>
                    </div>
                </div>

                {/* Total Professeurs */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[130px]">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Professeurs</span>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Enseignants</span>
                    </div>
                    <div className="mt-4">
                        {loading ? (
                            <div className="h-9 w-16 bg-slate-200 animate-pulse rounded"></div>
                        ) : (
                            <span className="text-3xl font-extrabold text-slate-900">{stats.totalProfessors}</span>
                        )}
                    </div>
                    <div className="mt-2 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#002347]" style={{ width: `${Math.min(stats.totalProfessors, 100)}%` }}></div>
                    </div>
                </div>

                {/* Cours Planifiés */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[130px]">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cours Planifiés</span>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Semestre 1</span>
                    </div>
                    <div className="mt-4">
                        {loading ? (
                            <div className="h-9 w-16 bg-slate-200 animate-pulse rounded"></div>
                        ) : (
                            <span className="text-3xl font-extrabold text-slate-900">{stats.activeClasses}</span>
                        )}
                    </div>
                    <div className="mt-2 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${Math.min(stats.activeClasses, 100)}%` }}></div>
                    </div>
                </div>

                {/* Annulations en Attente */}
                <div className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between min-h-[130px] transition-colors ${stats.pendingCancellations > 0 ? 'border-red-200 bg-red-50/10' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-start">
                        <span className={`text-xs font-bold uppercase tracking-wider ${stats.pendingCancellations > 0 ? 'text-red-500' : 'text-slate-400'}`}>Annulations</span>
                        {stats.pendingCancellations > 0 && (
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full animate-bounce">Urgent</span>
                        )}
                    </div>
                    <div className="mt-4">
                        {loading ? (
                            <div className="h-9 w-16 bg-slate-200 animate-pulse rounded"></div>
                        ) : (
                            <span className={`text-3xl font-extrabold ${stats.pendingCancellations > 0 ? 'text-red-600' : 'text-slate-900'}`}>{stats.pendingCancellations}</span>
                        )}
                    </div>
                    <div className="mt-2 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${stats.pendingCancellations > 0 ? 'bg-red-500' : 'bg-slate-400'}`} style={{ width: `${Math.min(stats.pendingCancellations * 10, 100)}%` }}></div>
                    </div>
                </div>

            </div>

            {/* SECTION DES GRILLES DE GESTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* MODULES DE CRÉATION ET PLANIFICATION */}
                <div className="lg:col-span-2 space-y-6">

                    {/* ACTIONS RAPIDES DE CONFIGURATION */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <PlusCircle className="h-4 w-4 text-emerald-600" />
                            Espace Création & Insertion
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-all group">
                                <div className="flex items-center gap-3">
                                    <Layers className="h-5 w-5 text-indigo-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Ajouter une Mention</p>
                                        <p className="text-xs text-slate-500">Configuration des mentions d'études</p>
                                    </div>
                                </div>
                                <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
                            </button>

                            <button className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-all group">
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="h-5 w-5 text-sky-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Créer un Niveau</p>
                                        <p className="text-xs text-slate-500">Configuration L1, L2, L3, M1, M2</p>
                                    </div>
                                </div>
                                <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
                            </button>

                            <button className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-all group">
                                <div className="flex items-center gap-3">
                                    <Home className="h-5 w-5 text-amber-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Enregistrer une Salle</p>
                                        <p className="text-xs text-slate-500">Capacités et localisations des amphis</p>
                                    </div>
                                </div>
                                <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
                            </button>

                            <button className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-all group">
                                <div className="flex items-center gap-3">
                                    <UserCheck className="h-5 w-5 text-teal-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Inscrire un Professeur</p>
                                        <p className="text-xs text-slate-500">Fiche enseignant et coordonnées</p>
                                    </div>
                                </div>
                                <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
                            </button>

                            <button className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-all group">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Ajouter un Étudiant</p>
                                        <p className="text-xs text-slate-500">Numéro matricule et parcours</p>
                                    </div>
                                </div>
                                <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
                            </button>

                            <button className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-all group">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-5 w-5 text-orange-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Créer un nouveau Cours</p>
                                        <p className="text-xs text-slate-500">Matières et volumes horaires</p>
                                    </div>
                                </div>
                                <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </div>

                    {/* GENERATEUR D'EMPLOI DU TEMPS */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            Planification automatique
                        </h2>
                        <div className="space-y-3">
                            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div>
                                    <h3 className="text-sm font-bold text-blue-950">Générer les emplois du temps</h3>
                                    <p className="text-xs text-blue-800/80 mt-0.5">Calculer et équilibrer les grilles de cours par parcours.</p>
                                </div>
                                <button className="px-4 py-2 bg-[#002347] hover:bg-[#003466] text-white text-xs font-bold rounded-lg transition-all shadow-sm shrink-0">
                                    Calculer l'emploi du temps
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                <button className="flex items-center gap-2 justify-center p-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-all">
                                    <Edit3 className="h-3.5 w-3.5 text-amber-500" />
                                    Ajuster les Salles
                                </button>
                                <button className="flex items-center gap-2 justify-center p-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-all">
                                    <Clock className="h-3.5 w-3.5 text-blue-500" />
                                    Modifier Horaires
                                </button>
                                <button className="flex items-center gap-2 justify-center p-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-all">
                                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                    Cours annulés
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* FLUX D'ACTIVITÉ EN DIRECT & INCIDENTS */}
                <div className="space-y-6">

                    {/* ACCÈS AUX ANNULATIONS */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                    Signalements d'incidents
                                </h2>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">
                                Consultez et validez l'ensemble des cours annulés ou reportés par les enseignants.
                            </p>
                        </div>
                        <button className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2">
                            <Eye className="h-3.5 w-3.5" />
                            Voir toutes les annulations
                        </button>
                    </div>

                    {/* HISTORIQUE ET FLUX D'ACTIVITÉ : S'AFFICHE SI DES ACTIONS EXISTENT */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
                            Modifications récentes
                        </h2>
                        <div className="flow-root">
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2].map((n) => (
                                        <div key={n} className="flex gap-3 animate-pulse">
                                            <div className="h-8 w-8 rounded-full bg-slate-200 shrink-0"></div>
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                                                <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : recentActivity.length === 0 ? (
                                // 💡 Affichage propre et vide tant que l'admin n'a fait aucune manipulation
                                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                                    <Inbox className="h-8 w-8 text-slate-300 mb-2" />
                                    <p className="text-xs font-medium text-slate-400">Aucune action enregistrée</p>
                                    <p className="text-[11px] text-slate-400/70 mt-0.5">Les actions s'afficheront au fur et à mesure de vos ajouts.</p>
                                </div>
                            ) : (
                                <ul className="-mb-8">
                                    {recentActivity.map((item, idx) => (
                                        <li key={item.id}>
                                            <div className="relative pb-6">
                                                {idx !== recentActivity.length - 1 && (
                                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                                                )}
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${item.type === 'create' ? 'bg-emerald-50 text-emerald-600' :
                                                                item.type === 'generate' ? 'bg-blue-50 text-blue-600' :
                                                                    item.type === 'edit' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                                            }`}>
                                                            {item.type === 'create' && <PlusCircle className="h-4 w-4" />}
                                                            {item.type === 'generate' && <Calendar className="h-4 w-4" />}
                                                            {item.type === 'edit' && <Edit3 className="h-4 w-4" />}
                                                            {item.type === 'cancel' && <AlertTriangle className="h-4 w-4" />}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800">{item.action}</p>
                                                            <p className="text-[11px] text-slate-500 mt-0.5">{item.target}</p>
                                                        </div>
                                                        <div className="text-right text-[10px] whitespace-nowrap text-slate-400 font-medium">
                                                            {item.time}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}