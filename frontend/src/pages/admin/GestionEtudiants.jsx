import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function GestionEtudiants() {
    const [etudiants, setEtudiants] = useState([])

    useEffect(() => {
        fetchEtudiants()
    }, [])

    const fetchEtudiants = async () => {
        try {
            const res = await api.get('/Etudiants')
            setEtudiants(res.data)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className='bg-white p-6 rounded-3xl shadow-lg'>
            <h1 className='text-2xl font-bold mb-6'>Gestion Étudiants</h1>

            <table className='w-full'>
                <thead>
                    <tr className='border-b'>
                        <th className='py-3 text-left'>Nom</th>
                        <th>Email</th>
                        <th>Niveau</th>
                    </tr>
                </thead>

                <tbody>
                    {etudiants.map((e) => (
                        <tr key={e.id} className='border-b'>
                            <td className='py-3'>{e.nom}</td>
                            <td>{e.email}</td>
                            <td>{e.niveau}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}