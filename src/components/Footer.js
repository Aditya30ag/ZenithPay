import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-gray-800 w-full p-6 text-center">
          <p className="text-gray-400">Follow us on:</p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="#" className="text-blue-400 hover:text-blue-500">Facebook</a>
            <a href="#" className="text-blue-400 hover:text-blue-500">Twitter</a>
            <a href="#" className="text-blue-400 hover:text-blue-500">LinkedIn</a>
          </div>
          <p className="text-gray-500 mt-4">Privacy Policy | Terms & Conditions</p>
        </footer>
  )
}
