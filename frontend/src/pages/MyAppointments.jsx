import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAppContext } from '../context/AppContext'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const MyAppointments = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
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

  // Handle Stripe redirect back
  useEffect(() => {
    const payment = searchParams.get('payment')
    const appointmentId = searchParams.get('appointmentId')
    if (payment === 'success' && appointmentId) {
      const sessionId = localStorage.getItem('stripe_session_id')
      if (sessionId) {
        axios.post(`${backendUrl}/api/user/verify-stripe`,
          { sessionId, appointmentId },
          { headers: { token } }
        ).then(({ data }) => {
          if (data.success) toast.success('Payment successful! 🎉')
          else toast.error('Payment verification failed')
          localStorage.removeItem('stripe_session_id')
          getUserAppointments()
        })
      } else {
        toast.success('Appointment confirmed!')
        getUserAppointments()
      }
    } else if (payment === 'cancel') {
      toast.warn('Payment cancelled')
      getUserAppointments()
    }
  }, [])

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Cancel this appointment?')) return
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/cancel-appointment`, { appointmentId }, { headers: { token } })
      if (data.success) { toast.success('Appointment cancelled'); getUserAppointments() }
      else toast.error(data.message)
    } catch (error) { toast.error(error.message) }
  }

  const payWithStripe = async (appointmentId) => {
    setPayingId(appointmentId)
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/payment-stripe`,
        { appointmentId },
        { headers: { token } }
      )
      if (data.success) {
        localStorage.setItem('stripe_session_id', data.sessionId || '')
        window.location.href = data.session_url
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
    if (apt.payment) return <span className="px-2.5 py-1 bg-violet-100 text-violet-600 text-xs font-bold rounded-full">✓ Paid via Stripe</span>
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
                        onClick={() => payWithStripe(apt._id)}
                        disabled={payingId === apt._id}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-violet-200 transition-all disabled:opacity-60"
                      >
                        {payingId === apt._id ? (
                          <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Processing...</>
                        ) : (
                          <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.91 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg> Pay with Stripe</>
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