<template>
  <div class="article-detail">

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 文章内容 -->
    <div v-else-if="article" class="detail-container" :class="{ 'no-sidebar': toc.length === 0 }">
      <!-- 侧边栏目录 -->
      <aside class="sidebar" v-if="toc.length > 0">
        <div class="toc-content">
          <h3>目录</h3>
          <ul class="toc-list">
            <li v-for="item in toc" 
                :key="item.id" 
                :class="['toc-item', `toc-level-${item.level}`]"
                @click="scrollToHeading(item.id)">
              {{ item.title }}
            </li>
          </ul>
        </div>
      </aside>

      <div class="article-content">
        <!-- 返回首页按钮 -->
        <div class="back-button" @click="$router.push('/')">
          <span class="arrow-left"></span>
          <span class="back-text">返回</span>
        </div>
        <h1>{{ article.title }}</h1>

        <div class="article-meta">
          <span>创作时间: {{ formatDate(article.createdAt) }}</span>
          <span>修改时间: {{ formatDate(article.updatedAt) }}</span>
        </div>

        <div class="article-body" v-html="renderedHtml"></div>

        <!-- 点赞收藏区域（左下角） -->
        <div class="article-actions">
          <button
              class="action-btn"
              @click="handleLike"
              :class="{ liked: article.isLiked }"
          >
            <i class="like-icon">{{ article.isLiked ? '❤️' : '♡' }}</i>
            <span>{{ article.likesCount || 0 }}</span>
          </button>

          <button
              class="action-btn"
              @click="handleFavorite"
              :class="{ favored: article.isFavored }"
          >
            <i class="favor-icon">{{ article.isFavored ? '★' : '☆' }}</i>
            <span>{{ article.favorCount || 0 }}</span>
          </button>
        </div>

        <!-- 评论区组件 -->
        <CommentSection
            v-if="currentUid"
            :aid="article.aid"
            :current-uid="currentUid"
        />
      </div>
    </div>
    <!-- 错误状态 -->
    <div v-else class="error">文章加载失败</div>
  </div>
</template>

<script>
import {ref, onMounted, computed} from 'vue'
import { useRoute } from 'vue-router'
import { articleAPI } from '@/api/article'
import CommentSection from '../components/CommentList.vue'
import {useStore} from "vuex";
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true
})

export default {
  components: { CommentSection }, // 注册评论区组件
  setup() {
    // 状态管理
    const loading = ref(true)//ref 返回的是一个响应式对象，即{loading:true}，loading.value才是true
    let article = ref(null)

    const route = useRoute()
    const store = useStore()
    const currentUser = computed(() => store.getters.currentUser)
    const currentUid = computed(() => currentUser.value?.uid)
    
    const renderedHtml = ref('')
    const toc = ref([])

    const processMarkdown = (content) => {
      if (!content) {
        renderedHtml.value = ''
        toc.value = []
        return
      }
      const tokens = md.parse(content, {})
      const tocData = []

      tokens.forEach((token, index) => {
        if (token.type === 'heading_open') {
          // 获取标题内容（下一个 token 是 inline）
          const inlineToken = tokens[index + 1]
          const title = inlineToken ? inlineToken.content : ''
          const level = parseInt(token.tag.slice(1))
          const slug = `heading-${index}`

          token.attrSet('id', slug)

          tocData.push({
            id: slug,
            title,
            level
          })
        }
      })

      toc.value = tocData
      renderedHtml.value = md.renderer.render(tokens, md.options, {})
    }

    const scrollToHeading = (id) => {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }

    // 格式化日期（去掉参数类型）
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleString()
    }

    // 处理点赞（去掉参数和返回值类型）
    const handleLike = async () => {
      if (!article.value || !currentUid.value){
        alert('请先登录哟～～～')
        return
      }


      try {
        // if (article.value.isLiked) {
        //   article.value.likesCount--
        // } else {
        //   article.value.likesCount++
        // }
        // article.value.isLiked = !article.value.isLiked
        const response=await articleAPI.likeArticle(article.value.aid)
        article.value.isLiked=response.data.status
        article.value.likesCount=response.data.crtLikes
        console.log("isLiked:",article.value.isLiked)
      } catch (error) {
        console.error('点赞失败:', error)
      }
    }

    // 处理收藏
    const handleFavorite = async () => {
      if (!article.value || !currentUid.value) {
        alert("请先登陆哟～～～")
        return
      }
      try {
        // if (article.value.isFavored) {
        //   article.value.favorCount--
        // } else {
        //   article.value.favorCount++
        // }
        // article.value.isFavored = !article.value.isFavored
        const response=await articleAPI.favorArticle(article.value.aid)
        article.value.isFavored=response.data.status
        article.value.favorCount=response.data.crtFavors

      } catch (error) {
        console.error('收藏失败:', error)
      }
    }

    // 加载文章详情（去掉类型声明）
    const loadArticleDetail = async () => {
      try {
        const aid = route.params.aid // 获取aid
        if (!aid){
          console.log("找不到aid")
        }
        console.log("aid:",aid)

        loading.value = true
        const response = await articleAPI.getArticle(aid,currentUid.value)
        article.value = response.data
        console.log(article.value)
        article.value.isLiked = response.data.liked
        article.value.isFavored = response.data.favored
        article.value.likesCount = article.value.likesCount || 0
        article.value.favorCount = article.value.favorCount || 0
        
        processMarkdown(article.value.content)
      } catch (error) {
        console.error('加载文章失败:', error)
        article.value = null
      } finally {
        loading.value = false
        // 数据加载完成后，隐藏全局loading
        setTimeout(() => {
          store.commit('SET_GLOBAL_LOADING', false)
        }, 300)
      }
    }

    // 初始化加载
    onMounted(() => {
      loadArticleDetail()
    })

    // 暴露变量和方法到模板
    return {
      loading,
      article,
      currentUid,
      formatDate,
      handleLike,
      handleFavorite,
      renderedHtml,
      toc,
      scrollToHeading
    }
  }
}
</script>

