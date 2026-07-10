import React, { useEffect } from 'react'
import { useAdminContext } from '../../context/AdminContext'

const DoctorsList = () => {
  const { doctors, getAllDoctors, changeAvailability } = useAdminContext()

  useEffect(() => { getAllDoctors() }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">All Doctors</h1>
        <p className="text-slate-500 text-sm mt-1">{doctors.length} registered doctors</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {doctors.map(doc => (
          <div key={doc._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-br from-sky-50 to-cyan-50 h-44 flex items-end justify-center">
              <img
                src={doc.image} alt={doc.name}
                className="h-40 w-full object-cover object-top"
                onError={e => e.target.src = `https://ui-avatars.com/api/?name=${doc.name}&background=0ea5e9&color=fff&size=160`}
              />
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold text-sky-600 uppercase tracking-wide mb-1">{doc.speciality}</p>
              <h3 className="font-bold text-slate-800 mb-1">{doc.name}</h3>
              <p className="text-xs text-slate-500 mb-3">{doc.degree} · {doc.experience}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">₹{doc.fees}</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-medium text-slate-500">{doc.available ? 'Available' : 'Unavailable'}</span>
                  <div
                    onClick={() => changeAvailability(doc._id)}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${doc.available ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${doc.available ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </label>
              </div>
            </div>
          </div>
        ))}
        {doctors.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">
            <div className="text-5xl mb-3">👨‍⚕️</div>
            <p className="font-semibold">No doctors yet. Add one!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorsList
