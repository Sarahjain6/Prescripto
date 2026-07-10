import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import axios from 'axios'
import { useAdminContext } from '../context/AdminContext'
import { useDoctorContext } from '../context/DoctorContext'

const doctorLinks = [
  { to: '/doctor-dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/doctor-appointments', label: 'Appointments', icon: '📅' },
  { to: '/doctor-profile', label: 'My Profile', icon: '👤' },
]

const Sidebar = () => {
  const { aToken, backendUrl } = useAdminContext()
  const { dToken } = useDoctorContext()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!aToken) return
    const fetchUnread = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/contact/all`, { headers: { atoken: aToken } })
        if (data.success) setUnreadCount(data.contacts.filter(c => !c.read).length)
      } catch {}
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [aToken])

  const adminLinks = [
    { to: '/admin-dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/all-appointments', label: 'Appointments', icon: '📅' },
    { to: '/add-doctor', label: 'Add Doctor', icon: '➕' },
    { to: '/doctor-list', label: 'Doctors List', icon: '👨‍⚕️' },
    { to: '/contact-messages', label: 'Messages', icon: '💬', badge: unreadCount },
  ]

  const links = aToken ? adminLinks : doctorLinks

  return (
    <aside className="w-56 bg-white border-r border-slate-100 min-h-full shrink-0 hidden md:block">
      <nav className="p-4 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`
            }
          >
            <span>{link.icon}</span>
            <span className="flex-1">{link.label}</span>
            {link.badge > 0 && (
              <span className="bg-sky-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {link.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
