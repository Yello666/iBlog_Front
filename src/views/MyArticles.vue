<template>
  <div class="my-articles-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>我的文章列表</h2>
    </div>

    <!-- 文章列表 -->
    <div class="articles-list">
      <div v-for="article in articleList" :key="article.aid" class="article-card">
        <div class="article-title">{{ article.title }}</div>
        <div class="article-meta">
          <span>发布时间：{{ formatTime(article.createdAt) }}</span>
          <span>更新时间：{{ formatTime(article.updatedAt) }}</span>
        </div>
        <div class="article-content">
          {{ article.content }}
          <!-- 超过200字时显示省略号（后端已截取，这里做兜底） -->
          <span v-if="article.content.length >= 200">...</span>
        </div>
        <div class="article-stats">
          <span class="stat-item">👍 点赞 {{ article.likesCount }}</span>
          <span class="stat-item">⭐ 收藏 {{ article.favorCount }}</span>
          <span class="stat-item">💬 评论 {{ article.commentsCount }}</span>
        </div>
        <div class="article-actions">
          <button class="btn edit-btn">编辑</button>
          <button class="btn delete-btn">删除</button>
        </div>
      </div>
    </div>

    <!-- 加载状态提示 -->
    <div class="loading-status" v-if="isLoading">
      <span>加载中...</span>
    </div>

    <!-- 无数据提示 -->
    <div class="empty-tip" v-if="articleList.length === 0 && !isLoading">
      <p>暂无发布的文章</p>
      <button class="btn publish-btn" @click="goToPublish">去发布第一篇文章</button>
    </div>

    <!-- 到底提示 -->
    <div class="end-tip" v-if="!hasMore && articleList.length > 0 && !isLoading">
      <p>已经到底啦～</p>
    </div>
  </div>
</template>

<script>
import {articleAPI} from '@/api/article.js' // 导入你的接口请求函数,原来是命名导出，就是导出来的东西是一个对象，需要使用{}来解构。

export default {
  name: 'MyArticles',
  data() {
    return {
      articleList: [], // 文章列表数据
      currentPage: 1, // 当前页码（从1开始，与接口一致）
      pageSize: 10, // 每页条数
      total: 0, // 总文章数
      isLoading: false, // 加载状态
      hasMore: true, // 是否还有更多数据
      uid: '' // 当前用户ID（从路由参数获取）
    }
  },
  created() {
    // 从路由参数中获取uid
    this.uid = this.$route.params.uid
    // 初始化加载第一页数据
    this.fetchArticles()
    // 监听滚动事件，实现下拉加载
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeDestroy() {
    // 移除滚动监听，避免内存泄漏
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    // 格式化时间（将ISO格式转为本地时间）
    formatTime(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      return date.toLocaleString() // 格式：2025/10/29 13:30:33（可自定义格式）
    },

    // 请求文章数据
    async fetchArticles() {
      if (this.isLoading || !this.hasMore) return
      this.isLoading = true

      try {
        const res = await articleAPI.getUserArticles(this.uid, this.currentPage, this.pageSize)
        const { records, total, pages } = res.data

        // 拼接新数据（避免覆盖已有数据）
        this.articleList = [...this.articleList, ...records]
        this.total = total

        // 判断是否还有更多数据（当前页码 >= 总页数则无更多）
        this.hasMore = this.currentPage < pages

        // 页码自增，为下一次加载做准备
        this.currentPage++
      } catch (error) {
        console.error('加载文章失败：', error)
        this.$message.error('文章加载失败，请重试')
      } finally {
        this.isLoading = false
      }
    },

    // 滚动监听：判断是否触底
    handleScroll() {
      // 窗口高度 + 滚动距离 >= 文档总高度 - 100px（预留100px提前加载）
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const windowHeight = document.documentElement.clientHeight || window.innerHeight
      const documentHeight = document.documentElement.scrollHeight || document.body.scrollHeight

      if (scrollTop + windowHeight >= documentHeight - 100 && !this.isLoading && this.hasMore) {
        this.fetchArticles()
      }
    },

    // 跳转到发布文章页面（需自行创建发布页面）
    goToPublish() {
      this.$router.push('/article/publish')
    }
  }
}
</script>

<style scoped>
.my-articles-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.articles-list {
  display: grid;
  gap: 20px;
}

.article-card {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: box-shadow 0.3s;
}

.article-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.article-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.article-content {
  font-size: 15px;
  color: #444;
  line-height: 1.6;
  margin-bottom: 15px;
  word-break: break-all;
}

.article-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.edit-btn {
  background-color: #42b983;
  color: white;
}

.edit-btn:hover {
  background-color: #359469;
}

.delete-btn {
  background-color: #f56c6c;
  color: white;
}

.delete-btn:hover {
  background-color: #e04a4a;
}

.publish-btn {
  background-color: #2196f3;
  color: white;
  margin-top: 10px;
}

.publish-btn:hover {
  background-color: #1976d2;
}

.loading-status, .empty-tip, .end-tip {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
}

.empty-tip p {
  margin-bottom: 10px;
}
</style>
