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
          作者: {{ article.userName }} |
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

export default {
  name: 'ArticleList',
  data() {
    return {
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
        // 获取3篇热点文章
        const articlesList=await this.getHotArticles(this.hotArticleNum);
        this.articles = articlesList;
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
    async getHotArticles(num) {
      try {
        const result = await articleAPI.getHotArticles(num);
        if (result.code === 200) {
          return result.data.data;
        } else {
          this.error = result.message || '获取热门文章失败';
          return []
        }
      }catch (error){
        console.error('API调用失败:', error)
        this.error = '网络错误，请检查连接'
        return []
      }

    }

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