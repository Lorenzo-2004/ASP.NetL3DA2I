import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaDoorOpen } from 'react-icons/fa';

export default function GestionSalles() {
    const [salles, setSalles] = useState([]);
    const [niveaux, setNiveaux] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        nom: '',
        capacite: '',
        niveauId: ''
    });

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const [resS, resN] = await Promise.all([
                axios.get('/api/salles', config),
                axios.get('/api/niveaux', config) // Assurez-vous que cet endpoint existe
            ]);
            setSalles(resS.data);
            setNiveaux(resN.data);
        } catch (e) {
            console.error("Erreur chargement", e);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const openModal = (s = null) => {
        if (s) {
            setFormData({ id: s.id, nom: s.nom, capacite: s.capacite, niveauId: s.niveauId });
            setIsEditing(true);
        } else {
            setFormData({ id: '', nom: '', capacite: '', niveauId: '' });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer cette salle ?")) {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/salles/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            if (isEditing) {
                await axios.put(`/api/salles/${formData.id}`, formData, config);
            } else {
                await axios.post('/api/salles', formData, config);
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data || "Erreur lors de l'enregistrement");
        }
    };

    return (
        <div className="w-full h-full p-8 bg-gray-50">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Gestion des Salles</h1>
                <button onClick={() => openModal()} className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl hover:bg-blue-800">
                    <FaPlus /> Ajouter une salle
                </button>
            </div>

            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Salle</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Capacité</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Niveau associé</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {salles.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{s.nom}</td>
                                <td className="px-6 py-4 text-gray-600">{s.capacite} places</td>
                                <td className="px-6 py-4 text-gray-600">{s.niveauLabel}</td>
                                <td className="px-6 py-4 text-center flex justify-center gap-2">
                                    <button onClick={() => openModal(s)} className="text-blue-600 p-2 hover:bg-blue-50 rounded"><FaEdit /></button>
                                    <button onClick={() => handleDelete(s.id)} className="text-red-600 p-2 hover:bg-red-50 rounded"><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
                        <h2 className="text-xl font-bold mb-4">{isEditing ? "Modifier" : "Nouvelle Salle"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input className="w-full p-3 border rounded-lg" placeholder="Nom de la salle" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} required />
                            <input type="number" className="w-full p-3 border rounded-lg" placeholder="Capacité" value={formData.capacite} onChange={e => setFormData({ ...formData, capacite: e.target.value })} required />
                            <select className="w-full p-3 border rounded-lg" value={formData.niveauId} onChange={e => setFormData({ ...formData, niveauId: e.target.value })} required>
                                <option value="">Sélectionner un niveau</option>
                                {niveaux.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                            </select>
                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg">Annuler</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-900 text-white rounded-lg">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}