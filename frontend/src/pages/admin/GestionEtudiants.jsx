import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTimes, FaEdit, FaTrash, FaCamera } from 'react-icons/fa';

export default function GestionEtudiants() {
    const [etudiants, setEtudiants] = useState([]);
    const [niveaux, setNiveaux] = useState([]);
    const [mentions, setMentions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [preview, setPreview] = useState(null);
    const [formData, setFormData] = useState({
        id: '', nom: '', prenom: '', matricule: '', email: '', mentionId: '', niveauId: '', photo: null
    });

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return; // Empêche l'erreur 401 si pas de token

        const authHeader = { headers: { Authorization: `Bearer ${token}` } };

        try {
            const [resEtudiants, resNiveaux, resMentions] = await Promise.all([
                axios.get('/api/etudiants', authHeader),
                axios.get('/api/niveaux', authHeader),
                axios.get('/api/mentions', authHeader)
            ]);
            setEtudiants(resEtudiants.data);
            setNiveaux(resNiveaux.data);
            setMentions(resMentions.data);
        } catch (e) {
            console.error("Erreur chargement", e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openModal = (e = null) => {
        setPreview(null);
        if (e) {
            setFormData({ id: e.id, nom: e.nom, prenom: e.prenom, matricule: e.numeroEtudiant, email: e.email, mentionId: e.mentionId || '', niveauId: e.niveauId || '', photo: null });
            setIsEditing(true);
        } else {
            setFormData({ id: '', nom: '', prenom: '', matricule: '', email: '', mentionId: '', niveauId: '', photo: null });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        if (window.confirm("Supprimer cet étudiant ?")) {
            await axios.delete(`/api/etudiants/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, photo: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const data = new FormData();
        data.append('Nom', formData.nom);
        data.append('Prenom', formData.prenom);
        data.append('NumeroEtudiant', formData.matricule);
        data.append('Email', formData.email);
        data.append('NiveauId', formData.niveauId);
        data.append('MentionId', formData.mentionId);
        if (formData.photo) data.append('Photo', formData.photo);

        try {
            const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
            if (isEditing) await axios.put(`/api/etudiants/${formData.id}`, data, config);
            else await axios.post('/api/etudiants', data, config);
            setShowModal(false);
            fetchData();
        } catch (err) { alert("Erreur lors de l'enregistrement"); }
    };

    const niveauxFiltres = formData.mentionId ? niveaux.filter(n => n.mentionId == formData.mentionId) : [];

    return (
        <div className="flex-1 p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Gestion des Étudiants</h1>
                <button onClick={() => openModal()} className="px-6 py-2.5 bg-blue-900 text-white rounded-lg shadow-md hover:bg-blue-800 transition">
                    + Ajouter un étudiant
                </button>
            </div>

            <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full border-collapse table-auto text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Étudiant</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Matricule</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Niveau</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Mention</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Email</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {etudiants.map(e => (
                            <tr key={e.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{e.nom} {e.prenom}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{e.numeroEtudiant}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{e.niveauLabel}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{e.mentionNom}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{e.email}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-3">
                                        <button onClick={() => openModal(e)} className="text-blue-600 hover:text-blue-900"><FaEdit size={18} /></button>
                                        <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:text-red-900"><FaTrash size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{isEditing ? "Modifier" : "Ajouter"}</h2>
                            <button onClick={() => setShowModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex justify-center">
                                <label className="cursor-pointer">
                                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed overflow-hidden">
                                        {preview ? <img src={preview} className="w-full h-full object-cover" /> : <FaCamera className="text-gray-400" />}
                                    </div>
                                    <input type="file" className="hidden" onChange={handlePhotoChange} />
                                </label>
                            </div>
                            <input className="w-full p-2.5 border rounded-lg" placeholder="Nom" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} required />
                            <input className="w-full p-2.5 border rounded-lg" placeholder="Prénom" value={formData.prenom} onChange={e => setFormData({ ...formData, prenom: e.target.value })} required />
                            <input className="w-full p-2.5 border rounded-lg" placeholder="Matricule" value={formData.matricule} onChange={e => setFormData({ ...formData, matricule: e.target.value })} required />
                            <input className="w-full p-2.5 border rounded-lg" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                            <div className="grid grid-cols-2 gap-4">
                                <select className="p-2.5 border rounded-lg" value={formData.mentionId} onChange={e => setFormData({ ...formData, mentionId: e.target.value })}>
                                    <option value="">Mention</option>
                                    {mentions.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                                </select>
                                <select className="p-2.5 border rounded-lg" value={formData.niveauId} onChange={e => setFormData({ ...formData, niveauId: e.target.value })}>
                                    <option value="">Niveau</option>
                                    {niveauxFiltres.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                                </select>
                            </div>
                            <button className="w-full py-3 bg-blue-900 text-white rounded-lg font-bold">Enregistrer</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}