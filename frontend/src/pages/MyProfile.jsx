import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAppContext } from '../context/AppContext'

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } = useAppContext()
  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)

  const updateProfile = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', userData.name)
      formData.append('phone', userData.phone)
      formData.append('address', JSON.stringify(userData.address))
      formData.append('gender', userData.gender)
      formData.append('dob', userData.dob)
      if (image) formData.append('image', image)

      const { data } = await axios.post(`${backendUrl}/api/user/update-profile`, formData, { headers: { token } })
      if (data.success) {
        toast.success('Profile updated!')
        await loadUserProfileData()
        setIsEdit(false)
        setImage(null)
      } else toast.error(data.message)
    } catch (error) { toast.error(error.message) }
    setLoading(false)
  }

  if (!userData) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500">Loading profile...</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">My Profile</h1>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-cyan-500 p-8 flex flex-col items-center">
          <label className={`relative cursor-pointer group ${isEdit ? 'cursor-pointer' : 'cursor-default'}`}>
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img
                src={image ? URL.createObjectURL(image) : userData.image || `https://ui-avatars.com/api/?name=${userData.name}&background=fff&color=0ea5e9&size=200`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {isEdit && (
              <>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={e => setImage(e.target.files[0])} />
              </>
            )}
          </label>
          <h2 className="text-white text-xl font-bold mt-4">{userData.name}</h2>
          <p className="text-sky-100 text-sm">{userData.email}</p>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
              {isEdit
                ? <input value={userData.name} onChange={e => setUserData(p => ({ ...p, name: e.target.value }))}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-colors" />
                : <p className="text-slate-800 font-semibold">{userData.name}</p>
              }
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Phone</label>
              {isEdit
                ? <input value={userData.phone} onChange={e => setUserData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-colors" />
                : <p className="text-slate-800 font-semibold">{userData.phone}</p>
              }
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Gender</label>
              {isEdit
                ? <select value={userData.gender} onChange={e => setUserData(p => ({ ...p, gender: e.target.value }))}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-colors">
                    <option>Not Selected</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                : <p className="text-slate-800 font-semibold">{userData.gender}</p>
              }
            </div>

            {/* DOB */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Date of Birth</label>
              {isEdit
                ? <input type="date" value={userData.dob} onChange={e => setUserData(p => ({ ...p, dob: e.target.value }))}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-colors" />
                : <p className="text-slate-800 font-semibold">{userData.dob}</p>
              }
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
              <p className="text-slate-800 font-semibold">{userData.email}</p>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Address</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['line1', 'line2'].map(line => (
                <div key={line}>
                  <label className="block text-xs text-slate-400 mb-1">{line === 'line1' ? 'Line 1' : 'Line 2'}</label>
                  {isEdit
                    ? <input value={userData.address?.[line] || ''} onChange={e => setUserData(p => ({ ...p, address: { ...p.address, [line]: e.target.value } }))}
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-colors" />
                    : <p className="text-slate-800 font-medium text-sm">{userData.address?.[line] || '—'}</p>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {isEdit ? (
              <>
                <button onClick={updateProfile} disabled={loading}
                  className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-60">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => { setIsEdit(false); setImage(null) }}
                  className="border-2 border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setIsEdit(true)}
                className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyProfile
