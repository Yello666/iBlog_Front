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
    async getArticle(aid) {
        const response= await api.get(`/article/${aid}`)
        return response.data
    },

    // 获取用户文章列表
    getUserArticles(uid, page = 1, size = 10) {
        return api.get(`/article/user/${uid}`, {
            params: { page, size }
        })
    },

    // 更新文章
    updateArticle(aid, article) {
        return api.put('/article', article, {
            params: { aid }
        })
    },

    // 删除文章
    deleteArticle(aid, uid) {
        return api.delete('/article', {
            params: { aid, uid }
        })
    },

    // 管理员删除文章
    adminDeleteArticle(aid) {
        return api.delete('/admin/article', {
            params: { aid }
        })
    },

    // 点赞文章
    async likeArticle(aid, uid) {
        const response=await api.post('/article/like', null, {
            params: { aid, uid }
        })
        return response.data
    },

    // 取消点赞
    async undoLikeArticle(aid, uid) {
        const response=await api.post('/article/undoLike', null, {
            params: { aid, uid }
        })
        return response.data
    },

    // 收藏文章
    async favorArticle(aid, uid) {
        const response=await api.post('/article/favor', null, {
            params: { aid, uid }
        })
        return response.data
    },

    // 取消收藏
    async undoFavorArticle(aid, uid) {
        const response=await api.post('/article/undoFavor', null, {
            params: { aid, uid }
        })
        return response.data
    }
}