<template>
  <div class="article-list">
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="articles.length === 0" class="no-articles">
      暂无文章
    </div>

    <div v-else>
      <div
          v-for="article in articles"
          :key="article.aid"
          class="article-card"
      >
        <router-link
            :to="`/article/${article.aid}`"
            class="article-title"
        >
          {{ article.title }}
        </router-link>

        <div class="article-meta">
          作者: {{ authorMap[article.uid] }} |
          发布时间: {{ formatDate(article.createdAt) }} |
          点赞: {{ article.likesCount }} |
          收藏: {{ article.favorCount }}
        </div>

        <div class="article-content">
          {{ article.content.substring(0, 200) }}...
        </div>

        <div class="article-tags">
          <span
              v-for="tag in article.tags"
              :key="tag.tid"
              class="tag"
          >
            {{ tag.tagName }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { articleAPI } from '../api/article'
import {userAPI} from "@/api/user.js";

export default {
  name: 'ArticleList',
  data() {
    return {
      authorMap: {}, // 存储 uid -> userName 的映射（关键！）
      articles: [],

      loading: false,
      page: 1,
      size: 10,
      hasMore: true,
      hotArticleNum:3,// 获取3篇热点文章

      error:''
    }
  },
  async mounted() {
    await this.loadArticles()
  },
  methods: {
    async loadArticles() {
      this.error = '' // 清空错误信息
      this.loading = true
      try {
        // 1. 获取热点文章列表
        const articlesList = await this.fetchHotArticles(this.hotArticleNum)
        this.articles = articlesList
        console.log(articlesList)
        // 2. 提取所有不重复的 uid（避免重复请求）提取的uid是字符串
        const uids = [...new Set(articlesList.map(article => article.uid))]
        console.log(uids)
        if (uids.length === 0) return

        // 3. 批量获取这些 uid 对应的用户信息，并存入 authorMap
        this.authorMap = await this.getAuthorMap(uids)
      } catch (error) {
        console.error('加载文章失败:', error)
        this.error = '加载文章失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('zh-CN')
    },
    async fetchHotArticles(num) {
      try {
        const response = await articleAPI.getHotArticles(num);

        if (response.code === 200) {
          return response.data;
        } else {
          this.error = response.message || '获取热门文章失败';
          return []
        }
      }catch (error){
        console.error('API调用失败:', error)
        this.error = '网络错误，请检查连接'
        return []
      }

    },
    async getAuthorMap(uids){
      const authorMap = {}
      for (const uid of uids) {
        console.log(uid)
        try {
          // 调用用户 API 获取单个用户信息
          const response = await userAPI.getUser(uid)
          if (response.code === 200) {
            // 接口返回 { data: { uid, userName,....} }
            authorMap[uid] = response.data.userName
          } else {
            authorMap[uid] = '未知用户'
          }
        } catch (error) {
          console.error(`获取 uid=${uid} 的用户信息失败:`, error)
          authorMap[uid] = '获取失败'
        }
      }
      return authorMap
    },


  }
}
</script>

<style scoped>
.loading, .no-articles {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.article-tags {
  margin-top: 1rem;
}
</style>