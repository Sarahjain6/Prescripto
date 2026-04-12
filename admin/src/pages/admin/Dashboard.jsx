import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminContext } from '../../context/AdminContext'

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4`}>
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-2xl shrink-0`}>{icon}</div>
    <div>
      <p className="text-3xl font-extrabold text-slate-900">{value ?? '—'}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  </div>
)

const Dashboard = () => {
  const navigate = useNavigate()
  const { dashData, getDashData, cancelAppointment } = useAdminContext()

  useEffect(() => { getDashData() }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, Admin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <StatCard label="Total Doctors" value={dashData?.doctors} icon="👨‍⚕️" color="bg-sky-50" />
        <StatCard label="Total Patients" value={dashData?.patients} icon="👥" color="bg-emerald-50" />
        <StatCard label="Total Appointments" value={dashData?.appointments} icon="📅" color="bg-violet-50" />
      </div>

      {/* Latest Appointments */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-50">
          <h2 className="font-bold text-slate-800">Latest Appointments</h2>
          <button onClick={() => navigate('/all-appointments')} className="text-sky-600 text-sm font-semibold hover:underline">View all</button>
        </div>
        {!dashData?.latestAppointments?.length ? (
          <div className="p-12 text-center text-slate-400">No appointments yet</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {dashData.latestAppointments.map(apt => (
              <div key={apt._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <img
                  src={apt.docData?.image}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover bg-slate-200"
                  onError={e => e.target.src = `https://ui-avatars.com/api/?name=${apt.docData?.name}&background=0ea5e9&color=fff&size=40`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{apt.docData?.name}</p>
                  <p className="text-xs text-slate-500">{apt.slotDate?.replace(/_/g, '/')} · {apt.slotTime}</p>
                </div>
                <div className="flex items-center gap-2">
                  {apt.cancelled
                    ? <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">Cancelled</span>
                    : apt.isCompleted
                      ? <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full">Completed</span>
                      : <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-bold rounded-full">Pending</span>
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
