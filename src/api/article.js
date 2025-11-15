import api from './auth'


export const articleAPI = {
    // 创建文章
    async createArticle(article) {
        const response= await api.post('/article', article)
        return response.data
    },
    //获取热点文章,处理异步并返回解析后的数据,否则
    async getHotArticles(num){
        //在这里提前做response的解析，在vue组件用到函数的时候，就不用把response.data作为响应体了
        const response= await api.get('/article/hot',{
            params:{num}
        })
        return response.data
    },
    // 获取文章详情
    async getArticle(aid,uid) {
        const response= await api.get(`/article/${aid}`,{
            params:{uid}
        })

        return response.data
    },

    // 获取用户文章列表
    async getUserArticles(uid, page = 1, size = 10) {
        const response= await api.get(`/article/user/${uid}`, {
            params: { page, size }
        })
        return response.data
    },

    // 更新文章
    async updateArticle(aid, article) {
        const response= await api.put('/article', article, {
            params: { aid }
        })
        return response.data
    },

    // 删除文章
    async deleteArticle(aid, uid) {
    const response= await api.delete('/article', {
            params: { aid, uid }
        })
        return response.data
    },

    // 管理员删除文章
    async adminDeleteArticle(aid) {
    const response= await api.delete('/admin/article', {
            params: { aid }
        })
        return response.data
    },

    // 点赞文章
    async likeArticle(aid) {
        const response=await api.post('/article/like', null, {
            params: { aid}
        })
        return response.data
    },

    // // 取消点赞
    // async undoLikeArticle(aid, uid) {
    //     const response=await api.post('/article/undoLike', null, {
    //         params: { aid, uid }
    //     })
    //     return response.data
    // },

    // 收藏文章
    async favorArticle(aid) {
        const response=await api.post('/article/favor', null, {
            params: { aid}
        })
        return response.data
    },

    // // 取消收藏
    // async undoFavorArticle(aid, uid) {
    //     const response=await api.post('/article/undoFavor', null, {
    //         params: { aid, uid }
    //     })
    //     return response.data
    // }
}