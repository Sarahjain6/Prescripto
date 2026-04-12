import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAppContext } from '../context/AppContext'

const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const Appointment = () => {
  const { docId } = useParams()
  const navigate = useNavigate()
  const { doctors, token, backendUrl, getDoctorsData, currencySymbol } = useAppContext()

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedTime, setSelectedTime] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const doc = doctors.find(d => d._id === docId)
    setDocInfo(doc)
  }, [docId, doctors])

  useEffect(() => {
    if (!docInfo) return
    const slots = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const times = []
      let startHour = i === 0 ? Math.max(10, today.getHours() + 1) : 10
      for (let h = startHour; h < 21; h++) {
        for (let m of [0, 30]) {
          if (i === 0 && h === today.getHours() && m <= today.getMinutes()) continue
          const time = `${h > 12 ? h - 12 : h}:${m === 0 ? '00' : m} ${h >= 12 ? 'PM' : 'AM'}`
          const slotDate = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`
          const isBooked = docInfo.slots_booked?.[slotDate]?.includes(time)
          times.push({ time, booked: isBooked })
        }
      }
      slots.push({ date, times })
    }
    setDocSlots(slots)
  }, [docInfo])

  const bookAppointment = async () => {
    if (!token) { toast.warn('Please log in to book an appointment'); return navigate('/login') }
    if (!selectedTime) { toast.warn('Please select a time slot'); return }
    setLoading(true)
    try {
      const date = docSlots[selectedDay].date
      const slotDate = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`
      const { data } = await axios.post(`${backendUrl}/api/user/book-appointment`,
        { docId, slotDate, slotTime: selectedTime },
        { headers: { token } }
      )
      if (data.success) {
        toast.success('Appointment booked successfully!')
        getDoctorsData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  if (!docInfo) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500">Loading doctor info...</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Doctor info card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-64 bg-gradient-to-br from-sky-50 to-cyan-50 flex items-end justify-center pt-8">
            <img
              src={docInfo.image}
              alt={docInfo.name}
              className="h-56 object-cover object-top"
              onError={e => e.target.src = `https://ui-avatars.com/api/?name=${docInfo.name}&background=0ea5e9&color=fff&size=200`}
            />
          </div>
          <div className="flex-1 p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 mb-1">{docInfo.name}</h1>
                <p className="text-sky-600 font-semibold">{docInfo.speciality}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${docInfo.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {docInfo.available ? '● Available' : '● Unavailable'}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {[{ label: docInfo.degree }, { label: docInfo.experience }, { label: `${currencySymbol}${docInfo.fees} / visit` }].map((tag, i) => (
                <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-sm font-medium">{tag.label}</span>
              ))}
            </div>

            <div className="mb-4">
              <h3 className="font-bold text-slate-800 mb-2">About</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{docInfo.about}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs mb-1">Address Line 1</p>
                <p className="font-medium text-slate-700">{docInfo.address?.line1}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Address Line 2</p>
                <p className="font-medium text-slate-700">{docInfo.address?.line2}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slot picker */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">Book Your Appointment</h2>

        {/* Days */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
          {docSlots.map((slot, i) => (
            <button
              key={i}
              onClick={() => { setSelectedDay(i); setSelectedTime('') }}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-5 py-3 rounded-2xl border-2 font-semibold text-sm transition-all ${selectedDay === i ? 'bg-gradient-to-b from-sky-500 to-cyan-500 border-sky-500 text-white shadow-lg shadow-sky-200' : 'border-slate-200 text-slate-700 hover:border-sky-300'}`}
            >
              <span className="text-xs opacity-70">{daysOfWeek[slot.date.getDay()]}</span>
              <span className="text-lg font-extrabold">{slot.date.getDate()}</span>
            </button>
          ))}
        </div>

        {/* Times */}
        <div className="flex flex-wrap gap-3 mb-8">
          {docSlots[selectedDay]?.times.map(({ time, booked }) => (
            <button
              key={time}
              disabled={booked}
              onClick={() => setSelectedTime(time)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${booked ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400 line-through' : selectedTime === time ? 'bg-gradient-to-r from-sky-500 to-cyan-500 border-sky-500 text-white shadow-md shadow-sky-200' : 'border-slate-200 text-slate-700 hover:border-sky-300 hover:text-sky-600'}`}
            >
              {time}
            </button>
          ))}
        </div>

        {/* Booking summary */}
        {selectedTime && (
          <div className="bg-sky-50 rounded-2xl p-4 mb-6 border border-sky-100">
            <h3 className="font-bold text-sky-800 mb-2">Booking Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-sky-600 text-xs mb-0.5">Doctor</p><p className="font-semibold text-slate-800">{docInfo.name}</p></div>
              <div><p className="text-sky-600 text-xs mb-0.5">Date & Time</p><p className="font-semibold text-slate-800">{docSlots[selectedDay]?.date.toDateString()} · {selectedTime}</p></div>
              <div><p className="text-sky-600 text-xs mb-0.5">Consultation Fee</p><p className="font-semibold text-emerald-600 text-base">{currencySymbol}{docInfo.fees}</p></div>
              <div><p className="text-sky-600 text-xs mb-0.5">Speciality</p><p className="font-semibold text-slate-800">{docInfo.speciality}</p></div>
            </div>
          </div>
        )}

        <button
          onClick={bookAppointment}
          disabled={!selectedTime || loading}
          className="w-full md:w-auto bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-10 py-4 rounded-2xl font-bold text-base hover:shadow-xl hover:shadow-sky-200 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? 'Booking...' : `Confirm Appointment · ${currencySymbol}${docInfo.fees}`}
        </button>
      </div>
    </div>
  )
}

export default Appointment
