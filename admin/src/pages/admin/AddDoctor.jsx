import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAdminContext } from '../../context/AdminContext'

const specialities = ['General physician', 'Gynecologist', 'Dermatologist', 'Pediatricians', 'Neurologist', 'Gastroenterologist']

const AddDoctor = () => {
  const { aToken, backendUrl } = useAdminContext()
  const [loading, setLoading] = useState(false)
  const [imgPreview, setImgPreview] = useState(null)
  const [form, setForm] = useState({
    name: '', email: '', password: '', speciality: 'General physician',
    degree: '', experience: '1 Year', about: '', fees: '',
    addressLine1: '', addressLine2: '',
  })
  const [imageFile, setImageFile] = useState(null)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleImageChange = e => {
    const file = e.target.files[0]
    if (file) { setImageFile(file); setImgPreview(URL.createObjectURL(file)) }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!imageFile) return toast.warn('Please upload a doctor image')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('image', imageFile)
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'addressLine1' || k === 'addressLine2') return
        fd.append(k, v)
      })
      fd.append('address', JSON.stringify({ line1: form.addressLine1, line2: form.addressLine2 }))

      const { data } = await axios.post(`${backendUrl}/api/admin/add-doctor`, fd, { headers: { atoken: aToken } })
      if (data.success) {
        toast.success('Doctor added successfully!')
        setForm({ name: '', email: '', password: '', speciality: 'General physician', degree: '', experience: '1 Year', about: '', fees: '', addressLine1: '', addressLine2: '' })
        setImageFile(null)
        setImgPreview(null)
      } else toast.error(data.message)
    } catch (err) { toast.error(err.message) }
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Add New Doctor</h1>
        <p className="text-slate-500 text-sm mt-1">Fill in the details to register a new doctor</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        {/* Image Upload */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Doctor Photo</label>
          <label className="cursor-pointer group inline-flex flex-col items-center">
            <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-300 group-hover:border-sky-400 bg-slate-50 group-hover:bg-sky-50 flex items-center justify-center overflow-hidden transition-all">
              {imgPreview
                ? <img src={imgPreview} alt="preview" className="w-full h-full object-cover rounded-2xl" />
                : <div className="text-center p-4">
                    <div className="text-3xl mb-1">📸</div>
                    <p className="text-xs text-slate-400 font-medium">Upload Photo</p>
                  </div>
              }
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Dr. Sarah Johnson"
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="doctor@example.com"
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors" />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min 8 characters"
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors" />
          </div>

          {/* Speciality */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Speciality</label>
            <select name="speciality" value={form.speciality} onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors">
              {specialities.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Degree */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Degree</label>
            <input name="degree" value={form.degree} onChange={handleChange} required placeholder="MBBS, MD, etc."
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors" />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Experience</label>
            <select name="experience" value={form.experience} onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors">
              {['1 Year','2 Years','3 Years','4 Years','5 Years','6 Years','7 Years','8 Years','9 Years','10+ Years'].map(e => <option key={e}>{e}</option>)}
            </select>
          </div>

          {/* Fees */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Consultation Fees (₹)</label>
            <input name="fees" type="number" value={form.fees} onChange={handleChange} required placeholder="500"
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors" />
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address Line 1</label>
            <input name="addressLine1" value={form.addressLine1} onChange={handleChange} required placeholder="Street / Area"
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors" />
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address Line 2</label>
            <input name="addressLine2" value={form.addressLine2} onChange={handleChange} placeholder="City, State"
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors" />
          </div>

          {/* About */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">About Doctor</label>
            <textarea name="about" value={form.about} onChange={handleChange} required rows={4}
              placeholder="Write a short bio about the doctor's expertise, achievements, and approach..."
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors resize-none" />
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button type="submit" disabled={loading}
            className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-sky-200 transition-all duration-300 disabled:opacity-60">
            {loading ? 'Adding Doctor...' : 'Add Doctor'}
          </button>
          <button type="button" onClick={() => { setForm({ name:'',email:'',password:'',speciality:'General physician',degree:'',experience:'1 Year',about:'',fees:'',addressLine1:'',addressLine2:'' }); setImgPreview(null); setImageFile(null) }}
            className="border-2 border-slate-200 text-slate-600 px-8 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddDoctor
