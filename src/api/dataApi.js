import axios from 'axios'

const baseURL = 'https://platform.iot-privacy.info/api/data/'
//const baseURL = 'http://localhost:8080/'

const dataApi = axios.create({ baseURL })

// Embed base url
dataApi.baseURL = baseURL

// Attach token
dataApi.interceptors.request.use((config) => {
  let token = localStorage.getItem('auth')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export { dataApi }
