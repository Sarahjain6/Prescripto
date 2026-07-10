import React from 'react'
import { useNavigate } from 'react-router-dom'

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => { navigate(`/appointment/${doctor._id}`); scrollTo(0, 0) }}
      className="card-hover bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer shadow-sm"
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-50 to-cyan-50 h-52 flex items-center justify-center">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="h-48 w-full object-cover object-top"
          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${doctor.name}&background=0ea5e9&color=fff&size=200` }}
        />
        {doctor.available && (
          <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> Available
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold text-sky-600 uppercase tracking-wide mb-1">{doctor.speciality}</p>
        <h3 className="font-bold text-slate-800 text-base">{doctor.name}</h3>
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm text-slate-500">{doctor.experience}</span>
          <span className="text-sm font-bold text-slate-800">₹{doctor.fees}</span>
        </div>
        <button className="mt-3 w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-sm font-semibold py-2 rounded-xl hover:shadow-lg hover:shadow-sky-200 transition-all duration-300">
          Book Appointment
        </button>
      </div>
    </div>
  )
}

export default DoctorCard
