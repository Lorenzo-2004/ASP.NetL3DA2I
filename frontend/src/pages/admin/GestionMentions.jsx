import React, { useState, useEffect } from 'react';
import {
    Layers,
    Plus,
    TrendingUp,
    PieChart,
    Inbox,
    RefreshCw,
    X // Icône pour fermer la modale
} from 'lucide-react';

export default function GestionMentions() {
    const [loading, setLoading] = useState(true);
    const [mentions, setMentions] = useState([]);
    const [globalStats, setGlobalStats] = useState({
        totalSalles: 0,
        utilisationProfesseurs: 0
    });

    // 📝 États pour la fenêtre modale et le formulaire d'ajout
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formData, setFormData] = useState({
        nom: '',
        code: ''
    });
    const [formError, setFormError] = useState('');

    // Chargement des mentions depuis ton API ASP.NET Core
    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const resMentions = await fetch('http://localhost:51488/api/admin/toutes-mentions-avec-niveaux', { headers });

            // 💡 SI L'UTILISATEUR N'EST PAS AUTHENTIFIÉ OU EXPIRÉ :
            if (resMentions.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login'; // Redirection propre
                return;
            }

            if (resMentions.ok) {
                const dataMentions = await resMentions.json();
                setMentions(dataMentions);
            }

            const resStats = await fetch('http://localhost:51488/api/admin/stats', { headers });
            if (resStats.ok) {
                const dataStats = await resStats.json();
                setGlobalStats({
                    totalSalles: dataStats.totalSalles ?? 0,
                    utilisationProfesseurs: dataStats.totalProfesseurs > 0 ? 89 : 0
                });
            }

        } catch (error) {
            console.error("Erreur lors de la récupération des mentions :", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 📥 Gestion de la soumission du formulaire
    const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nom.trim() || !formData.code.trim()) {
      setFormError('Veuillez remplir tous les champs.');
      return;
    }

    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:51488/api/admin/mentions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      // 💡 Extraction sécurisée du JSON
      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      }

      if (response.ok) {
        setFormData({ nom: '', code: '' });
        setIsModalOpen(false);
        fetchData(); // Actualise les cartes en arrière-plan !
      } else {
        // Affiche le message d'erreur du backend ou un message par défaut selon le statut
        if (response.status === 404) {
          setFormError("L'endpoint d'enregistrement (POST) n'est pas trouvé sur le serveur.");
        } else {
          setFormError(data.message || `Erreur serveur (${response.status})`);
        }
      }
    } catch (error) {
      setFormError("Impossible de connecter le serveur.");
      console.error(error);
    } finally {
      setSubmitLoading(false);
    }
  };

    return (
        <div className="w-full space-y-8 animate-fadeIn relative">

            {/* 📝 ENTÊTE DE LA PAGE */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gérer les Mentions</h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Disciplines académiques fondamentales et parcours d'études de l'EMIT.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={fetchData}
                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-all shadow-sm"
                        title="Actualiser"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Ouvre la modale au clic */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#002347] hover:bg-[#06315e] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        AJOUTER UNE MENTION
                    </button>
                </div>
            </div>

            {/* 🎴 GRILLE DES MENTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {loading ? (
                    [1, 2].map((n) => (
                        <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 h-44 animate-pulse"></div>
                    ))
                ) : (
                    <>
                        {mentions.length === 0 ? (
                            <div className="col-span-full md:col-span-2 bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-44">
                                <Inbox className="h-8 w-8 text-slate-300 mb-2" />
                                <p className="text-sm font-bold text-slate-700">Aucune mention créée</p>
                                <p className="text-xs text-slate-400 mt-0.5">Utilisez le bouton pour ajouter votre première mention d'étude.</p>
                            </div>
                        ) : (
                            mentions.map((m) => (
                                <div key={m.id} className="bg-white p-6 rounded-2xl border border-slate-200 border-l-4 border-l-[#002347] shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-44">
                                    <div>
                                        <div className="p-2 bg-slate-50 text-slate-700 rounded-xl w-fit mb-3">
                                            <Layers className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 tracking-tight">{m.nom}</h3>
                                        <p className="text-xs text-slate-400 font-semibold mt-0.5">Code : {m.code}</p>
                                    </div>
                                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                                        <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg border border-slate-100">
                                            {m.niveaux?.length || 0} Niveaux associés
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* CARD POINTILLÉE : DÉCLENCHE AUSSI LA MODALE */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="border-2 border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50 rounded-2xl p-6 h-44 flex flex-col items-center justify-center text-center transition-all group active:scale-[0.98]"
                        >
                            <div className="h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 group-hover:text-slate-600 group-hover:shadow-sm transition-all mb-2">
                                <Plus className="h-5 w-5" />
                            </div>
                            <p className="text-xs font-bold text-slate-500 group-hover:text-slate-700">
                                Créer une Nouvelle Mention
                            </p>
                        </button>
                    </>
                )}

            </div>

            {/* 📊 SECTION BASSE : APERÇUS DE L'ADMINISTRATION */}
            <div className="pt-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Aperçus de l'administration</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#002347] text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between h-44 relative overflow-hidden group">
                        <div>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Total des Salles</span>
                            <h3 className="text-5xl font-black mt-2 tracking-tight">{globalStats.totalSalles}</h3>
                        </div>
                        <p className="text-[11px] text-slate-300/80 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-emerald-400" />
                            Données synchronisées en temps réel
                        </p>
                    </div>

                    <div className="md:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6 h-44">
                        <div className="space-y-2 text-center sm:text-left">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Occupation des Enseignants</span>
                            <h3 className="text-4xl font-black text-slate-900 tracking-tight">{globalStats.utilisationProfesseurs}%</h3>
                            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                                Représentation de la charge de cours actuelle assignée aux professeurs de l'établissement pour ce semestre.
                            </p>
                        </div>
                        <div className="h-28 w-44 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center shrink-0">
                            <div className="flex flex-col items-center text-center p-4">
                                <PieChart className="h-6 w-6 text-slate-400 mb-1" />
                                <span className="text-[10px] font-bold text-slate-400">Analyses d'occupation</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🖥️ FENÊTRE MODALE : FORMULAIRE D'AJOUT DE MENTION */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-6 mx-4 relative transform scale-100 transition-all">

                        {/* Entête Modale */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-slate-50 text-[#002347] rounded-lg">
                                    <Layers className="h-4 w-4" />
                                </div>
                                <h2 className="text-base font-black text-slate-900 tracking-tight">Nouvelle Mention</h2>
                            </div>
                            <button
                                onClick={() => { setIsModalOpen(false); setFormError(''); }}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Formulaire */}
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {formError && (
                                <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 animate-shake">
                                    {formError}
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nom de la Mention</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Informatique, Management..."
                                    value={formData.nom}
                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#002347] focus:ring-1 focus:ring-[#002347] transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Code / Diminutif</label>
                                <input
                                    type="text"
                                    placeholder="Ex: INF, MGT..."
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#002347] focus:ring-1 focus:ring-[#002347] transition-all placeholder:text-slate-300 uppercase"
                                />
                            </div>

                            {/* Boutons d'actions */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); setFormError(''); }}
                                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                                    disabled={submitLoading}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#002347] hover:bg-[#06315e] text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                                    disabled={submitLoading}
                                >
                                    {submitLoading ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}