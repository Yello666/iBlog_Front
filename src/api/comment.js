import api from './auth'

export const commentAPI = {
    // 发布评论
    async publishComment(comment) {
        const response=await api.post('/comments', comment)
        return response.data
    },

    // 获取评论
    async getComment(cid) {
        const response=await api.get('/comments', { params: { cid } })
        return response.data
    },

    // 删除评论
    async deleteComment(cid, uid) {
        const response=await api.delete('/comments', {
            params: { cid, uid }
        })
        return response.data
    },

    // 管理员删除评论
    adminDeleteComment(cid, uid) {
        return api.delete('/admin/comments', {
            params: { cid, uid }
        })
    },

    // 回复评论
    async replyComment(cid, reply) {
        const response=await api.post('/comments/reply', reply, {
            params: { cid }
        })
        return response.data
    },

    // 获取文章评论
    async getArticleComments(aid, page = 1, size = 10) {
        const response=await api.get('/comments/article', {
            params: { aid, page, size }
        })
        return response.data
    },

    // 获取评论回复
    async getReplies(cid) {
        const response=await api.get('/comments/replies', {
            params: { cid }
        })
        return response.data
    },

    // 点赞评论
    async likeComment(cid) {
        const response=await api.post('/comments/like', null, {
            params: { cid }
        })
        return response.data
    },

    // // 取消点赞评论
    // async unlikeComment(cid) {
    //     const response=await api.post('/comments/unlike', null, {
    //         params: { cid }
    //     })
    //     return response.data
    // }
}