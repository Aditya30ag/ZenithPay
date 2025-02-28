import React from 'react'
import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <div className="fixed top-8 left-8 z-50 animate-fade-in">
          <Link to="/">
          <div className="relative group" >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-violet-500 to-amber-400 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
            <div className="relative w-20 h-20 sm:w-20 sm:h-20 flex items-center justify-center bg-black rounded-full border border-slate-800 overflow-hidden group-hover:scale-110 transition-transform duration-300">
              {/* Replace with your actual logo or initial */}
              
              {/* Uncomment and use this for an actual image logo */}
              <img src="/logo-transparent.png" alt="Hirecentive Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          </Link>
        </div>
  )
}
