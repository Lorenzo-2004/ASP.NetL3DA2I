export default function GestionNiveaux() {
    return (
        <div className='bg-white rounded-3xl shadow-lg p-6'>
            <h1 className='text-3xl font-bold mb-6'>Gestion Niveaux</h1>

            <div className='grid md:grid-cols-4 gap-5'>
                <div className='p-5 bg-blue-100 rounded-2xl'>L1</div>
                <div className='p-5 bg-blue-100 rounded-2xl'>L2</div>
                <div className='p-5 bg-blue-100 rounded-2xl'>L3</div>
                <div className='p-5 bg-blue-100 rounded-2xl'>M1</div>
            </div>
        </div>
    )
}