import axios from 'axios'

// const API_BASE = '/api' 本地开发
const API_BASE='https://yellow-iblog.cn' //生产环境


const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    },
    // 关键：修改 axios 的默认 JSON 解析器，在解析阶段就处理大整数
    transformResponse: [function (data) {
        // 自定义 JSON 解析，确保 uid 为字符串
        const reviver = (key, value) => {
            // 只要字段是 uid，无论是否超过安全整数，都强制转为字符串
            if (key === 'uid') {
                return String(value); // 直接转为字符串，避免 Number 中间转换
            }
            return value;
        };

        try {
            // 先将原始数据解析为 JSON，使用 reviver 处理 uid
            return JSON.parse(data, reviver);
        } catch (e) {
            // 如果解析失败（非 JSON 数据），直接返回原始数据
            return data;
        }
    }]
})

// 工具函数：递归处理大整数ID，转为字符串
// const convertBigIntFields = (data) => {
//     // 如果是数组，递归处理每个元素
//     if (Array.isArray(data)) {
//         return data.map(item => convertBigIntFields(item))
//     }
//     // 如果是对象，遍历所有字段
//     if (data && typeof data === 'object') {
//         const result = {...data}
//         // 处理需要转换的字段（可根据实际需求添加更多字段）
//         const fieldsToConvert = ['uid']
//         fieldsToConvert.forEach(field => {
//             // 仅当字段存在且为数字类型时转换
//             if (result.hasOwnProperty(field) && (typeof result[field] === 'number'||typeof result[field] === 'bigint')) {
//                 // 检查是否超过安全整数范围（2^53）
//                 if (Math.abs(result[field]) > Number.MAX_SAFE_INTEGER) {
//                     result[field] = result[field].toString()
//                 }
//             }
//         })
//         // 递归处理嵌套对象
//         Object.keys(result).forEach(key => {
//             if (typeof result[key] === 'object' && result[key] !== null) {
//                 result[key] = convertBigIntFields(result[key])
//             }
//         })
//         return result
//     }
// }

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
        // if(response.data){
        //     response.data=convertBigIntFields(response.data)
        // }
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
    async register(user) {
        const responseObj=await api.post('/auth/register', user)
        let response=responseObj.data;
        // response.data.uid=response.data.uid.toString()
        console.log("register response.data.uid:",response.data.uid)
        return response;
    },

    // 用户登录
    async login(loginInfo) {
        const responseObj= await api.post('/auth/login', loginInfo)
        let response=responseObj.data;
        // response.data.user.uid=response.data.user.uid.toString()
        console.log("login response.data.uid:",response.data.uid)
        return response;
    }
}

export default api