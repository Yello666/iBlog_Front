// Vuex Store 核心配置文件，作用是集中管理整个应用的共享状态（比如用户登录状态、Token、用户信息），
// 并提供统一的方法来修改和获取这些状态。
//vuex是vue项目的全局状态管理库，它就像一个"全局变量仓库"，用来集中管理所有组件共享的数据。
//在没有 Vuex 时：
//     组件之间传递数据很麻烦（特别是sibling组件）
//     数据流不清晰，难以追踪状态变化
//     多个组件修改同一数据时容易混乱
//有了vuex后，所有组件都从这个"中央仓库"读写数据，方便管理。
//为什么叫vuex？vuex=vue+flux，flux是facebook推出的前端框架，vuex借鉴了然后应用到vue框架上
import { createStore } from 'vuex'
import {authAPI} from "@/api/auth.js";
import {userAPI} from "@/api/user.js"; //引入创建仓库的函数
export default createStore({
    state: { // 数据仓库（相当于 data）
        user: JSON.parse(localStorage.getItem('user')) || null,  // 存储当前登录用户的详细信息（如用户名、角色）
        token: localStorage.getItem('token') || null,// 存储用户登录凭证（Token）
        // 从本地存储读取 Token，实现"刷新页面后保持登录状态"
        isAuthenticated: !!localStorage.getItem('token'),
        // 判断用户是否登录：Token 存在则为 true（已登录），否则为 false（未登录）
        //！！是强制将返回值转换为bool值的快速写法。
        globalLoading: false // 全局加载状态，用于路由切换时的加载提示
    },
    // 修改 state 的 “唯一途径”Vuex 规定：不能直接在组件中修改 state，必须通过 mutations 来修改。
    // mutations 是同步方法，负责更新 state 的数据，确保状态修改可追踪。
    mutations: {
        //将后端返回的用户信息（user）存入 state.user
        //存储的uid是字符串
        SET_USER(state, user) {
            state.user = user
            if (user) {
                localStorage.setItem('user', JSON.stringify(user))
            } else {
                localStorage.removeItem('user')
            }
        },
        // 存储 Token 到 state.token；
        SET_TOKEN(state, token) {
            state.token = token
            state.isAuthenticated = !!token//更新登录状态 isAuthenticated；
            if (token) {//将 Token 存入本地存储（localStorage），避免刷新后丢失
                localStorage.setItem('token', token)
            } else {
                localStorage.removeItem('token')
                localStorage.removeItem('user')  // ✅ 清理用户信息
            }
        },
        //退出登录操作：
        LOGOUT(state) {
            state.user = null//清空 state 中的用户信息、Token、登录状态
            state.token = null
            state.isAuthenticated = false
            localStorage.removeItem('token')//删除本地存储的 Token，实现 "退出登录"
            localStorage.removeItem('user')  // ✅ 退出时清理
        },
        // 设置全局加载状态
        SET_GLOBAL_LOADING(state, loading) {
            state.globalLoading = loading
        }
    },
//actions 主要用于处理异步操作（比如调用后端接口）
// 它不能直接修改 state，而是通过调用 commit('mutation方法名') 来触发 mutations，间接修改 state。
    actions: {
        //用户登陆，commit 是个函数action的每一个函数都要有commit传进来
        //除了commit参数，其它参数都是通过views下面的.vue文件的dispatch传递过来的，如果那里传进来一个对象列表，那么{}就可以直接获取里面的对象
        //如果那里直接传入了对象，就不需要{}就可以直接获取对象。
        async login({ commit }, { loginInfo }) {//接收组件传递的登录信息（loginInfo）
            try {
                const response = await authAPI.login(loginInfo)
                //调用 authAPI.login 接口向后端发起登录请求；会调用auth.js
                if (response.code===200) {
                    const { token, user } = response.data
                    // 登录成功后，调用 commit 触发 mutations里面的SET_TOKEN
                    // 关键修复：将 uid 转为字符串（无论后端返回的是数字还是字符串）
                    console.log("user object:",user)
                    if (user?.uid) {
                        user.uid = user.uid.toString()
                        console.log("user id:",user.uid)
                    }
                    commit('SET_TOKEN', token)
                    commit('SET_USER', user)
                    return { code: 200 }
                }
                return { code: response.code, message: response.message }
            } catch (error) {
                return { code: -1, message: error.response?.message || '登录失败' }
            }
        },
        //用户注册
        async register({ commit }, user) {
            try {
                const response = await authAPI.register(user)
                return { code: response.code, message: response.message }
            } catch (error) {
                return { code: -1, message: error.response?.data?.message || '注册失败' }
            }
        },
        //退出登录
        logout({ commit }) {
            commit('LOGOUT')
        },
        //获取用户信息
        async fetchUser({ commit }, uid) {
            try {
                const response = await userAPI.getUser(uid)
                if (response.code===200) {
                    commit('SET_USER', response.data.user)
                }
            } catch (error) {
                console.error('获取用户信息失败:', error)
            }
        }
    },
    //获取store里面的值
    getters: {
        currentUser: state => state.user,
        isAuthenticated: state => state.isAuthenticated,
        isAdmin: state => state.user?.role === 'ADMIN'
    }
})