import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function GestionEDT() {
    const [edt, setEdt] = useState([]);
    const [niveaux, setNiveaux] = useState([]);
    const [cours, setCours] = useState([]);
    const [profs, setProfs] = useState([]);
    const [salles, setSalles] = useState([]);

    const [formData, setFormData] = useState({
        niveauId: '', coursId: '', professeurId: '', salleId: '',
        jour: '1', heureDebut: '08:00', heureFin: '10:00'
    });

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [resEdt, resNiveaux, resCours, resProfs, resSalles] = await Promise.all([
            axios.get('/api/emploidutemps', config),
            axios.get('/api/niveaux', config),
            axios.get('/api/cours/definitions', config),
            axios.get('/api/professeurs', config),
            axios.get('/api/salles', config)
        ]);

        console.log("Données Cours :", resCours.data); // <--- Affichez cela
        setCours(resCours.data);

        setEdt(resEdt.data);
        setNiveaux(resNiveaux.data);
        setCours(resCours.data);
        setProfs(resProfs.data);
        setSalles(resSalles.data);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/emploidutemps', {
                ...formData,
                jour: parseInt(formData.jour), // Conversion ici
                niveauId: parseInt(formData.niveauId),
                coursId: parseInt(formData.coursId),
                professeurId: parseInt(formData.professeurId),
                salleId: parseInt(formData.salleId)
            }, config);
            fetchData();
            alert("Créneau ajouté avec succès");
        } catch (err) {
            console.error(err);
            alert(err.response?.data || "Erreur lors de l'ajout");
        }
    };

    const [editingId, setEditingId] = useState(null);

    const handleEdit = (e) => {
        setEditingId(e.id);
        setFormData({
            niveauId: e.niveauId,
            coursId: e.coursId,
            professeurId: e.professeurId,
            salleId: e.salleId,
            jour: e.jour === "Monday" ? "1" : e.jour === "Tuesday" ? "2" : "3", // Adaptez selon votre retour API
            heureDebut: e.heureDebut,
            heureFin: e.heureFin
        });
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();

        // Création de l'objet avec conversion explicite en Number
        const payload = {
            niveauId: parseInt(formData.niveauId),
            coursId: parseInt(formData.coursId),
            professeurId: parseInt(formData.professeurId),
            salleId: parseInt(formData.salleId),
            jour: parseInt(formData.jour),
            heureDebut: formData.heureDebut, // Doit être "HH:mm"
            heureFin: formData.heureFin
        };

        // DEBUG : Voir ce qu'on envoie réellement
        console.log("Payload envoyé au backend :", payload);

        try {
            if (editingId) {
                await axios.put(`/api/emploidutemps/${editingId}`, payload, config);
            } else {
                await axios.post('/api/emploidutemps', payload, config);
            }
            // ... succès

            setEditingId(null);
            setFormData({ /* remettez les valeurs vides ici */ });
            await fetchData(); // <--- C'est ici que le tableau se met à jour
            alert("Enregistré avec succès");
        } catch (err) {
            // AFFICHER L'ERREUR DÉTAILLÉE DU BACKEND
            console.error("Détail de l'erreur :", err.response?.data);
            alert("Erreur : " + (err.response?.data || "Vérifiez les champs"));
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Gestion de l'Emploi du Temps</h1>

            {/* Formulaire de création */}
            <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-4 gap-4 bg-white p-6 rounded-lg shadow mb-8">
                <select value={formData.niveauId} onChange={e => setFormData({ ...formData, niveauId: e.target.value })} className="border p-2 rounded">
                    <option value="">Niveau</option>
                    {niveaux.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                </select>
                <select value={formData.coursId} onChange={e => setFormData({ ...formData, coursId: e.target.value })} className="border p-2 rounded">
                    <option value="">Cours</option>
                    {cours.map(c => <option key={c.id} value={c.id}>{c.intitule}</option>)}
                </select>
                <select value={formData.professeurId} onChange={e => setFormData({ ...formData, professeurId: e.target.value })} className="border p-2 rounded">
                    <option value="">Professeur</option>
                    {profs.map(p => <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
                </select>
                <select value={formData.salleId} onChange={e => setFormData({ ...formData, salleId: e.target.value })} className="border p-2 rounded">
                    <option value="">Salle</option>
                    {salles.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
                <select
                    onChange={e => setFormData({ ...formData, jour: e.target.value })}
                    className="border p-2 rounded"
                    value={formData.jour}
                >
                    <option value="1">Lundi</option>
                    <option value="2">Mardi</option>
                    <option value="3">Mercredi</option>
                    <option value="4">Jeudi</option>
                    <option value="5">Vendredi</option>
                </select>
                <input value={formData.heureDebut} type="time" onChange={e => setFormData({ ...formData, heureDebut: e.target.value })} className="border p-2 rounded" />
                <input value={formData.heureFin} type="time" onChange={e => setFormData({ ...formData, heureFin: e.target.value })} className="border p-2 rounded" />
                <button type="submit" className="bg-[#0a192f] text-white p-2 rounded">
                    {editingId ? "Modifier" : "Ajouter"}
                </button>
            </form>

            {/* Tableau de visualisation */}
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="p-4 font-semibold text-gray-700">Cours</th>
                        <th className="p-4 font-semibold text-gray-700">Prof</th>
                        <th className="p-4 font-semibold text-gray-700">Salle</th>
                        <th className="p-4 font-semibold text-gray-700">Jour</th>
                        <th className="p-4 font-semibold text-gray-700">Horaire</th>
                        <th className="p-4 font-semibold text-gray-700 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {edt.map(e => (
                        <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-gray-800">{e.cours}</td>
                            <td className="p-4 text-gray-600">{e.professeur}</td>
                            <td className="p-4 text-gray-600">{e.salle}</td>
                            <td className="p-4 text-gray-600">
                                {['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'][parseInt(e.jour)] || e.jour}
                            </td>
                            <td className="p-4 text-gray-600 font-medium">{e.heureDebut} - {e.heureFin}</td>
                            <td className="p-4 flex justify-center gap-4">
                                <button
                                    onClick={() => handleEdit(e)}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Modifier
                                </button>
                                <button
                                    onClick={() => handleDelete(e.id)}
                                    className="text-red-600 hover:text-red-800 font-medium"
                                >
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}