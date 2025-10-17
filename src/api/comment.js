import api from './auth'

export const commentAPI = {
    // 发布评论
    publishComment(comment) {
        return api.post('/comments', comment)
    },

    // 获取评论
    getComment(cid) {
        return api.get('/comments', { params: { cid } })
    },

    // 删除评论
    deleteComment(cid, uid) {
        return api.delete('/comments', {
            params: { cid, uid }
        })
    },

    // 管理员删除评论
    adminDeleteComment(cid, uid) {
        return api.delete('/admin/comments', {
            params: { cid, uid }
        })
    },

    // 回复评论
    replyComment(cid, reply) {
        return api.post('/comments/reply', reply, {
            params: { cid }
        })
    },

    // 获取文章评论
    getArticleComments(aid, page = 1, size = 10) {
        return api.get('/comments/article', {
            params: { aid, page, size }
        })
    },

    // 获取评论回复
    getReplies(cid) {
        return api.get('/comments/replies', {
            params: { cid }
        })
    },

    // 点赞评论
    likeComment(cid) {
        return api.post('/comments/like', null, {
            params: { cid }
        })
    },

    // 取消点赞评论
    unlikeComment(cid) {
        return api.post('/comments/unlike', null, {
            params: { cid }
        })
    }
}