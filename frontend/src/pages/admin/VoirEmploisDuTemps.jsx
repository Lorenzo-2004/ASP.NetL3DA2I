export default function VoirEmploisDuTemps() {
    return (
        <div className='bg-white p-6 rounded-3xl shadow-lg'>
            <h1 className='text-3xl font-bold mb-6'>Tous les emplois du temps</h1>

            <div className='grid gap-5'>
                <div className='p-5 bg-indigo-100 rounded-2xl'>
                    L3 — Programmation Web — Salle B12 — 08:00
                </div>

                <div className='p-5 bg-indigo-100 rounded-2xl'>
                    M1 — IA — Salle A15 — 10:00
                </div>
            </div>
        </div>
    )
}