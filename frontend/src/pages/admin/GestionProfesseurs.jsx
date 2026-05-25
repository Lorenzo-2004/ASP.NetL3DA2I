import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaUserTie } from 'react-icons/fa';

export default function GestionProfesseurs() {
    const [professeurs, setProfesseurs] = useState([]);
    const [mentions, setMentions] = useState([]);
    const [cours, setCours] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        nom: '',
        prenom: '',
        email: '',
        mentionIds: [],
        coursIds: []
    });

    // Chargement initial des données
    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            const [resP, resM, resC] = await Promise.all([
                axios.get('/api/professeurs', config),
                axios.get('/api/mentions', config),
                axios.get('/api/cours', config)
            ]);
            setProfesseurs(resP.data);
            setMentions(resM.data);
            setCours(resC.data);
        } catch (e) {
            console.error("Erreur chargement", e);
            if (e.response?.status === 401) window.location.href = '/login';
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Gestion de l'ouverture de la modale
    const openModal = (p = null) => {
        if (p) {
            // Pour l'édition, il faudra probablement adapter si votre DTO de retour 
            // ne contient que les noms et non les IDs. 
            // Note: Si le Map du controller ne renvoie que des strings, 
            // l'édition nécessite souvent un appel GetById ou un DTO plus complet.
            setFormData({
                id: p.id,
                nom: p.nom,
                prenom: p.prenom,
                email: p.email,
                mentionIds: [], // À remplir via GetById si nécessaire
                coursIds: []
            });
            setIsEditing(true);
        } else {
            setFormData({ id: '', nom: '', prenom: '', email: '', mentionIds: [], coursIds: [] });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    // Gestion des sélections multiples (Checkboxes)
    const toggleSelection = (id, field) => {
        setFormData(prev => {
            const list = prev[field];
            const newList = list.includes(id) ? list.filter(i => i !== id) : [...list, id];
            return { ...prev, [field]: newList };
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer ce professeur ?")) {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/professeurs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            if (isEditing) {
                await axios.put(`/api/professeurs/${formData.id}`, formData, config);
            } else {
                await axios.post('/api/professeurs', formData, config);
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            alert("Erreur lors de l'enregistrement");
        }
    };

    return (
        <div className="w-full h-full p-4 md:p-8 bg-gray-50">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Gestion des Professeurs</h1>
                    <p className="text-gray-500">Gérez les enseignants et leurs attributions</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl shadow-lg hover:bg-blue-800 transition-all"
                >
                    <FaPlus /> Ajouter un professeur
                </button>
            </div>

            {/* Tableau */}
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Professeur</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Email</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Mentions</th>
                            {/* <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Cours</th> */}
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {professeurs.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-900">
                                            <FaUserTie />
                                        </div>
                                        <span className="font-medium text-gray-900">{p.nom} {p.prenom}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{p.email}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {p.mentions.map((m, i) => (
                                            <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md">{m}</span>
                                        ))}
                                    </div>
                                </td>
                                {/* <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {p.cours.map((c, i) => (
                                            <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">{c}</span>
                                        ))}
                                    </div>
                                </td> */}
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => openModal(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><FaEdit /></button>
                                        <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><FaTrash /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Formulaire */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-800">
                                {isEditing ? "Modifier le Professeur" : "Nouveau Professeur"}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-600">Nom</label>
                                    <input
                                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.nom}
                                        onChange={e => setFormData({ ...formData, nom: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-600">Prénom</label>
                                    <input
                                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.prenom}
                                        onChange={e => setFormData({ ...formData, prenom: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-600">Email Professionnel</label>
                                <input
                                    type="email"
                                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Sélection Mentions */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-600">Mentions rattachées</label>
                                    <div className="h-40 overflow-y-auto border rounded-xl p-3 space-y-2 bg-gray-50">
                                        {mentions.map(m => (
                                            <label key={m.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded text-blue-600"
                                                    checked={formData.mentionIds.includes(m.id)}
                                                    onChange={() => toggleSelection(m.id, 'mentionIds')}
                                                />
                                                <span className="text-sm text-gray-700">{m.nom}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Sélection Cours */}
                                {/* <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-600">Cours enseignés</label>
                                    <div className="h-40 overflow-y-auto border rounded-xl p-3 space-y-2 bg-gray-50">
                                        {cours.map(c => (
                                            <label key={c.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded text-blue-600"
                                                    checked={formData.coursIds.includes(c.id)}
                                                    onChange={() => toggleSelection(c.id, 'coursIds')}
                                                />
                                                <span className="text-sm text-gray-700">{c.intitule}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div> */}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 shadow-lg transition"
                                >
                                    Enregistrer le professeur
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}