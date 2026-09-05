import axios from 'axios'

// Create an Axios instance
const api = axios.create({
  baseURL: '/api', // Vite proxy forwards this to localhost:5000
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vr_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login on 401, unless it's the login route itself
      if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/me')) {
        localStorage.removeItem('vr_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
