import React from 'react'

export default function Input({ label, ...props }) {
    return (
        <div className='mb-5'>
            {label && (
                <label className="block text-white mb-2">
                    {label}
                </label>
            )}
            <input
                {...props}
                className="w-full bg-primary text-white rounded-lg p-3 outline-none border border-gray-700 focus:border-btn"
            />
        </div>
    )
}
