<template>
  <div class="article-detail">

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 文章内容 -->
    <div v-else-if="article" class="article-content">
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

      <div class="article-body" v-html="article.content"></div>

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
    <!-- 错误状态 -->
    <div v-else class="error">文章加载失败</div>
  </div>
</template>

<script>
// 引入 Vue 核心API和路由、接口
import {ref, onMounted, computed} from 'vue'
import { useRoute } from 'vue-router'
import { articleAPI } from '@/api/article'
import CommentSection from '../components/CommentList.vue'
import {useStore} from "vuex";

export default {
  components: { CommentSection }, // 注册评论区组件
  setup() {
    // 状态管理
    const loading = ref(true)//ref 返回的是一个响应式对象，即{loading:true}，loading.value才是true
    let article = ref(null)

    const route = useRoute()
    const store = useStore()
    const currentUser = computed(() => store.getters.currentUser)
    const currentUid = computed(() => currentUser.value?.uid) //currentUser.value存在的话，就获取其uid
    console.log("uid:{}",currentUid.value)
    console.log("uid type:",typeof currentUid.value)
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
      } catch (error) {
        console.error('加载文章失败:', error)
        article.value = null
      } finally {
        loading.value = false
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
      handleFavorite
    }
  }
}
</script>

<style scoped>
/* 样式部分完全不变，保留原逻辑 */
.article-detail {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.article-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
  top: 150px;
  right: 300px;
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

</style>
