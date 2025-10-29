<template>
  <div class="comment-section">
    <h3>评论区</h3>

    <!-- 发表评论 -->
    <div class="comment-input">
      <textarea
          v-model="newComment.contents"
          placeholder="写下你的评论..."
          rows="3"
      ></textarea>
      <button @click="publishComment">发表评论</button>
    </div>

    <!-- 评论列表 -->
    <div class="comments-list">
      <div v-for="comment in comments" :key="comment.cid" class="comment-item">
        <div class="comment-header">
          <span class="comment-author">{{ comment.userName || '匿名用户' }}</span>
          <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
        </div>
        <div class="comment-content">{{ comment.contents }}</div>
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
                v-model="comment.replyContents"
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
            <div
                v-for="reply in comment.replies"
                :key="reply.rid"
                class="reply-item"
            >
              <span class="reply-author">{{ reply.userName }}</span>
              <span class="reply-content">{{ reply.contents }}</span>
              <span class="reply-time">{{ formatDate(reply.createTime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="totalPages > 1">
      <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
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

<script setup>
import { ref, onMounted, defineProps } from 'vue'
import { commentAPI } from '@/api/comment'

// ✅ 接收父组件传入的属性
const props = defineProps({
  aid: {
    type: [Number, String],
    required: true
  },
  currentUid: {
    type: [Number, String],
    required: true
  }
})

console.log('评论区接收的 props.currentUid 值:', props.currentUid)
console.log('评论区接收的 props.aid 值:', props.aid)

// 状态管理
const comments = ref([])
const newComment = ref({ contents: '' })
const currentPage = ref(1)
const pageSize = ref(10)
const totalComments = ref(0)
const totalPages = ref(0)

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 加载评论
const loadComments = async () => {
  try {
    console.log("加载评论。。。")
    const response = await commentAPI.getArticleComments(
        Number(props.aid),
        currentPage.value,
        pageSize.value
    )
    console.log(response)
    comments.value = response.data.records.map(comment => ({
      ...comment,
      showReplyInput: false,
      replyContents: ''
    }))
    totalComments.value = response.data.total
    totalPages.value = Math.ceil(totalComments.value / pageSize.value)
  } catch (error) {
    console.error('加载评论失败:', error)
  }
}

// 发表评论
const publishComment = async () => {
  //如果内容不为空或者已经登陆就继续
  if (!newComment.value.contents.trim() || !props.currentUid) return
  try {
    await commentAPI.publishComment({
      aid: props.aid,
      uid: props.currentUid,
      contents: newComment.value.contents
    })
    newComment.value.contents = ''
    currentPage.value = 1
    loadComments()
  } catch (error) {
    console.error('发表评论失败:', error)
  }
}

// 点赞
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

// 回复逻辑
const replyToComment = (comment) => {
  comments.value.forEach(c => {
    if (c.cid !== comment.cid) c.showReplyInput = false
  })
  comment.showReplyInput = !comment.showReplyInput
}

const cancelReply = (comment) => {
  comment.showReplyInput = false
  comment.replyContents = ''
}

const submitReply = async (comment) => {
  if (!comment.replyContents?.trim() || !props.currentUid) return
  try {
    await commentAPI.replyComment(comment.cid, {
      uid: props.currentUid,
      contents: comment.replyContents
    })
    const replies = await commentAPI.getReplies(comment.cid)
    comment.replies = replies
    comment.replyContent = ''
    comment.showReplyInput = false
  } catch (error) {
    console.error('回复评论失败:', error)
  }
}

// 分页
const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadComments()
}

// 初始化加载
onMounted(() => {
  loadComments()
})
</script>

<style scoped>
/* ✅ 你的原样式保持不变 */
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
