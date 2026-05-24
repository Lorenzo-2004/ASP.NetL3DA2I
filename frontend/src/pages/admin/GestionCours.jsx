import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPlus, FaFilter, FaFileExport, FaTimes } from 'react-icons/fa';

export default function GestionCours() {
    const [cours, setCours] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [data, setData] = useState({ profs: [], mentions: [], salles: [] });
    const [formData, setFormData] = useState({
        intitule: '', code: '', professeurId: '', mentionId: '', niveauId: 2, salleId: '', jour: 1, heureDebut: '08:00', heureFin: '10:00'
    });

    // Configuration des headers avec le token
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchCours();
        fetchFormOptions();
    }, []);

    const fetchCours = async () => {
        try {
            const res = await axios.get('/api/cours/dashboard', config);
            setCours(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error("Erreur cours:", e); }
    };

    const fetchFormOptions = async () => {
        try {
            const [profs, mentions, salles] = await Promise.all([
                axios.get('/api/professeurs', config),
                axios.get('/api/mentions', config),
                axios.get('/api/salles', config)
            ]);

            setData({
                profs: Array.isArray(profs.data) ? profs.data : [],
                mentions: Array.isArray(mentions.data) ? mentions.data : [],
                salles: Array.isArray(salles.data) ? salles.data : []
            });
        } catch (e) { console.error("Erreur chargement options", e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/cours/complet', formData, config);
            setShowModal(false);
            fetchCours();
        } catch (e) { alert("Erreur lors de l'enregistrement"); }
    };

    return (
        <div className="p-8 bg-gray-50/50 min-h-screen">
            {/* En-tête */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Cours</h1>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2 bg-[#0a192f] text-white rounded-lg hover:bg-blue-950">
                    <FaPlus /> Ajouter un cours
                </button>
            </div>

            {/* Tableau avec bordures douces */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-500">Nom du cours</th>
                            <th className="p-4 font-semibold text-gray-500">Code</th>
                            <th className="p-4 font-semibold text-gray-500">Professeur</th>
                            <th className="p-4 font-semibold text-gray-500">Salle</th>
                            <th className="p-4 font-semibold text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {cours.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50/50">
                                <td className="p-4 text-gray-700">{c.intitule}</td>
                                <td className="p-4 text-gray-700">{c.code}</td>
                                <td className="p-4 text-gray-700">{c.professeur?.nom}</td>
                                <td className="p-4 text-gray-700">{c.salle?.nom}</td>
                                <td className="p-4 flex gap-3 text-gray-400">
                                    <button className="hover:text-blue-600"><FaEdit /></button>
                                    <button className="hover:text-red-600"><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Ajouter un nouveau cours</h2>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black"><FaTimes size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
    {/* Ligne 1 : Nom et Code */}
    <div className="grid grid-cols-2 gap-6">
        <div>
            <label className="block text-sm font-semibold mb-2">Nom du cours</label>
            <input className="w-full p-3 border border-gray-200 rounded-lg" placeholder="ex: Algorithmique" onChange={(e) => setFormData({ ...formData, intitule: e.target.value })} />
        </div>
        <div>
            <label className="block text-sm font-semibold mb-2">Code</label>
            <input className="w-full p-3 border border-gray-200 rounded-lg" placeholder="ex: INF402" onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
        </div>
    </div>

    {/* Ligne 2 : Professeur et Mention */}
    <div className="grid grid-cols-2 gap-6">
        <div>
            <label className="block text-sm font-semibold mb-2">Professeur</label>
            <select className="w-full p-3 border border-gray-200 rounded-lg" onChange={(e) => setFormData({ ...formData, professeurId: e.target.value })}>
                <option>Sélectionner un professeur</option>
                {data.profs.map(p => <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
            </select>
        </div>
        <div>
            <label className="block text-sm font-semibold mb-2">Mention</label>
            <select className="w-full p-3 border border-gray-200 rounded-lg" onChange={(e) => setFormData({ ...formData, mentionId: e.target.value })}>
                <option>Choisir une mention</option>
                {data.mentions.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
        </div>
    </div>

    {/* Ligne 3 : Niveau */}
    <div>
        <label className="block text-sm font-semibold mb-2">Niveau</label>
        <div className="flex gap-3">
            {['L1', 'L2', 'L3', 'M1'].map((niv, i) => (
                <button key={niv} type="button" onClick={() => setFormData({ ...formData, niveauId: i + 1 })}
                    className={`px-6 py-2 border rounded-lg ${formData.niveauId === i + 1 ? 'bg-[#0a192f] text-white' : 'hover:bg-gray-50'}`}>
                    {niv}
                </button>
            ))}
        </div>
    </div>

    {/* Ligne 4 : Salle */}
    <div>
        <label className="block text-sm font-semibold mb-2">Salle</label>
        <select className="w-full p-3 border border-gray-200 rounded-lg" onChange={(e) => setFormData({ ...formData, salleId: e.target.value })}>
            <option>Affecter une salle</option>
            {data.salles.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
        </select>
    </div>

    {/* Ligne 5 : Jour et Heures */}
    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl">
        <select className="p-3 border rounded-lg" onChange={(e) => setFormData({ ...formData, jour: e.target.value })}>
            {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map((j, i) => <option key={j} value={i + 1}>{j}</option>)}
        </select>
        <input type="time" className="p-3 border rounded-lg" value={formData.heureDebut} onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })} />
        <input type="time" className="p-3 border rounded-lg" value={formData.heureFin} onChange={(e) => setFormData({ ...formData, heureFin: e.target.value })} />
    </div>

    <button type="submit" className="w-full py-4 bg-[#0a192f] text-white rounded-xl font-bold hover:bg-blue-950">
        Enregistrer le cours
    </button>
</form>
                    </div>
                </div>
            )}
        </div>
    );
}