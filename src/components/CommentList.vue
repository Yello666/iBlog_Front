<template>
  <div class="comment-section">
    <h3>评论区</h3>

    <!-- 发表评论 -->
    <div v-if="currentUid" class="comment-input">
      <textarea
          v-model="newComment.content"
          placeholder="写下你的评论..."
          rows="3"
      ></textarea>
      <button @click="publishComment">发表评论</button>
    </div>

    <div v-else class="login-prompt">
      请先<a href="/login">登录</a>后发表评论
    </div>

    <!-- 评论列表 -->
    <div class="comments-list">
      <div v-for="comment in comments" :key="comment.cid" class="comment-item">
        <div class="comment-header">
          <span class="comment-author">{{ comment.userName || '匿名用户' }}</span>
          <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
        </div>
        <div class="comment-content">{{ comment.content }}</div>
        <div class="comment-actions">
          <button
              class="like-btn"
              @click="likeComment(comment.cid)"
              :class="{ liked: comment.isLiked }"
          >
            {{ comment.isLiked ? '❤️' : '♡' }} {{ comment.likeCount || 0 }}
          </button>
          <button class="reply-btn" @click="replyToComment(comment)">回复</button>

          <!-- 回复输入框 -->
          <div v-if="comment.showReplyInput" class="reply-input">
            <textarea
                v-model="comment.replyContent"
                placeholder="回复..."
                rows="2"
            ></textarea>
            <div class="reply-buttons">
              <button @click="submitReply(comment)">发送</button>
              <button @click="cancelReply(comment)">取消</button>
            </div>
          </div>

          <!-- 回复列表 -->
          <div class="replies" v-if="comment.replies && comment.replies.length">
            <div v-for="reply in comment.replies" :key="reply.rid" class="reply-item">
              <span class="reply-author">{{ reply.userName }}</span>
              <span class="reply-content">{{ reply.content }}</span>
              <span class="reply-time">{{ formatDate(reply.createTime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="totalPages > 1">
      <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
      >
        上一页
      </button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script>
// 引入 Vue API 和评论接口
import { ref, onMounted, defineProps } from 'vue'
import { commentAPI } from '@/api/comment'

export default {
  // 接收父组件传参（JS 用 defineProps 直接定义，无需类型）
  props: defineProps({
    aid: {
      type: Number,
      required: true
    },
    currentUid: {
      type: [Number, null],
      required: true
    }
  }),
  setup(props) {
    // 状态管理（去掉TS类型声明）
    const comments = ref([])
    const newComment = ref({ content: '' })
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalComments = ref(0)
    const totalPages = ref(0)

    // 格式化日期（去掉参数类型）
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleString()
    }

    // 加载评论（去掉参数和返回值类型）
    const loadComments = async () => {
      try {
        const data = await commentAPI.getArticleComments(
            props.aid,
            currentPage.value,
            pageSize.value
        )

        // 处理评论数据，添加回复相关状态
        comments.value = data.comments.map(comment => ({
          ...comment,
          showReplyInput: false,
          replyContent: ''
        }))

        totalComments.value = data.total
        totalPages.value = Math.ceil(totalComments.value / pageSize.value)
      } catch (error) {
        console.error('加载评论失败:', error)
      }
    }

    // 发表评论（去掉类型声明）
    const publishComment = async () => {
      if (!newComment.value.content.trim() || !props.currentUid) return

      try {
        await commentAPI.publishComment({
          aid: props.aid,
          uid: props.currentUid,
          content: newComment.value.content
        })

        // 清空输入框并刷新评论
        newComment.value.content = ''
        currentPage.value = 1
        loadComments()
      } catch (error) {
        console.error('发表评论失败:', error)
      }
    }

    // 评论点赞（去掉类型声明）
    const likeComment = async (cid) => {
      if (!props.currentUid) return

      try {
        const comment = comments.value.find(c => c.cid === cid)
        if (!comment) return

        if (comment.isLiked) {
          await commentAPI.unlikeComment(cid)
          comment.likeCount--
        } else {
          await commentAPI.likeComment(cid)
          comment.likeCount++
        }
        comment.isLiked = !comment.isLiked
      } catch (error) {
        console.error('评论点赞失败:', error)
      }
    }

    // 回复评论相关（去掉类型声明）
    const replyToComment = (comment) => {
      // 关闭其他评论的回复框
      comments.value.forEach(c => {
        if (c.cid !== comment.cid) {
          c.showReplyInput = false
        }
      })
      comment.showReplyInput = !comment.showReplyInput
    }

    const cancelReply = (comment) => {
      comment.showReplyInput = false
      comment.replyContent = ''
    }

    const submitReply = async (comment) => {
      if (!comment.replyContent?.trim() || !props.currentUid) return

      try {
        await commentAPI.replyComment(comment.cid, {
          uid: props.currentUid,
          content: comment.replyContent
        })

        // 重新加载该评论的回复
        const replies = await commentAPI.getReplies(comment.cid)
        comment.replies = replies
        comment.replyContent = ''
        comment.showReplyInput = false
      } catch (error) {
        console.error('回复评论失败:', error)
      }
    }

    // 分页切换（去掉类型声明）
    const changePage = (page) => {
      if (page < 1 || page > totalPages.value) return
      currentPage.value = page
      loadComments()
    }

    // 初始化加载评论
    onMounted(() => {
      loadComments()
    })

    // 暴露变量和方法到模板
    return {
      comments,
      newComment,
      currentPage,
      totalPages,
      formatDate,
      loadComments,
      publishComment,
      likeComment,
      replyToComment,
      cancelReply,
      submitReply,
      changePage
    }
  }
}
</script>

<style scoped>
/* 样式部分完全不变 */
.comment-section {
  margin-top: 3rem;
}

.comment-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ecf0f1;
}

.comment-input textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  margin-bottom: 0.8rem;
  font-family: inherit;
}

.comment-input button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.comment-input button:hover {
  background-color: #2980b9;
}

.login-prompt {
  padding: 1rem;
  color: #7f8c8d;
  text-align: center;
  border: 1px dashed #ddd;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.login-prompt a {
  color: #3498db;
  text-decoration: none;
}

.comments-list {
  margin-bottom: 2rem;
}

.comment-item {
  padding: 1rem 0;
  border-bottom: 1px solid #f5f5f5;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.comment-author {
  font-weight: bold;
  color: #2c3e50;
}

.comment-time {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.comment-content {
  margin-bottom: auto;
}
</style>