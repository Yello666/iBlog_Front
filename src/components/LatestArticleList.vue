<template>
  <div class="article-list">
    <ArticleSkeleton v-if="loading" :count="latestArticleNum" :show-tags="false" />

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
          {{ article.content ? article.content.substring(0, 200) + '...' : '暂无内容' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { articleAPI } from '../api/article'
import {userAPI} from "@/api/user.js";
import ArticleSkeleton from './ArticleSkeleton.vue';

export default {
  name: 'LatestArticleList',
  components: {
    ArticleSkeleton
  },
  data() {
    return {
      authorMap: {},
      articles: [],
      loading: false,
      latestArticleNum: 3, // 获取3篇最新文章
      error: ''
    }
  },
  activated() {
    this.loadArticles()
  },
  async mounted() {
    await this.loadArticles()
  },
  methods: {
    async loadArticles() {
      this.error = ''
      this.loading = true
      try {
        // 获取最新文章列表
        const articlesList = await this.fetchLatestArticles(this.latestArticleNum)
        this.articles = articlesList

        // 提取所有不重复的 uid
        const uids = [...new Set(articlesList.map(article => article.uid))]
        if (uids.length === 0) return

        // 批量获取用户信息
        this.authorMap = await this.getAuthorMap(uids)
      } catch (error) {
        console.error('加载最新文章失败:', error)
        this.error = '加载文章失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    async fetchLatestArticles(num) {
      try {
        const response = await articleAPI.getLatestArticles(num);

        if (response.code === 200) {
          return response.data;
        } else {
          this.error = response.message || '获取最新文章失败';
          return []
        }
      } catch (error) {
        console.error('API调用失败:', error)
        this.error = '网络错误，请检查连接'
        return []
      }
    },

    async getAuthorMap(uids) {
      // 使用 Promise.all 并行请求所有用户信息，大幅减少总等待时间
      const promises = uids.map(async (uid) => {
        try {
          const response = await userAPI.getUser(uid)
          if (response.code === 200) {
            return { uid, userName: response.data.userName }
          } else {
            return { uid, userName: '未知用户' }
          }
        } catch (error) {
          console.error(`获取 uid=${uid} 的用户信息失败:`, error)
          return { uid, userName: '获取失败' }
        }
      })
      
      // 等待所有请求完成
      const results = await Promise.all(promises)
      
      // 将结果转换为 authorMap 对象
      const authorMap = {}
      results.forEach(({ uid, userName }) => {
        authorMap[uid] = userName
      })
      
      return authorMap
    }
  }
}
</script>

<style scoped>
.no-articles {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.article-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.article-card:hover {
  transform: translateY(-5px);
}

.article-title {
  font-size: 1.4rem;
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  display: block;
  margin-bottom: 0.8rem;
}

.article-title:hover {
  color: #3498db;
}

.article-meta {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 1rem;
}

.article-content {
  color: #34495e;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.article-tags {
  margin-top: 1rem;
}

.tag {
  display: inline-block;
  background: #ecf0f1;
  color: #7f8c8d;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-right: 0.5rem;
}
</style>
