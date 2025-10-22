// Vuex Store 核心配置文件，作用是集中管理整个应用的共享状态（比如用户登录状态、Token、用户信息），
// 并提供统一的方法来修改和获取这些状态。
//vuex是vue项目的全局状态管理库，它就像一个"全局变量仓库"，用来集中管理所有组件共享的数据。
//在没有 Vuex 时：
//     组件之间传递数据很麻烦（特别是sibling组件）
//     数据流不清晰，难以追踪状态变化
//     多个组件修改同一数据时容易混乱
//有了vuex后，所有组件都从这个"中央仓库"读写数据，方便管理。
//为什么叫vuex？vuex=vue+flux，flux是facebook推出的前端框架，vuex借鉴了然后应用到vue框架上
import { createStore } from 'vuex' //引入创建仓库的函数
export default createStore({
    state: { // 数据仓库（相当于 data）
        user: null,// 存储当前登录用户的详细信息（如用户名、角色）
        token: localStorage.getItem('token') || null,// 存储用户登录凭证（Token）
        // 从本地存储读取 Token，实现“刷新页面后保持登录状态”
        isAuthenticated: !!localStorage.getItem('token')
        // 判断用户是否登录：Token 存在则为 true（已登录），否则为 false（未登录）
        //！！是强制将返回值转换为bool值的快速写法。
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