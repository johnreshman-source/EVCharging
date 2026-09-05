import api from './api'

export const stationService = {
  getStations: async (lat, lng) => {
    const params = new URLSearchParams()
    if (lat && lng) {
      params.append('lat', lat)
      params.append('lng', lng)
    }
    const response = await api.get(`/stations?${params.toString()}`)
    return response.data
  },

  getStationById: async (id) => {
    const response = await api.get(`/stations/${id}`)
    return response.data
  },
}
