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
          发布时间: {{ formatDate(article.createTime) }} |
          点赞: {{ article.likes }} |
          收藏: {{ article.favors }}
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
      hasMore: true
    }
  },
  async mounted() {
    await this.loadArticles()
  },
  methods: {
    async loadArticles() {
      this.loading = true
      try {
        // 这里需要根据实际情况调整，可能需要一个获取所有文章的接口
        // 暂时使用空数组
        this.articles = []
      } catch (error) {
        console.error('加载文章失败:', error)
      } finally {
        this.loading = false
      }
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('zh-CN')
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