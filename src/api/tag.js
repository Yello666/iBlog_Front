import api from './auth'

export const tagAPI = {
    // 创建标签
    createTag(tagName) {
        return api.post('/tags', null, {
            params: { tagName }
        })
    },

    // 获取标签
    getTag(tagName) {
        return api.get('/tags', { params: { tagName } })
    },

    // 添加标签到文章
    addTagsToArticle(tags, aid) {
        return api.post('/tags/article', { tags, aid })
    },

    // 获取文章标签
    getArticleTags(aid) {
        return api.get('/tags/article', { params: { aid } })
    },

    // 从文章移除标签
    removeTagsFromArticle(tags, aid) {
        return api.delete('/tags/article', { data: { tags, aid } })
    }
}