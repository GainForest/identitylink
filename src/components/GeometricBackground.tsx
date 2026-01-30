'use client'

import { useState, useEffect } from 'react'

export function GeometricBackground() {
  const [showLogo, setShowLogo] = useState(false)

  // Show logo every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowLogo(true)
      setTimeout(() => setShowLogo(false), 8000)
    }, 30000)

    // Show once on initial load after a short delay
    const initialTimeout = setTimeout(() => {
      setShowLogo(true)
      setTimeout(() => setShowLogo(false), 8000)
    }, 2000)

    return () => {
      clearInterval(interval)
      clearTimeout(initialTimeout)
    }
  }, [])

  return (
    <div 
      className="fixed inset-0 pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Flow column 1 - Blue/Purple */}
      <div className="absolute right-[220px] top-0">
        <div className="w-1 h-20 bg-gradient-to-b from-transparent via-blue-400/40 to-transparent rounded-full animate-[flowDown_9s_linear_infinite] [animation-fill-mode:backwards]" />
        <div className="absolute w-6 h-6 border-[1.5px] border-purple-400/50 animate-[flowDown_12s_linear_infinite_1s] [animation-fill-mode:backwards]" />
        <svg className="absolute w-3 h-3 animate-[flowDown_8s_linear_infinite_5s] [animation-fill-mode:backwards]" viewBox="0 0 12 12">
          <polygon points="6,0 12,12 0,12" fill="rgb(147, 51, 234)" opacity="0.4" />
        </svg>
      </div>

      {/* Flow column 2 */}
      <div className="absolute right-[150px] top-0">
        <div className="w-1 h-16 bg-gradient-to-b from-transparent via-blue-400/40 to-transparent rounded-full animate-[flowDown_7s_linear_infinite_2s] [animation-fill-mode:backwards]" />
        <svg className="absolute w-5 h-5 animate-[flowDown_10s_linear_infinite] [animation-fill-mode:backwards]" viewBox="0 0 16 16">
          <polygon points="8,0 16,16 0,16" fill="none" stroke="rgb(59, 130, 246)" strokeWidth="1.5" opacity="0.5" />
        </svg>
        <div className="absolute w-3 h-3 bg-purple-400/30 animate-[flowDown_15s_linear_infinite_4s] [animation-fill-mode:backwards]" />
      </div>

      {/* Flow column 3 */}
      <div className="absolute right-[80px] top-0">
        <div className="w-1 h-[70px] bg-gradient-to-b from-transparent via-purple-400/40 to-transparent rounded-full animate-[flowDown_11s_linear_infinite_4s] [animation-fill-mode:backwards]" />
        <div className="absolute w-4 h-4 border-[1.5px] border-blue-400/50 animate-[flowDown_14s_linear_infinite_3s] [animation-fill-mode:backwards]" />
        <svg className="absolute w-4 h-4 animate-[flowDown_18s_linear_infinite_2s] [animation-fill-mode:backwards]" viewBox="0 0 12 12">
          <polygon points="6,0 12,12 0,12" fill="none" stroke="rgb(147, 51, 234)" strokeWidth="1.5" opacity="0.4" />
        </svg>
      </div>

      {/* Link icon - appears every 30s */}
      {showLogo && (
        <div className="absolute right-[140px] top-0 animate-[flowDownLogo_8s_ease-in-out_forwards]">
          <svg 
            className="w-8 h-8 opacity-40" 
            viewBox="0 0 24 24" 
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="1.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        </div>
      )}

      <style jsx>{`
        @keyframes flowDown {
          0% { transform: translateY(-100px); }
          100% { transform: translateY(100vh); }
        }
        @keyframes flowDownLogo {
          0% { 
            transform: translateY(-60px); 
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% { 
            transform: translateY(100vh); 
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
