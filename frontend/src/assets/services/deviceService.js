import api from './api'

export const deviceService = {
  // Used by the dashboard to get live port statuses
  getStatus: async () => {
    const response = await api.get('/device/status')
    return response.data
  },
}
