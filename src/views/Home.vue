<template>
  <div class="home">
    <div class="hero-section">
      <h1>欢迎来到iBLOG</h1>
      <p>分享你的想法，发现精彩内容</p>
    </div>

    <div class="articles-section">
      <h2>推荐文章</h2>
      <ArticleList ref="articleList" />
    </div>

    <div class="articles-section">
      <h2>最新文章</h2>
      <LatestArticleList ref="latestArticleList" />
    </div>
  </div>
</template>

<script>
import ArticleList from '../components/ArticleList.vue'
import LatestArticleList from '../components/LatestArticleList.vue'

export default {
  name: 'Home',
  components: {
    ArticleList,
    LatestArticleList
  },
  mounted() {
    // 定期检查子组件的加载状态
    this.checkLoadingStatus()
  },
  beforeUnmount() {
    // 组件卸载时清理定时器
    if (this.loadingCheckTimer) {
      clearTimeout(this.loadingCheckTimer)
    }
  },
  methods: {
    checkLoadingStatus() {
      // 如果loading已经隐藏，停止检查
      if (!this.$store.state.globalLoading) {
        return
      }
      
      // 检查两个子组件是否都加载完成
      const articleList = this.$refs.articleList
      const latestArticleList = this.$refs.latestArticleList
      
      if (articleList && latestArticleList) {
        // 如果两个组件都不在loading状态，隐藏全局loading
        if (!articleList.loading && !latestArticleList.loading) {
          // 延迟一点确保DOM已更新
          this.$nextTick(() => {
            setTimeout(() => {
              this.$store.commit('SET_GLOBAL_LOADING', false)
            }, 300)
          })
          return
        }
      }
      
      // 如果还在加载，继续检查（每500ms检查一次）
      this.loadingCheckTimer = setTimeout(() => {
        this.checkLoadingStatus()
      }, 500)
    }
  }
}
</script>

<style scoped>
.hero-section {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero-section p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.articles-section h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 0.5rem;
}
</style>