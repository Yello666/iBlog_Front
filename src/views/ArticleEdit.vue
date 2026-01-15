<template>
  <div class="edit-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>{{ isEditMode ? '编辑文章' : '发布新文章' }}</h1>
    </div>

    <!-- 编辑表单 -->
    <form class="edit-form" @submit.prevent="handleSubmit">
      <!-- 标题输入 -->
      <div class="form-group">
        <input
            type="text"
            v-model="article.title"
            placeholder="请输入文章标题"
            required
            class="title-input"
        >
      </div>

      <!-- 内容编辑器 -->
      <div class="form-group">
        <textarea
            v-model="article.content"
            placeholder="请输入文章内容..."
            required
            class="content-editor"
            rows="15"
        ></textarea>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button type="button" @click="handleCancel" class="btn cancel-btn">取消</button>
        <button type="submit" class="btn submit-btn" :disabled="isSubmitting">
          <span v-if="!isSubmitting">{{ isEditMode ? '更新文章' : '发布文章' }}</span>
          <span v-else>提交中...</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { articleAPI } from '../api/article.js'
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'ArticleEdit',
  setup() {
    // 路由和状态管理
    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    // 状态变量
    const isSubmitting = ref(false)
    // const isEditMode = ref(!!route.params.aid) // 通过路由参数判断是否为编辑模式
    const isEditMode = ref(!!route.query.aid) // 改为查询参数
    const article = ref({
      uid: store.state.user?.uid || '', // 从Vuex获取当前用户ID
      title: '',
      content: ''
    })

    // 初始化：编辑模式下加载文章数据
    onMounted(async () => {
      // 页面加载完成后，关闭全局加载动画
      store.commit('SET_GLOBAL_LOADING', false)
      if (isEditMode.value) {
        try {
          const aid = route.query.aid
          const uid = store.state.user?.uid
          const response = await articleAPI.getArticle(aid, uid)//原来的文章

          // 填充文章数据
          article.value = {
            uid: uid,
            title: response.data.title,
            content: response.data.content
          }
        } catch (error) {
          console.error('加载文章失败:', error)
          alert('加载文章失败，请重试')
          router.back()
        }
      }
    })

    // 提交处理
    const handleSubmit = async () => {
      // 简单验证
      if (!article.value.title.trim()) {
        return alert('请输入文章标题')
      }
      if (!article.value.content.trim()) {
        return alert('请输入文章内容')
      }

      isSubmitting.value = true
      try {
        if (isEditMode.value) {
          // 更新文章
          await articleAPI.updateArticle(route.params.aid, article.value)
          alert('文章更新成功')
        } else {
          // 创建新文章
          await articleAPI.createArticle(article.value)
          alert('文章发布成功')
        }
        //router.push('/my-articles') // 提交后跳转到个人文章列表
        router.push('/') //先跳转到根目录
      } catch (error) {
        console.error('提交失败:', error)
        alert('操作失败，请重试')
      } finally {
        isSubmitting.value = false
      }
    }

    // 取消操作
    const handleCancel = () => {
      if (confirm('确定要取消吗？未保存的内容将丢失')) {
        router.back()
      }
    }

    return {
      article,
      isSubmitting,
      isEditMode,
      handleSubmit,
      handleCancel
    }
  }
}
</script>

<style scoped>
.edit-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.page-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  width: 100%;
}

.title-input {
  width: 100%;
  padding: 12px 15px;
  font-size: 18px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.title-input:focus {
  border-color: #42b983;
  outline: none;
}

.content-editor {
  width: 100%;
  padding: 15px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.6;
  transition: border-color 0.3s;
}

.content-editor:focus {
  border-color: #42b983;
  outline: none;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 10px;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #333;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.submit-btn {
  background-color: #42b983;
  color: white;
}

.submit-btn:hover {
  background-color: #359e6d;
}

.submit-btn:disabled {
  background-color: #95d4b3;
  cursor: not-allowed;
}
</style>
