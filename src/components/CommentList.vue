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

// console.log('评论区接收的 props.currentUid 值:', props.currentUid)
// console.log('评论区接收的 props.aid 值:', props.aid)

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
    // console.log("加载评论。。。")
    const response = await commentAPI.getArticleComments(
        Number(props.aid),
        currentPage.value,
        pageSize.value
    )
    // console.log(response)
    comments.value = response.data.records.map(comment => ({
      ...comment,
      isLiked: comment.liked,
      likeCount: comment.likesCount,
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
    const response=await commentAPI.likeComment(cid)
    comment.isLiked = response.data.status
    comment.likeCount=response.data.crtLikes
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

// 分页。。。
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
.comment-section {
  margin-top: 3rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 1rem;
}

.comment-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ecf0f1;
  font-size: 1.5rem;
}

.comment-input textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: vertical;
  margin-bottom: 0.8rem;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.comment-input textarea:focus {
  outline: none;
  border-color: #3498db;
}

.comment-input button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 1rem;
}

.comment-input button:hover {
  background-color: #2980b9;
}

.comments-list {
  margin-bottom: 2rem;
}

.comment-item {
  padding: 1.5rem 0;
  border-bottom: 1px solid #f5f5f5;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}

.comment-author {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.1rem;
}

.comment-time {
  color: #7f8c8d;
  font-size: 0.95rem;
}

.comment-content {
  margin-bottom: 1rem;
  font-size: 1.05rem;
  line-height: 1.5;
}

/* 点赞和回复按钮样式优化 */
.comment-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem; /* 拉开点赞和回复按钮的间距 */
  margin-top: 0.5rem;
}

.like-btn, .reply-btn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.1rem; /* 调大字体 */
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.2s;
  padding: 0.3rem 0.5rem;
}

.like-btn {
  color: #e74c3c;
}

.like-btn.liked {
  color: #e74c3c;
  transform: scale(1.05);
}

.reply-btn {
  color: #333;
}

.reply-btn:hover {
  color: #3498db; /* 回复按钮hover变蓝 */
}

/* 回复输入框样式 */
.reply-input {
  margin-top: 1rem;
  margin-left: 0;
  width: 100%;
}

.reply-input textarea {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #eee;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  font-size: 1rem;
  margin-bottom: 0.7rem;
}

.reply-buttons {
  display: flex;
  gap: 0.8rem;
}

.reply-buttons button {
  padding: 0.4rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.reply-buttons button:first-child {
  background-color: #3498db;
  color: white;
  border: none;
}

.reply-buttons button:first-child:hover {
  background-color: #2980b9;
}

.reply-buttons button:last-child {
  background-color: #f5f5f5;
  color: #333;
  border: none;
}

.reply-buttons button:last-child:hover {
  background-color: #e0e0e0;
}

/* 回复列表样式 */
.replies {
  margin-top: 1rem;
  padding-left: 0;
}

.reply-item {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
  font-size: 1rem;
}

.reply-author {
  font-weight: bold;
  color: #2c3e50;
}

.reply-content {
  color: #333;
}

.reply-time {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-left: auto;
}

/* 分页样式 */
.pagination {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.pagination button:hover:not(:disabled) {
  background-color: #f5f5f5;
  border-color: #ccc;
}

.pagination button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pagination span {
  color: #333;
  font-size: 1rem;
}
</style>