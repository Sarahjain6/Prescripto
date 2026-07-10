import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useDoctorContext } from '../../context/DoctorContext'

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl } = useDoctorContext()
  const [isEdit, setIsEdit] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { getProfileData() }, [])

  const updateProfile = async () => {
    setLoading(true)
    try {
      const updateData = {
        fees: profileData.fees,
        address: profileData.address,
        available: profileData.available,
        about: profileData.about,
      }
      const { data } = await axios.post(`${backendUrl}/api/doctor/update-profile`, updateData, { headers: { dtoken: dToken } })
      if (data.success) { toast.success('Profile updated!'); setIsEdit(false); getProfileData() }
      else toast.error(data.message)
    } catch (err) { toast.error(err.message) }
    setLoading(false)
  }

  if (!profileData) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your professional information</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-sky-500 to-cyan-500 h-24 relative" />
        <div className="px-8 pb-8">
          <div className="-mt-14 mb-6 flex items-end justify-between">
            <img
              src={profileData.image}
              alt={profileData.name}
              className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-xl"
              onError={e => e.target.src = `https://ui-avatars.com/api/?name=${profileData.name}&background=0ea5e9&color=fff&size=112`}
            />
            <div className="flex items-center gap-3 mt-16">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-semibold text-slate-600">Available</span>
                <div
                  onClick={() => isEdit && setProfileData(p => ({ ...p, available: !p.available }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isEdit ? 'cursor-pointer' : 'cursor-default'} ${profileData.available ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${profileData.available ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <p className="text-2xl font-extrabold text-slate-900">{profileData.name}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-sky-100 text-sky-700 text-sm font-semibold px-3 py-1 rounded-full">{profileData.speciality}</span>
                <span className="bg-slate-100 text-slate-700 text-sm font-medium px-3 py-1 rounded-full">{profileData.degree}</span>
                <span className="bg-slate-100 text-slate-700 text-sm font-medium px-3 py-1 rounded-full">{profileData.experience}</span>
              </div>
            </div>

            {/* About */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">About</label>
              {isEdit
                ? <textarea rows={4} value={profileData.about} onChange={e => setProfileData(p => ({ ...p, about: e.target.value }))}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-colors resize-none" />
                : <p className="text-slate-700 text-sm leading-relaxed">{profileData.about}</p>
              }
            </div>

            {/* Fees */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Consultation Fees (₹)</label>
              {isEdit
                ? <input type="number" value={profileData.fees} onChange={e => setProfileData(p => ({ ...p, fees: e.target.value }))}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-colors" />
                : <p className="text-slate-900 font-bold text-lg">₹{profileData.fees}</p>
              }
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Address</label>
              {isEdit ? (
                <div className="space-y-2">
                  <input value={profileData.address?.line1 || ''} onChange={e => setProfileData(p => ({ ...p, address: { ...p.address, line1: e.target.value } }))}
                    placeholder="Line 1" className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-colors" />
                  <input value={profileData.address?.line2 || ''} onChange={e => setProfileData(p => ({ ...p, address: { ...p.address, line2: e.target.value } }))}
                    placeholder="Line 2" className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-colors" />
                </div>
              ) : (
                <div className="text-slate-700 text-sm">
                  <p>{profileData.address?.line1}</p>
                  <p>{profileData.address?.line2}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            {isEdit ? (
              <>
                <button onClick={updateProfile} disabled={loading}
                  className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-60">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setIsEdit(false)}
                  className="border-2 border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setIsEdit(true)}
                className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all">
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
