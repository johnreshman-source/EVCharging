import api from './api'

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard')
    return response.data
  },

  setPortStatus: async (portId, status) => {
    const response = await api.post(`/admin/ports/${portId}/status`, { status })
    return response.data
  },

  cancelReservation: async (reservationId) => {
    const response = await api.post(`/admin/reservations/${reservationId}/cancel`)
    return response.data
  },

  triggerDemoCycle: async () => {
    const response = await api.post('/admin/demo/cycle')
    return response.data
  },
}
