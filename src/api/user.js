import api from './auth'

export const userAPI = {
    // 获取用户信息
    getUser(uid) {
        return api.get(`/user/${uid}`)
    },

    // 更新用户信息
    updateUser(user) {
        return api.put('/user', user)
    },

    // 修改密码
    updatePassword(updatePswRequest) {
        return api.put('/user/psw', updatePswRequest)
    },

    // 注销账号
    deleteUser() {
        return api.delete('/user')
    },

    // 管理员删除用户
    adminDeleteUser(uid) {
        return api.delete('/admin', { params: { uid } })
    }
}