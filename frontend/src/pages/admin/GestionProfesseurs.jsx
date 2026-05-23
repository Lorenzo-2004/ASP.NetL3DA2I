import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function GestionProfesseurs() {
    const [professeurs, setProfesseurs] = useState([])

    useEffect(() => {
        fetchProfesseurs()
    }, [])

    const fetchProfesseurs = async () => {
        const res = await api.get('/Professeurs')
        setProfesseurs(res.data)
    }

    return (
        <div className='bg-white p-6 rounded-3xl shadow-lg'>
            <h1 className='text-2xl font-bold mb-6'>Gestion Professeurs</h1>

            <table className='w-full'>
                <thead>
                    <tr className='border-b'>
                        <th className='py-3 text-left'>Nom</th>
                        <th>Email</th>
                        <th>Matière</th>
                    </tr>
                </thead>

                <tbody>
                    {professeurs.map((p) => (
                        <tr key={p.id} className='border-b'>
                            <td className='py-3'>{p.nom}</td>
                            <td>{p.email}</td>
                            <td>{p.matiere}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}