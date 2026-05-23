import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, IdCard, BookOpen, ArrowRight, AlertCircle, GraduationCap } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: '', // 'Etudiant' ou 'Enseignant'
        password: '',
        confirmPassword: '',
        numeroEtudiant: '',
        specialite: '',
        acceptTerms: false
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Les mots de passe ne correspondent pas.');
        }

        if (!formData.acceptTerms) {
            return setError("Vous devez accepter les conditions d'utilisation.");
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:51488/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    role: formData.role,
                    numeroEtudiant: formData.role === 'Etudiant' ? formData.numeroEtudiant : null,
                    specialite: formData.role === 'Etudiant' ? formData.specialite : null
                })
            });

            const responseText = await response.text();
            const data = responseText ? JSON.parse(responseText) : {};

            if (!response.ok) {
                throw new Error(data.message || "Une erreur est survenue lors de l'inscription.");
            }

            // 💡 REDIRECTION SYSTÉMATIQUE VERS LE LOGIN APRÈS INSCRIPTION
            navigate('/login');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row font-sans antialiased bg-gray-50">

            {/* BANNER GAUCHE */}
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
                            Gerez vos cours, consultez votre emploi du temps et accédez à vos ressources pédagogiques en un clic.
                        </p>
                    </div>
                </div>
                <div className="mt-12 md:mt-0">
                    <p className="text-xs md:text-sm text-gray-400">
                        Rejoignez plus de <span className="text-white font-semibold">2,000 utilisateurs</span>.
                    </p>
                </div>
            </div>

            {/* FORMULAIRE DROITE */}
            <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col justify-center items-center">
                <div className="w-full max-w-lg">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Créer un compte</h2>
                    <p className="text-sm text-gray-500 mt-1 mb-6">
                        Veuillez remplir les informations ci-dessous pour vous inscrire.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* NOM & PRÉNOM */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ex: Dupont"
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002347] focus:bg-white text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ex: Jean"
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002347] focus:bg-white text-slate-800"
                                />
                            </div>
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email institutionnel</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="nom@emit-university.fr"
                                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002347] text-slate-800"
                                />
                            </div>
                        </div>

                        {/* RÔLE (ADMIN ENLEVÉ) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#002347] text-slate-800 cursor-pointer"
                                >
                                    <option value="">Choisir un rôle</option>
                                    <option value="Etudiant">Étudiant</option>
                                    <option value="Enseignant">Enseignant</option>
                                </select>
                                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▼</div>
                            </div>
                        </div>

                        {/* CHAMPS CONDITIONNELS ÉTUDIANT */}
                        {formData.role === 'Etudiant' && (
                            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-blue-900 mb-1">Numéro Étudiant</label>
                                        <div className="relative">
                                            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                                            <input
                                                type="text"
                                                name="numeroEtudiant"
                                                value={formData.numeroEtudiant}
                                                onChange={handleChange}
                                                required={formData.role === 'Etudiant'}
                                                placeholder="Ex: 24-EMIT-012"
                                                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002347] text-slate-800"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-blue-900 mb-1">Spécialité / Mention</label>
                                        <div className="relative">
                                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                                            <input
                                                type="text"
                                                name="specialite"
                                                value={formData.specialite}
                                                onChange={handleChange}
                                                required={formData.role === 'Etudiant'}
                                                placeholder="Ex: Informatique (MIT)"
                                                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002347] text-slate-800"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MOT DE PASSE */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002347] text-slate-800"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmation</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002347] text-slate-800"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CONDITIONS */}
                        <div className="flex items-start gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="acceptTerms"
                                name="acceptTerms"
                                checked={formData.acceptTerms}
                                onChange={handleChange}
                                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#002347] focus:ring-[#002347]"
                            />
                            <label htmlFor="acceptTerms" className="text-xs text-slate-600 leading-normal">
                                J'accepte les conditions d'utilisation et la politique de confidentialité d'EMIT.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 bg-[#002347] hover:bg-[#003466] text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Création en cours...' : 'Créer un compte'}
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>

                    <div className="text-center mt-8 text-sm text-slate-600">
                        Vous avez déjà un compte ?{' '}
                        <span onClick={() => navigate('/login')} className="font-bold text-slate-900 hover:underline cursor-pointer">
                            Se connecter
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}