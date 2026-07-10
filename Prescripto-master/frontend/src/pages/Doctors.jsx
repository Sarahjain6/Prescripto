import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import DoctorCard from '../components/DoctorCard'

const specialities = ['General physician', 'Gynecologist', 'Dermatologist', 'Pediatricians', 'Neurologist', 'Gastroenterologist']

const Doctors = () => {
  const { speciality } = useParams()
  const navigate = useNavigate()
  const { doctors } = useAppContext()
  const [filterDoc, setFilterDoc] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    let filtered = doctors
    if (speciality) filtered = filtered.filter(d => d.speciality === speciality)
    if (search) filtered = filtered.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.speciality.toLowerCase().includes(search.toLowerCase()))
    setFilterDoc(filtered)
  }, [doctors, speciality, search])

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Find a Doctor</h1>
        <p className="text-slate-500">Browse our network of verified healthcare professionals</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-8">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name or speciality..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-sky-400 transition-colors bg-white"
        />
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <div className="hidden md:block w-56 shrink-0">
          <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Speciality</h3>
          <div className="space-y-1">
            <button
              onClick={() => navigate('/doctors')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${!speciality ? 'bg-sky-50 text-sky-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              All Doctors
            </button>
            {specialities.map(s => (
              <button
                key={s}
                onClick={() => navigate(speciality === s ? '/doctors' : `/doctors/${s}`)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${speciality === s ? 'bg-sky-50 text-sky-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors grid */}
        <div className="flex-1">
          {speciality && (
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-sm font-semibold">{speciality}</span>
              <button onClick={() => navigate('/doctors')} className="text-slate-400 hover:text-red-500 transition-colors">✕</button>
            </div>
          )}
          {filterDoc.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No doctors found</h3>
              <p className="text-slate-500">Try changing your search or filter</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-4">{filterDoc.length} doctor{filterDoc.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-auto gap-6">
                {filterDoc.map(doc => <DoctorCard key={doc._id} doctor={doc} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Doctors
