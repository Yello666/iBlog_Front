import axios from 'axios'

const API_BASE = '/api'

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器，自动添加token
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器，处理token过期
api.interceptors.response.use(
    response => {
        return response
    },
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export const authAPI = {
    // 用户注册
    register(user) {
        return api.post('/auth/register', user)
    },

    // 用户登录
    login(loginInfo) {
        return api.post('/auth/login', loginInfo)
    }
}

export default api