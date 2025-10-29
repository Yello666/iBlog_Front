<template>
  <div class="home">
    <div class="hero-section">
      <h1>欢迎来到iBLOG</h1>
      <p>分享你的想法，发现精彩内容</p>
    </div>

    <div class="articles-section">
      <h2>推荐文章</h2>
      <ArticleList />
    </div>
  </div>
</template>

<script>
import ArticleList from '../components/ArticleList.vue'

export default {
  name: 'Home',
  components: {
    ArticleList
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