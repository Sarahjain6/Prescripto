import React, { useEffect } from 'react'
import { useAdminContext } from '../../context/AdminContext'

const AllAppointments = () => {
  const { appointments, getAllAppointments, cancelAppointment } = useAdminContext()

  useEffect(() => { getAllAppointments() }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">All Appointments</h1>
        <p className="text-slate-500 text-sm mt-1">{appointments.length} total appointments</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['#', 'Patient', 'Doctor', 'Speciality', 'Date & Time', 'Fees', 'Status', 'Action'].map(h => (
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
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {apt.userData?.name?.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-800">{apt.userData?.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <img src={apt.docData?.image} alt="" className="w-8 h-8 rounded-full object-cover"
                        onError={e => e.target.src = `https://ui-avatars.com/api/?name=${apt.docData?.name}&background=0ea5e9&color=fff&size=32`} />
                      <span className="font-medium text-slate-800">{apt.docData?.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{apt.docData?.speciality}</td>
                  <td className="px-5 py-4 text-slate-600">
                    <div>{apt.slotDate?.replace(/_/g, '/')}</div>
                    <div className="text-xs text-slate-400">{apt.slotTime}</div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800">₹{apt.amount}</td>
                  <td className="px-5 py-4">
                    {apt.cancelled
                      ? <span className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">Cancelled</span>
                      : apt.isCompleted
                        ? <span className="px-2.5 py-1 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full">Completed</span>
                        : apt.payment
                          ? <span className="px-2.5 py-1 bg-sky-100 text-sky-600 text-xs font-bold rounded-full">Paid</span>
                          : <span className="px-2.5 py-1 bg-amber-100 text-amber-600 text-xs font-bold rounded-full">Pending</span>
                    }
                  </td>
                  <td className="px-5 py-4">
                    {!apt.cancelled && !apt.isCompleted && (
                      <button
                        onClick={() => cancelAppointment(apt._id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
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

export default AllAppointments
