import api from './api'

export const reservationService = {
  getAll: async () => {
    const response = await api.get('/reservations')
    return response.data
  },

  getActive: async () => {
    const response = await api.get('/reservations/active')
    return response.data
  },

  create: async (portId, lat, lng) => {
    const response = await api.post('/reservations', {
      port_id: portId,
      latitude: lat,
      longitude: lng,
    })
    return response.data
  },

  cancel: async (reservationId) => {
    const response = await api.delete(`/reservations/${reservationId}`)
    return response.data
  },

  getQRCode: async (bookingId) => {
    const response = await api.get(`/qr/generate/${bookingId}`)
    return response.data
  },
}
