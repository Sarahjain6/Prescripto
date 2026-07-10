import React, { useEffect } from 'react'
import { useDoctorContext } from '../../context/DoctorContext'

const DoctorAppointments = () => {
  const { appointments, getAppointments, completeAppointment, cancelAppointment } = useDoctorContext()

  useEffect(() => { getAppointments() }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">My Appointments</h1>
        <p className="text-slate-500 text-sm mt-1">{appointments.length} total appointments</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['#', 'Patient', 'Age / DOB', 'Date & Time', 'Fees', 'Payment', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {appointments.map((apt, i) => (
                <tr key={apt._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-slate-400 text-xs">{i + 1}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center text-sky-700 font-bold text-xs">
                        {apt.userData?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{apt.userData?.name}</p>
                        <p className="text-xs text-slate-400">{apt.userData?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600 text-xs">
                    {apt.userData?.dob !== 'Not Selected' ? apt.userData?.dob : '—'}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <div className="font-medium">{apt.slotDate?.replace(/_/g, '/')}</div>
                    <div className="text-xs text-slate-400">{apt.slotTime}</div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800">₹{apt.amount}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${apt.payment ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'}`}>
                      {apt.payment ? 'Online' : 'Cash'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {apt.cancelled
                      ? <span className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">Cancelled</span>
                      : apt.isCompleted
                        ? <span className="px-2.5 py-1 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full">Completed</span>
                        : <span className="px-2.5 py-1 bg-amber-100 text-amber-600 text-xs font-bold rounded-full">Pending</span>
                    }
                  </td>
                  <td className="px-5 py-4">
                    {!apt.cancelled && !apt.isCompleted && (
                      <div className="flex gap-1.5">
                        <button onClick={() => completeAppointment(apt._id)}
                          className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors">
                          ✓
                        </button>
                        <button onClick={() => cancelAppointment(apt._id)}
                          className="text-xs font-bold px-2.5 py-1 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                          ✕
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {appointments.length === 0 && (
            <div className="text-center py-16 text-slate-400">No appointments found</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorAppointments
