import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash } from 'react-icons/fa';

export default function GestionNiveaux() {
    const [niveaux, setNiveaux] = useState([]);
    const [mentions, setMentions] = useState([]);
    const [formData, setFormData] = useState({ code: '', groupe: '', mentionId: '' });
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchNiveaux();
        fetchMentions();
    }, []);

    const fetchNiveaux = async () => {
        try {
            const res = await axios.get('/api/niveaux', config);
            setNiveaux(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error("Erreur chargement niveaux", e); }
    };

    const fetchMentions = async () => {
        try {
            const res = await axios.get('/api/mentions', config);
            setMentions(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error("Erreur chargement mentions", e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Envoi des données (le Backend se charge de la validation métier)
            await axios.post('/api/niveaux', formData, config);

            // Réinitialisation et rafraîchissement
            setFormData({ code: '', groupe: '', mentionId: '' });
            fetchNiveaux();
        } catch (e) {
            const errorMsg = e.response?.data || "Erreur lors de l'enregistrement";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce niveau ?")) {
            try {
                await axios.delete(`/api/niveaux/${id}`, config);
                fetchNiveaux();
            } catch (e) {
                alert("Erreur lors de la suppression");
            }
        }
    };

    return (
        <div className="p-8 bg-gray-50/50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Niveaux</h1>
                    <p className="text-gray-500">Définissez la structure académique de l'établissement.</p>
                </div>

                {/* Formulaire d'ajout */}
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Code</label>
                        <input required className="w-full p-2 border border-gray-200 rounded-lg" placeholder="ex: L1" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Groupe</label>
                        <input className="w-full p-2 border border-gray-200 rounded-lg" placeholder="A ou B (optionnel)" value={formData.groupe} onChange={e => setFormData({ ...formData, groupe: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Mention</label>
                        <select required className="w-full p-2 border border-gray-200 rounded-lg" value={formData.mentionId} onChange={e => setFormData({ ...formData, mentionId: e.target.value })}>
                            <option value="">Choisir...</option>
                            {mentions.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                        </select>
                    </div>
                    <button disabled={loading} className="bg-[#0a192f] text-white py-2 rounded-lg font-bold hover:bg-blue-950 transition flex justify-center items-center gap-2">
                        {loading ? "Chargement..." : <><FaPlus /> Ajouter</>}
                    </button>
                </form>

                {/* Tableau des niveaux */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-500">Niveau (Label)</th>
                                <th className="p-4 font-semibold text-gray-500">Mention</th>
                                <th className="p-4 font-semibold text-gray-500 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {niveaux.map(n => (
                                <tr key={n.id} className="hover:bg-gray-50/50">
                                    <td className="p-4 font-bold text-gray-800">{n.label}</td>
                                    <td className="p-4 text-gray-600">{n.mentionCode}</td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => handleDelete(n.id)} className="text-red-500 hover:text-red-700 p-2">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}