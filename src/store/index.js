import { createStore } from 'vuex'

export default createStore({
    state: {
        user: null,
        token: localStorage.getItem('token') || null,
        isAuthenticated: !!localStorage.getItem('token')
    },

    mutations: {
        SET_USER(state, user) {
            state.user = user
        },

        SET_TOKEN(state, token) {
            state.token = token
            state.isAuthenticated = !!token
            if (token) {
                localStorage.setItem('token', token)
            } else {
                localStorage.removeItem('token')
            }
        },

        LOGOUT(state) {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            localStorage.removeItem('token')
        }
    },

    actions: {
        async login({ commit }, { loginInfo }) {
            try {
                const response = await authAPI.login(loginInfo)
                if (response.data.success) {
                    const { token, user } = response.data.data
                    commit('SET_TOKEN', token)
                    commit('SET_USER', user)
                    return { success: true }
                }
                return { success: false, message: response.data.message }
            } catch (error) {
                return { success: false, message: error.response?.data?.message || '登录失败' }
            }
        },

        async register({ commit }, user) {
            try {
                const response = await authAPI.register(user)
                return { success: response.data.success, message: response.data.message }
            } catch (error) {
                return { success: false, message: error.response?.data?.message || '注册失败' }
            }
        },

        logout({ commit }) {
            commit('LOGOUT')
        },

        async fetchUser({ commit }, uid) {
            try {
                const response = await userAPI.getUser(uid)
                if (response.data.success) {
                    commit('SET_USER', response.data.data)
                }
            } catch (error) {
                console.error('获取用户信息失败:', error)
            }
        }
    },

    getters: {
        currentUser: state => state.user,
        isAuthenticated: state => state.isAuthenticated,
        isAdmin: state => state.user?.role === 'ADMIN'
    }
})