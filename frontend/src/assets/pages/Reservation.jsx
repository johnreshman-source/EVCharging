import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Reservation() {
  const navigate = useNavigate()
  
  // VoltReserve handles reservation creation from the StationDetails page.
  // This route is a fallback redirect.
  useEffect(() => {
    navigate('/stations', { replace: true })
  }, [navigate])
  
  return null
}
