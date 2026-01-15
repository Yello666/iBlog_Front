<template>
  <div class="article-list">
    <ArticleSkeleton v-if="loading" :count="hotArticleNum" :show-tags="true" />

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
import ArticleSkeleton from './ArticleSkeleton.vue';

export default {
  name: 'ArticleList',
  components: {
    ArticleSkeleton
  },
  data() {
    return {
      authorMap: {}, // 存储 uid -> userName 的映射（关键！）
      articles: [],

      loading: false,
      page: 1,
      size: 10,
      hasMore: true,
      hotArticleNum:5,// 获取3篇热点文章

      error:''
    }
  },
  // 新增：每次组件激活（如从其他页面返回）时重新加载数据
  activated() {
    this.loadArticles() // 重新获取最新数据
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
        // console.log(articlesList)
        // 2. 提取所有不重复的 uid（避免重复请求）提取的uid是字符串
        const uids = [...new Set(articlesList.map(article => article.uid))]
        // console.log(uids)
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
    },


  }
}
</script>

<style scoped>
.no-articles {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.article-tags {
  margin-top: 1rem;
}

.article-title:hover{
  color: #559af4;
}
</style>