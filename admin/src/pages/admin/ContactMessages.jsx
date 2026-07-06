import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAdminContext } from '../../context/AdminContext'

const ContactMessages = () => {
  const { aToken, backendUrl } = useAdminContext()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all') // all | unread | read

  const fetchMessages = async () => {
    setLoading(true)
  
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/contact/all`,
        {
          headers: { atoken: aToken }
        }
      )
  
      if (data.success) {
        setMessages(data.contacts)
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const markRead = async (contactId) => {
    try {
      await axios.post(`${backendUrl}/api/contact/mark-read`, { contactId }, { headers: { atoken: aToken } })
      setMessages(prev => prev.map(m => m._id === contactId ? { ...m, read: true } : m))
      if (selected?._id === contactId) setSelected(prev => ({ ...prev, read: true }))
    } catch (e) { toast.error(e.message) }
  }

  const deleteMessage = async (contactId) => {
    if (!window.confirm('Delete this message?')) return
    try {
      const { data } = await axios.post(`${backendUrl}/api/contact/delete`, { contactId }, { headers: { atoken: aToken } })
      if (data.success) {
        toast.success('Message deleted')
        setMessages(prev => prev.filter(m => m._id !== contactId))
        if (selected?._id === contactId) setSelected(null)
      }
    } catch (e) { toast.error(e.message) }
  }

  const openMessage = (msg) => {
    setSelected(msg)
    if (!msg.read) markRead(msg._id)
  }

  useEffect(() => { fetchMessages() }, [])

  const filtered = messages.filter(m => {
    if (filter === 'unread') return !m.read
    if (filter === 'read') return m.read
    return true
  })

  const unreadCount = messages.filter(m => !m.read).length

  const formatDate = (ts) => {
    const d = new Date(ts)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            Contact Messages
            {unreadCount > 0 && (
              <span className="bg-sky-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{messages.length} total messages from patients</p>
        </div>
        <button onClick={fetchMessages} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: `All (${messages.length})` },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'read', label: `Read (${messages.length - unreadCount})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === tab.key ? 'bg-sky-500 text-white shadow-md shadow-sky-200' : 'bg-white border border-slate-200 text-slate-600 hover:border-sky-300'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6 h-[calc(100vh-260px)] min-h-[500px]">
        {/* Message list */}
        <div className="w-80 shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wide">
            Inbox
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="h-3 bg-slate-100 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-slate-100 rounded w-1/2"></div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-sm font-medium">No messages</p>
              </div>
            ) : (
              filtered.map(msg => (
                <div
                  key={msg._id}
                  onClick={() => openMessage(msg)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-sky-50 ${selected?._id === msg._id ? 'bg-sky-50 border-l-4 border-sky-500' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {!msg.read && <span className="w-2 h-2 bg-sky-500 rounded-full shrink-0 mt-1"></span>}
                      <p className={`text-sm truncate ${!msg.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {msg.name}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {new Date(msg.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className={`text-xs mb-1 truncate ${!msg.read ? 'text-slate-700 font-semibold' : 'text-slate-500'}`}>
                    {msg.subject}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message detail */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          {selected ? (
            <>
              {/* Detail header */}
              <div className="p-6 border-b border-slate-50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 mb-1">{selected.subject}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                          {selected.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-700">{selected.name}</span>
                      </span>
                      <span>·</span>
                      <a href={`mailto:${selected.email}`} className="text-sky-600 hover:underline">{selected.email}</a>
                      <span>·</span>
                      <span>{formatDate(selected.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {selected.read
                      ? <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full">Read</span>
                      : <span className="px-2.5 py-1 bg-sky-100 text-sky-600 text-xs font-semibold rounded-full">New</span>
                    }
                    <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                      className="flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      Reply
                    </a>
                    <button onClick={() => deleteMessage(selected._id)}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Message body */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>

                {/* Quick reply */}
                <div className="mt-6">
  <h3 className="font-bold text-slate-800 mb-3 text-sm">
    Quick Reply via Email
  </h3>

  <a
    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(
      selected.subject
    )}&body=Hi ${encodeURIComponent(
      selected.name
    )},%0A%0AThank you for reaching out to Prescripto.%0A%0A`}
    className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-sky-200 transition-all"
  >
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>

    Open in Mail App
  </a>
</div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg font-semibold text-slate-500">Select a message to read</p>
              <p className="text-sm mt-1">Click any message from the inbox on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContactMessages