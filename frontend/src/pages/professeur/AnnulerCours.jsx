export default function AnnulerCours() {
    return (
        <div className='bg-white rounded-3xl shadow-lg p-6'>
            <h1 className='text-3xl font-bold mb-6'>Annuler un cours</h1>

            <form className='space-y-5 max-w-lg'>
                <input
                    type='text'
                    placeholder='Nom du cours'
                    className='w-full border p-3 rounded-xl'
                />

                <textarea
                    placeholder='Raison de l’annulation'
                    className='w-full border p-3 rounded-xl h-32'
                />

                <button className='bg-red-500 text-white px-6 py-3 rounded-xl'>
                    Annuler le cours
                </button>
            </form>
        </div>
    )
}