<style scoped>
/* 样式部分完全不变，保留原逻辑 */
.article-detail {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.detail-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  position: relative;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
}

.toc-content {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.toc-content h3 {
  margin: 0 0 1rem;
  font-size: 1.2rem;
  color: #2c3e50;
  border-bottom: 1px solid #ecf0f1;
  padding-bottom: 0.5rem;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  padding: 6px 0;
  cursor: pointer;
  color: #34495e;
  font-size: 0.95rem;
  line-height: 1.4;
  transition: color 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-item:hover {
  color: #5588f4;
}

.toc-level-1 { font-weight: bold; margin-top: 0.5rem; }
.toc-level-2 { padding-left: 1rem; }
.toc-level-3 { padding-left: 2rem; font-size: 0.9rem; }
.toc-level-4 { padding-left: 3rem; font-size: 0.85rem; }
.toc-level-5, .toc-level-6 { padding-left: 4rem; font-size: 0.85rem; }

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.article-content {
  flex: 1;
  min-width: 0;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1024px) {
  .detail-container {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    position: static;
    margin-bottom: 20px;
  }
  .toc-content {
    max-height: 300px;
  }
}


.article-content h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.article-meta {
  color: #7f8c8d;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ecf0f1;
  display: flex;
  gap: 1.5rem;
}

.article-body {
  line-height: 1.8;
  color: #34495e;
  margin-bottom: 2rem;
  min-height: 300px;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.article-body pre {
  overflow-x: auto;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
  white-space: pre;
}

.article-body code {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.article-actions {
  margin-bottom: 3rem;
  padding: 1rem 0;
  border-top: 1px solid #ecf0f1;
  border-bottom: 1px solid #ecf0f1;
}

.action-btn {
  background: none;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: #34495e;
  border-radius: 4px;
  transition: all 0.2s;
  margin-right: 1rem;
}

.action-btn:hover {
  background-color: #f5f5f5;
}

.action-btn.liked {
  color: #e74c3c;
}

.action-btn.favored {
  color: #f39c12;
}

.like-icon, .favor-icon {
  font-size: 1.2rem;
}
/* 返回首页按钮 */
.back-button {
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #34495e;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.back-button:hover {
  color: #5588f4;
}

.arrow-left {
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 10px solid currentColor;
  margin-right: 10px;
}

/* 文字默认隐藏，hover 时淡入 */
.back-text {
  opacity: 0;
  transform: translateX(-5px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  white-space: nowrap;
}

.back-button:hover .arrow-left {
  transform: translateX(-3px);
  transition:  transform 0.3s ease;
}
.back-button:hover .back-text {
  opacity: 1;
  transform: translateX(0);
}

/* 当没有侧边栏目录时，评论区靠左对齐并填满宽度，避免两边留白过多 */
.detail-container.no-sidebar :deep(.comment-section) {
  margin-left: 0;
  max-width: 100%;
}
</style>
