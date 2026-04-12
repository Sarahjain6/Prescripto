import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import DoctorCard from '../components/DoctorCard'

const specialities = [
  { name: 'General physician', icon: '🩺' },
  { name: 'Gynecologist', icon: '👩‍⚕️' },
  { name: 'Dermatologist', icon: '🧴' },
  { name: 'Pediatricians', icon: '👶' },
  { name: 'Neurologist', icon: '🧠' },
  { name: 'Gastroenterologist', icon: '🫁' },
]

const stats = [
  { value: '500+', label: 'Expert Doctors' },
  { value: '50K+', label: 'Happy Patients' },
  { value: '20+', label: 'Specialities' },
  { value: '4.9★', label: 'Average Rating' },
]

const Home = () => {
  const navigate = useNavigate()
  const { doctors } = useAppContext()

  return (
    <div>
      {/* HERO */}
      <section className="hero-gradient overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
              Trusted Healthcare Platform
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              Book Appointment<br />
              <span className="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">
                With Trusted
              </span>{' '}
              Doctors
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
              Find and book appointments with verified specialists near you. Fast, easy, and secure scheduling for all your healthcare needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/doctors')}
                className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-sky-200 transition-all duration-300 hover:-translate-y-1"
              >
                Find a Doctor →
              </button>
              <button
                onClick={() => navigate('/about')}
                className="border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg hover:border-sky-300 hover:text-sky-600 transition-all duration-300"
              >
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 mt-14">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -top-10 -right-10 w-80 h-80 bg-sky-200 rounded-full opacity-30 blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-cyan-200 rounded-full opacity-30 blur-3xl"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Quick Appointment</p>
                  <p className="text-xs text-slate-500">Available Today</p>
                </div>
              </div>
              {[
                { time: '09:00 AM', doc: 'Dr. Sarah Johnson', spec: 'Cardiologist', color: 'bg-emerald-50 border-emerald-200' },
                { time: '11:30 AM', doc: 'Dr. Raj Patel', spec: 'Neurologist', color: 'bg-sky-50 border-sky-200' },
                { time: '02:00 PM', doc: 'Dr. Priya Singh', spec: 'Dermatologist', color: 'bg-violet-50 border-violet-200' },
              ].map((slot) => (
                <div key={slot.time} className={`flex items-center gap-3 p-3 rounded-xl border ${slot.color} mb-3`}>
                  <span className="text-xs font-bold text-slate-600 w-20">{slot.time}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{slot.doc}</p>
                    <p className="text-xs text-slate-500">{slot.spec}</p>
                  </div>
                </div>
              ))}
              <button onClick={() => navigate('/doctors')} className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALITIES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Browse by Speciality</h2>
            <p className="text-slate-500">Select a speciality to find the right doctor for you</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {specialities.map((s) => (
              <button
                key={s.name}
                onClick={() => navigate(`/doctors/${s.name}`)}
                className="group flex flex-col items-center gap-3 p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-sky-300 hover:bg-sky-50 transition-all duration-300 hover:-translate-y-1 shadow-sm"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{s.icon}</span>
                <p className="text-xs font-semibold text-slate-700 text-center leading-tight">{s.name}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TOP DOCTORS */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Top Doctors</h2>
              <p className="text-slate-500">Verified specialists ready to help</p>
            </div>
            <button onClick={() => navigate('/doctors')} className="text-sky-600 font-semibold hover:underline text-sm">
              View All →
            </button>
          </div>
          {doctors.length === 0 ? (
            <div className="grid grid-cols-auto gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-slate-100">
                  <div className="bg-slate-200 h-48 rounded-t-2xl"></div>
                  <div className="p-4 space-y-2">
                    <div className="bg-slate-200 h-3 rounded w-1/2"></div>
                    <div className="bg-slate-200 h-4 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-auto gap-6">
              {doctors.slice(0, 8).map((doc) => <DoctorCard key={doc._id} doctor={doc} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 bg-gradient-to-r from-sky-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl font-extrabold mb-4">Ready to take charge of your health?</h2>
          <p className="text-sky-100 text-lg mb-8">Join thousands of patients who trust Prescripto for their healthcare needs.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-sky-600 px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            Get Started Free
          </button>
        </div>
      </section>
    </div>
  )
}

export default Home
