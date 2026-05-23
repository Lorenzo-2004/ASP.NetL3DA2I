export default function GestionAnnulations() {
    const annulations = [
        {
            cours: 'React',
            professeur: 'Rakoto',
            date: '2025-08-20',
        },
    ]

    return (
        <div className='bg-white p-6 rounded-3xl shadow-lg'>
            <h1 className='text-3xl font-bold mb-6'>Annulations</h1>

            {annulations.map((a, index) => (
                <div
                    key={index}
                    className='border rounded-2xl p-5 mb-4 flex justify-between'
                >
                    <div>
                        <h2 className='font-bold'>{a.cours}</h2>
                        <p>{a.professeur}</p>
                    </div>

                    <p>{a.date}</p>
                </div>
            ))}
        </div>
    )
}