import { defineStore } from 'pinia'

import { userApi } from '@/api/userApi'

export const useAuth = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    loading: false,
  }),

  actions: {
    login(token, user) {
      //console.log('Login', user)
      this.token = token
      this.user = user
      localStorage.setItem('auth', JSON.stringify(token))
      //localStorage.setItem('user', JSON.stringify(user))
    },

    async logout() {
      if (!this.token) {
        return
      }

      // Destroy session
      try {
        const res = await userApi.delete('/session/revoke?token=' + this.token)
        console.log(res.data)
      } catch (err) {
        console.error(err)
      }

      // Remove localstorage
      localStorage.removeItem('auth')
      //localStorage.removeItem('user')

      // Set variables
      this.token = null
      this.user = null
    },

    async loadSession() {
      //console.log('Loading session')
      const savedToken = JSON.parse(localStorage.getItem('auth'))
      //const savedUser = JSON.parse(localStorage.getItem('user'))
      //console.log('auth', saved)
      if (!savedToken) {
        return
      }
      this.token = savedToken
      //this.user = savedUser

      // Load session from server
      this.loading = true
      try {
        const res = await userApi.get('/session/info?token=' + this.token)
        this.user = res.data
        //localStorage.setItem('auth', JSON.stringify({ token, user }))
        //console.log('Loaded user data', this.user)
      } catch (err) {
        // 502: Backend not online
        if (err.status !== 502) {
          // Invalidate token
          this.error = err
          this.token = null
          this.user = null
          localStorage.removeItem('auth')
        }
      } finally {
        this.loading = false
      }
      return this.user
    },

    // Permissions
    hasPermission(name) {
      if (!this.user) {
        return false
      }
      if (!this.user.permissions) {
        console.error('User has no permissions')
        return false
      }
      return this.user.permissions.includes(name) || this.user.permissions.includes('*')
    },
    hasAnyPermission(name) {
      if (!this.user) {
        return false
      }
      if (!this.user.permissions) {
        console.error('User has no permissions')
        return false
      }
      return this.user.permissions.some((item) => item.includes(name)) || this.user.permissions.includes('*')
    },
  },

  getters: {
    isLoggedIn: (state) => !!state.token,
  },
})
