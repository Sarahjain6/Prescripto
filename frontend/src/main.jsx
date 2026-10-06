import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'
import { BrowserRouter } from 'react-router-dom'
import AppContextProvider from './context/AppContext.jsx'

// Non-2xx responses (429 rate limit, 400 bad upload, 500) carry a JSON message
// from the API. Surface it instead of "Request failed with status code 429".
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMessage = error?.response?.data?.message
    if (serverMessage) error.message = serverMessage
    return Promise.reject(error)
  }
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </BrowserRouter>
)
