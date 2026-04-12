import React, { useEffect } from 'react'
import { useDoctorContext } from '../../context/DoctorContext'

const DoctorDashboard = () => {
  const { dashData, getDashData, completeAppointment, cancelAppointment } = useDoctorContext()

  useEffect(() => { getDashData() }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Doctor Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Your practice overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {[
          { label: 'Total Earnings', value: `₹${dashData?.earnings ?? 0}`, icon: '💰', color: 'bg-emerald-50' },
          { label: 'Appointments', value: dashData?.appointments ?? 0, icon: '📅', color: 'bg-sky-50' },
          { label: 'Patients', value: dashData?.patients ?? 0, icon: '👥', color: 'bg-violet-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center text-2xl`}>{s.icon}</div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Latest Appointments */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h2 className="font-bold text-slate-800">Latest Appointments</h2>
        </div>
        {!dashData?.latestAppointments?.length ? (
          <div className="p-12 text-center text-slate-400">No appointments yet</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {dashData.latestAppointments.map(apt => (
              <div key={apt._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center text-sky-700 font-bold text-sm">
                  {apt.userData?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">{apt.userData?.name}</p>
                  <p className="text-xs text-slate-500">{apt.slotDate?.replace(/_/g, '/')} · {apt.slotTime}</p>
                </div>
                {!apt.cancelled && !apt.isCompleted && (
                  <div className="flex gap-2">
                    <button onClick={() => completeAppointment(apt._id)}
                      className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors">
                      ✓ Done
                    </button>
                    <button onClick={() => cancelAppointment(apt._id)}
                      className="text-xs font-bold px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
                {apt.isCompleted && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full">Completed</span>}
                {apt.cancelled && <span className="px-2 py-0.5 bg-red-100 text-red-500 text-xs font-bold rounded-full">Cancelled</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorDashboard
