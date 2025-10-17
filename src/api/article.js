import api from './auth'

export const articleAPI = {
    // 创建文章
    createArticle(article) {
        return api.post('/article', article)
    },

    // 获取文章详情
    getArticle(aid) {
        return api.get(`/article/${aid}`)
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
    likeArticle(aid, uid) {
        return api.post('/article/like', null, {
            params: { aid, uid }
        })
    },

    // 取消点赞
    undoLikeArticle(aid, uid) {
        return api.post('/article/undoLike', null, {
            params: { aid, uid }
        })
    },

    // 收藏文章
    favorArticle(aid, uid) {
        return api.post('/article/favor', null, {
            params: { aid, uid }
        })
    },

    // 取消收藏
    undoFavorArticle(aid, uid) {
        return api.post('/article/undoFavor', null, {
            params: { aid, uid }
        })
    }
}