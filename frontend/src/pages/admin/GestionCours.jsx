import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

export default function GestionCours() {
    const [cours, setCours] = useState([]);
    const [profs, setProfs] = useState([]);
    const [niveaux, setNiveaux] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        intitule: '',
        description: '',
        niveauId: '',
        professeurIds: []
    });

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resCours, resProfs, resNiveaux] = await Promise.all([
                axios.get('/api/cours/definitions', config),
                axios.get('/api/professeurs', config),
                axios.get('/api/niveaux', config)
            ]);
            setCours(resCours.data);
            setProfs(resProfs.data);
            setNiveaux(resNiveaux.data);
        } catch (e) { console.error("Erreur chargement:", e); }
    };

    const toggleProf = (id) => {
        setFormData(prev => ({
            ...prev,
            professeurIds: prev.professeurIds.includes(id)
                ? prev.professeurIds.filter(pid => pid !== id)
                : [...prev.professeurIds, id]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/api/cours/${editingId}`, formData, config);
            } else {
                await axios.post('/api/cours', formData, config);
            }
            setShowModal(false);
            setEditingId(null);
            setFormData({ intitule: '', description: '', niveauId: '', professeurIds: [] });
            fetchData();
        } catch (e) { alert("Erreur lors de l'enregistrement"); }
    };

    const handleEdit = (c) => {
        setEditingId(c.id);
        setFormData({
            intitule: c.intitule,
            description: c.description,
            niveauId: c.niveauId,
            professeurIds: c.professeurIds || []
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer ce cours ?")) return;
        try {
            await axios.delete(`/api/cours/${id}`, config);
            fetchData();
        } catch (e) { alert("Erreur de suppression"); }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Cours</h1>
                <button onClick={() => { setEditingId(null); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2 bg-[#0a192f] text-white rounded-lg hover:bg-blue-950">
                    <FaPlus /> Ajouter un cours
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Intitulé</th>
                            <th className="p-4 font-semibold text-gray-600">Niveau</th>
                            <th className="p-4 font-semibold text-gray-600">Professeurs</th>
                            <th className="p-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {cours.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-800">{c.intitule}</td>
                                <td className="p-4 text-gray-600 font-medium">{c.niveauLabel || "Non défini"}</td>
                                <td className="p-4 text-gray-600 italic">{c.professeursNoms?.join(', ') || "Aucun prof"}</td>
                                <td className="p-4 flex gap-3 text-gray-400">
                                    <button onClick={() => handleEdit(c)} className="hover:text-blue-600"><FaEdit /></button>
                                    <button onClick={() => handleDelete(c.id)} className="hover:text-red-600"><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{editingId ? "Modifier le cours" : "Nouveau Cours"}</h2>
                            <button onClick={() => setShowModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input className="w-full p-3 border rounded-lg" placeholder="Nom du cours" value={formData.intitule} onChange={e => setFormData({ ...formData, intitule: e.target.value })} />
                            <textarea className="w-full p-3 border rounded-lg" placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            <select className="w-full p-3 border rounded-lg" value={formData.niveauId} onChange={e => setFormData({ ...formData, niveauId: e.target.value })}>
                                <option value="">Choisir un niveau</option>
                                {niveaux.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                            </select>
                            <div className="border rounded-lg p-3 h-32 overflow-y-auto">
                                <label className="text-sm font-semibold mb-2 block">Professeurs :</label>
                                {profs.map(p => (
                                    <label key={p.id} className="flex items-center gap-2 py-1">
                                        <input type="checkbox" checked={formData.professeurIds.includes(p.id)} onChange={() => toggleProf(p.id)} />
                                        {p.nom} {p.prenom}
                                    </label>
                                ))}
                            </div>
                            <button type="submit" className="w-full py-3 bg-[#0a192f] text-white rounded-lg font-bold">Enregistrer</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}