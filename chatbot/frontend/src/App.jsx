import React from 'react'
import Chatbot from './Chatbot.jsx'
import './App.css'

export default function App() {
  return (
    <div style={{ height: '100vh', backgroundColor: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
      {/* Glittery Neon Crystals */}
      <div className="crystal-container">
        {/* Left side crystals */}
        <div className="crystal crystal-diamond crystal-1"></div>
        <div className="crystal crystal-triangle crystal-2"></div>
        <div className="crystal crystal-hexagon crystal-3"></div>
        <div className="crystal crystal-star crystal-4"></div>
        <div className="crystal crystal-octagon crystal-5"></div>
        <div className="crystal crystal-diamond crystal-6"></div>
        <div className="crystal crystal-triangle crystal-7"></div>
        <div className="crystal crystal-hexagon crystal-8"></div>
        <div className="crystal crystal-star crystal-9"></div>
        <div className="crystal crystal-octagon crystal-10"></div>
        
        {/* Right side crystals */}
        <div className="crystal crystal-triangle crystal-11"></div>
        <div className="crystal crystal-diamond crystal-12"></div>
        <div className="crystal crystal-star crystal-13"></div>
        <div className="crystal crystal-hexagon crystal-14"></div>
        <div className="crystal crystal-octagon crystal-15"></div>
        <div className="crystal crystal-diamond crystal-16"></div>
        <div className="crystal crystal-triangle crystal-17"></div>
        <div className="crystal crystal-star crystal-18"></div>
        <div className="crystal crystal-hexagon crystal-19"></div>
        <div className="crystal crystal-octagon crystal-20"></div>
        
        {/* Center area crystals */}
        <div className="crystal crystal-star crystal-21"></div>
        <div className="crystal crystal-diamond crystal-22"></div>
        <div className="crystal crystal-hexagon crystal-23"></div>
        <div className="crystal crystal-triangle crystal-24"></div>
      </div>

      {/* Left side floating icons */}
      <div className="floating-icons-left">
        <div className="floating-icon icon-1">📊</div>
        <div className="floating-icon icon-2">⚖️</div>
        <div className="floating-icon icon-3">🏢</div>
        <div className="floating-icon icon-4">📋</div>
        <div className="floating-icon icon-5">🔒</div>
      </div>

      {/* Right side floating icons */}
      <div className="floating-icons-right">
        <div className="floating-icon icon-6">📈</div>
        <div className="floating-icon icon-7">🎯</div>
        <div className="floating-icon icon-8">💼</div>
        <div className="floating-icon icon-9">📑</div>
        <div className="floating-icon icon-10">✅</div>
      </div>

      <Chatbot />
    </div>
  )
}
