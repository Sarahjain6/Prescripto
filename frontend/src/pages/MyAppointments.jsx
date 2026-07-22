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
  const [payingId, setPayingId] = useState(null)

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, { headers: { token } })
      if (data.success) setAppointments(data.appointments.reverse())
    } catch (error) { toast.error(error.message) }
    setLoading(false)
  }

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Cancel this appointment?')) return
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/cancel-appointment`, { appointmentId }, { headers: { token } })
      if (data.success) { toast.success('Appointment cancelled'); getUserAppointments() }
      else toast.error(data.message)
    } catch (error) { toast.error(error.message) }
  }

  const initRazorpayPayment = (order, appointmentId) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Prescripto',
      description: 'Appointment Payment',
      order_id: order.id,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            `${backendUrl}/api/user/verify-razorpay`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentId,
            },
            { headers: { token } }
          )
          if (data.success) {
            toast.success('Payment successful! 🎉')
            getUserAppointments()
          } else {
            toast.error(data.message || 'Payment verification failed')
          }
        } catch (error) {
          toast.error(error.message)
        }
      },
      modal: {
        ondismiss: () => toast.warn('Payment cancelled'),
      },
      theme: { color: '#7c3aed' },
    }
    const razorpayObject = new window.Razorpay(options)
    razorpayObject.open()
  }

  const payWithRazorpay = async (appointmentId) => {
    setPayingId(appointmentId)
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/payment-razorpay`,
        { appointmentId },
        { headers: { token } }
      )
      if (data.success) {
        initRazorpayPayment(data.order, appointmentId)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setPayingId(null)
  }

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    getUserAppointments()
  }, [token])

  const getStatusBadge = (apt) => {
    if (apt.cancelled) return <span className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">Cancelled</span>
    if (apt.isCompleted) return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full">Completed</span>
    if (apt.payment) return <span className="px-2.5 py-1 bg-violet-100 text-violet-600 text-xs font-bold rounded-full">✓ Paid via Razorpay</span>
    return <span className="px-2.5 py-1 bg-amber-100 text-amber-600 text-xs font-bold rounded-full">Payment Pending</span>
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">My Appointments</h1>
        <p className="text-slate-500">Manage and pay for your scheduled appointments</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No appointments yet</h3>
          <p className="text-slate-500 mb-6">Book your first appointment with a specialist</p>
          <button onClick={() => navigate('/doctors')}
            className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold">
            Find Doctors
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-32 bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center p-4">
                  <img src={apt.docData?.image} alt={apt.docData?.name}
                    className="w-24 h-24 rounded-2xl object-cover"
                    onError={e => e.target.src = `https://ui-avatars.com/api/?name=${apt.docData?.name}&background=7c3aed&color=fff&size=100`} />
                </div>
                <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-slate-800 text-base">{apt.docData?.name}</h3>
                      {getStatusBadge(apt)}
                    </div>
                    <p className="text-violet-600 text-sm font-semibold mb-2">{apt.docData?.speciality}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>📅 {apt.slotDate?.replace(/_/g, '/')}</span>
                      <span>⏰ {apt.slotTime}</span>
                      <span>💰 {currencySymbol}{apt.amount}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[150px]">
                    {!apt.cancelled && !apt.isCompleted && !apt.payment && (
                      <button
                        onClick={() => payWithRazorpay(apt._id)}
                        disabled={payingId === apt._id}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-violet-200 transition-all disabled:opacity-60"
                      >
                        {payingId === apt._id ? (
                          <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Processing...</>
                        ) : (
                          <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.834 2.256 16.66 6.5H12.9l1.174-4.244a.3.3 0 0 0-.29-.381H10.8a.4.4 0 0 0-.385.294L6.166 21.744a.3.3 0 0 0 .29.381h2.986a.4.4 0 0 0 .385-.294l1.634-5.915 2.336 6.055a.4.4 0 0 0 .373.254h3.096a.3.3 0 0 0 .277-.412l-2.85-7.31c2.24-.63 4.42-2.51 5.12-5.05.98-3.55-1.03-6.2-3.98-7.197z"/></svg> Pay with Razorpay</>
                        )}
                      </button>
                    )}
                    {!apt.cancelled && !apt.isCompleted && (
                      <button onClick={() => cancelAppointment(apt._id)}
                        className="border-2 border-red-200 text-red-500 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors text-center">
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