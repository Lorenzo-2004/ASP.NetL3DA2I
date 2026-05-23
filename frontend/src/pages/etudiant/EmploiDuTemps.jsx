export default function EmploiDuTemps() {
    const cours = [
        {
            matiere: 'React',
            salle: 'B12',
            heure: '08:00 - 10:00',
            prof: 'Rakoto',
        },
    ]

    return (
        <div>
            <h1 className='text-3xl font-bold mb-8 text-indigo-900'>
                Mon emploi du temps
            </h1>

            <div className='grid gap-5'>
                {cours.map((c, index) => (
                    <div
                        key={index}
                        className='bg-white rounded-3xl shadow-lg p-6 border-l-8 border-indigo-700'
                    >
                        <h2 className='text-2xl font-bold text-indigo-800'>
                            {c.matiere}
                        </h2>

                        <div className='mt-4 space-y-2 text-gray-600'>
                            <p>Salle: {c.salle}</p>
                            <p>Horaire: {c.heure}</p>
                            <p>Professeur: {c.prof}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}