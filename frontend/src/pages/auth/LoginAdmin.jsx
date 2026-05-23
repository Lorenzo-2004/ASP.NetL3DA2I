import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert, Mail, Lock, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';

export default function LoginAdmin() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:51488/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const responseText = await response.text();
            const data = responseText ? JSON.parse(responseText) : {};

            if (!response.ok) {
                throw new Error(data.message || 'Identifiants administratifs erronés.');
            }

            // Sécurité : On s'assure que l'utilisateur qui se connecte possède bien les droits d'accès
            if (data.role !== 'Admin' && data.role !== 'Administration') {
                throw new Error("Accès refusé. Cette interface est réservée à la direction.");
            }

            login(data);
            navigate('/admin/dashboard'); // Redirection directe vers ton tableau de bord

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row font-sans antialiased bg-slate-900">

            {/* BANNER GAUCHE DU PANNEAU DE CONTRÔLE */}
            <div className="w-full md:w-1/2 bg-[#001731] text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden border-r border-slate-800">
                <div>
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Retour au portail public
                    </button>

                    <div className="mt-24 max-w-md">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-semibold mb-4">
                            <ShieldAlert className="h-3.5 w-3.5" /> Zone Sécurisée Admin
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
                            Terminal de Gestion EMIT.
                        </h1>
                        <p className="mt-6 text-slate-400 text-sm leading-relaxed">
                            Console d'administration globale. Modifiez la planification, gérez les mentions, affectez les enseignants et validez les annulations de cours.
                        </p>
                    </div>
                </div>
            </div>

            {/* FORMULAIRE DROITE DE L'ADMIN */}
            <div className="w-full md:w-1/2 bg-slate-950 p-8 md:p-16 flex flex-col justify-center items-center">
                <div className="w-full max-w-md">
                    <h2 className="text-2xl font-bold text-white">Connexion Administration</h2>
                    <p className="text-xs text-slate-500 mt-1 mb-6">
                        Renseignez votre clé de connexion et votre mot de passe pour ouvrir la session.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-950/40 text-red-400 text-xs rounded-lg border border-red-900/50 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Identifiant Admin</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="admin@emit-university.fr"
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white placeholder-slate-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white placeholder-slate-600"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/10"
                        >
                            {loading ? 'Vérification...' : 'Ouvrir la console'}
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}