import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { GraduationCap, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const responseText = await response.text();
            const data = responseText ? JSON.parse(responseText) : {};

            if (!response.ok) {
                throw new Error(data.message || 'Email ou mot de passe incorrect.');
            }

            // Sauvegarde du token et de l'utilisateur dans le AuthContext
            login(data);

            // 💡 LOGIQUE DE REDIRECTION STRICTE ET DYNAMIQUE PAR RÔLE
            if (data.role === 'Admin' || data.role === 'Administration') {
                navigate('/admin/dashboard'); // Espace unique Admin
            } else if (data.role === 'Enseignant') {
                navigate('/professeur/emploi'); // Espace unique Enseignant
            } else if (data.role === 'Etudiant') {
                navigate('/etudiant/emploi'); // Espace unique Étudiant
            } else {
                setError("Rôle utilisateur inconnu.");
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row font-sans antialiased bg-gray-50">

            <div className="w-full md:w-1/2 bg-[#002347] text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden">
                <div>
                    <div className="flex items-center gap-2 text-xl font-bold tracking-wide">
                        <GraduationCap className="h-7 w-7 text-white" />
                        <span>EMIT Portal</span>
                    </div>
                    <div className="mt-24 max-w-md">
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                            L'excellence académique à portée de main.
                        </h1>
                        <p className="mt-6 text-gray-300 text-base md:text-lg leading-relaxed">
                            Connectez-vous pour gérer vos cours, consulter votre emploi du temps et accéder à vos ressources.
                        </p>
                    </div>
                </div>
                <div>
                    <p className="text-xs md:text-sm text-gray-400">
                        Portail officiel de l'école <span className="text-white font-semibold">EMIT</span>.
                    </p>
                </div>
            </div>

            {/* FORMULAIRE DROITE */}
            <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col justify-center items-center">
                <div className="w-full max-w-md">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Se connecter</h2>
                    <p className="text-sm text-gray-500 mt-1 mb-6">
                        Renseignez vos identifiants pour accéder à votre espace personnalisé.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Email institutionnel</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="nom@emit-university.fr"
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002347] text-slate-800"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-semibold text-slate-700">Mot de passe</label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002347] text-slate-800"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-[#002347] hover:bg-[#003466] text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>

                    <div className="mt-6 flex flex-col gap-3">
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink mx-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Ou restreint</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/login-admin')}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                        >
                            🛡️ Connexion en tant qu'administrateur
                        </button>
                    </div>

                    <div className="text-center mt-8 text-sm text-slate-600">
                        Vous n'avez pas encore de compte ?{' '}
                        <span onClick={() => navigate('/register')} className="font-bold text-slate-900 hover:underline cursor-pointer">
                            Créer un compte
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}