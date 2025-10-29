import api from './auth'

export const userAPI = {
    // 获取用户信息
    async getUser(uid) {
        const response= await api.get(`/user/${uid}`);
        return response.data;
    },

    // 更新用户信息
    async updateUser(user) {
        const response= await api.put('/user', user);
        return response.data;
    },

    // 修改密码
    async updatePassword(updatePswRequest) {
        const response= await api.put('/user/psw', updatePswRequest);
        return response.data;
    },

    // 注销账号
    async deleteUser() {
        const response= await api.delete('/user');
        return response.data;
    },

    // 管理员删除用户
    async adminDeleteUser(uid) {
        const response= await api.delete('/admin', { params: { uid } });
        return response.data;
    }
}