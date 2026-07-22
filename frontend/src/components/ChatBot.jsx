import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const SPECIALITIES = ['General physician', 'Gynecologist', 'Dermatologist', 'Pediatricians', 'Neurologist', 'Gastroenterologist']

const ChatBot = () => {
  const { backendUrl } = useAppContext()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm Presi 👋 Ask me how booking works, or tell me what's bothering you and I'll point you to the right specialist." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])
    setLoading(true)
    try {
      const { data } = await axios.post(`${backendUrl}/api/chat/message`, {
        message: text,
        history: messages,
      })
      if (data.success) {
        setMessages(prev => [...prev, { role: 'bot', text: data.reply }])
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble right now. Please try again, or email support@prescripto.com." }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting. Please try again shortly." }])
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  // If the bot's reply mentions a known speciality, offer a quick link
  const matchedSpeciality = (text) => SPECIALITIES.find(s => text?.toLowerCase().includes(s.toLowerCase()))

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-4 w-[350px] max-w-[90vw] h-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🩺</span>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Presi</p>
                <p className="text-sky-100 text-[11px] leading-tight">Prescripto Assistant</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white text-xl leading-none">×</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-sky-500 text-white rounded-br-sm'
                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
                }`}>
                  {m.text}
                  {m.role === 'bot' && matchedSpeciality(m.text) && (
                    <button
                      onClick={() => navigate(`/doctors/${matchedSpeciality(m.text)}`)}
                      className="mt-2 block w-full text-center text-xs font-semibold bg-sky-50 text-sky-600 px-3 py-1.5 rounded-lg hover:bg-sky-100 transition-colors"
                    >
                      View {matchedSpeciality(m.text)}s →
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-2xl rounded-bl-sm flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-3 flex gap-2 bg-white">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 resize-none px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="bg-sky-500 text-white w-9 h-9 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-sky-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 pb-2">Not medical advice — for emergencies, contact local emergency services.</p>
        </div>
      )}

      {/* Toggle bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 shadow-xl flex items-center justify-center text-white text-2xl hover:scale-105 transition-transform"
        aria-label="Open chat"
      >
        {open ? '×' : '💬'}
      </button>
    </div>
  )
}

export default ChatBot
