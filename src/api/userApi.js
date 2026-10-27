import axios from 'axios'

const userApi = axios.create({
  baseURL: 'https://platform.iot-privacy.info/api/user/'
  //baseURL: 'http://localhost:4040/'
})

// Attach token
userApi.interceptors.request.use((config) => {
  let token = localStorage.getItem('auth')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['X-RP-Host'] = location.hostname
  return config
})

export { userApi }
