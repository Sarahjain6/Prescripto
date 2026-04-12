import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAppContext } from '../context/AppContext'

const MyAppointments = () => {
  const navigate = useNavigate()
  const { token, backendUrl, currencySymbol } = useAppContext()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, { headers: { token } })
      if (data.success) setAppointments(data.appointments.reverse())
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/cancel-appointment`, { appointmentId }, { headers: { token } })
      if (data.success) { toast.success('Appointment cancelled'); getUserAppointments() }
      else toast.error(data.message)
    } catch (error) { toast.error(error.message) }
  }

  const initPayment = async (appointmentId, amount) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/payment-razorpay`, { appointmentId }, { headers: { token } })
      if (!data.success) return toast.error(data.message)
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Prescripto',
        description: 'Appointment Payment',
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const { data: verifyData } = await axios.post(`${backendUrl}/api/user/verify-razorpay`, response, { headers: { token } })
            if (verifyData.success) { toast.success('Payment successful!'); getUserAppointments() }
          } catch (err) { toast.error(err.message) }
        },
        theme: { color: '#0EA5E9' },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) { toast.error(error.message) }
  }

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    getUserAppointments()
  }, [token])

  const getStatusBadge = (apt) => {
    if (apt.cancelled) return <span className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">Cancelled</span>
    if (apt.isCompleted) return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full">Completed</span>
    if (apt.payment) return <span className="px-2.5 py-1 bg-sky-100 text-sky-600 text-xs font-bold rounded-full">Paid ✓</span>
    return <span className="px-2.5 py-1 bg-amber-100 text-amber-600 text-xs font-bold rounded-full">Payment Pending</span>
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">My Appointments</h1>
        <p className="text-slate-500">Manage and view all your scheduled appointments</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No appointments yet</h3>
          <p className="text-slate-500 mb-6">Book your first appointment with a specialist</p>
          <button onClick={() => navigate('/doctors')} className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold">
            Find Doctors
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-32 bg-gradient-to-br from-sky-50 to-cyan-50 flex items-center justify-center p-4">
                  <img
                    src={apt.docData?.image}
                    alt={apt.docData?.name}
                    className="w-24 h-24 rounded-2xl object-cover"
                    onError={e => e.target.src = `https://ui-avatars.com/api/?name=${apt.docData?.name}&background=0ea5e9&color=fff&size=100`}
                  />
                </div>
                <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 text-base">{apt.docData?.name}</h3>
                      {getStatusBadge(apt)}
                    </div>
                    <p className="text-sky-600 text-sm font-semibold mb-2">{apt.docData?.speciality}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>📅 {apt.slotDate?.replace(/_/g, '/')}</span>
                      <span>⏰ {apt.slotTime}</span>
                      <span>💰 {currencySymbol}{apt.amount}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    {!apt.cancelled && !apt.isCompleted && !apt.payment && (
                      <button
                        onClick={() => initPayment(apt._id, apt.amount)}
                        className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-md transition-all"
                      >
                        Pay Online
                      </button>
                    )}
                    {!apt.cancelled && !apt.isCompleted && (
                      <button
                        onClick={() => cancelAppointment(apt._id)}
                        className="border-2 border-red-200 text-red-500 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyAppointments
