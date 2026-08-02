import React from 'react'

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-5">
      <div className="w-full max-w-md bg-card rounded-xl p-8">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="text-gray-400 mt-2 mb-8">{subtitle}</p>
        {children}
      </div>
    </div>
  )
}
