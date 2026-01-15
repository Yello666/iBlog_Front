<template>
  <div class="article-skeleton">
    <div
      v-for="n in count"
      :key="n"
      class="skeleton-card"
    >
      <!-- 标题骨架 -->
      <div class="skeleton-title"></div>
      
      <!-- 元信息骨架 -->
      <div class="skeleton-meta">
        <div class="skeleton-line short"></div>
      </div>
      
      <!-- 内容骨架 -->
      <div class="skeleton-content">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line medium"></div>
      </div>
      
      <!-- 标签骨架（仅ArticleList需要） -->
      <div v-if="showTags" class="skeleton-tags">
        <div class="skeleton-tag"></div>
        <div class="skeleton-tag"></div>
        <div class="skeleton-tag"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArticleSkeleton',
  props: {
    // 骨架屏数量
    count: {
      type: Number,
      default: 3
    },
    // 是否显示标签骨架
    showTags: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.article-skeleton {
  width: 100%;
}

.skeleton-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.skeleton-title {
  height: 1.5rem;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  border-radius: 4px;
  margin-bottom: 1rem;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-meta {
  margin-bottom: 1rem;
}

.skeleton-content {
  margin-bottom: 1rem;
}

.skeleton-line {
  height: 0.9rem;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  border-radius: 4px;
  margin-bottom: 0.6rem;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-line.medium {
  width: 70%;
}

.skeleton-line.short {
  width: 50%;
  height: 0.8rem;
}

.skeleton-tags {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.skeleton-tag {
  width: 60px;
  height: 1.5rem;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 为不同元素添加不同的动画延迟，让效果更自然 */
.skeleton-line:nth-child(1) {
  animation-delay: 0s;
}

.skeleton-line:nth-child(2) {
  animation-delay: 0.1s;
}

.skeleton-line:nth-child(3) {
  animation-delay: 0.2s;
}

.skeleton-tag:nth-child(1) {
  animation-delay: 0s;
}

.skeleton-tag:nth-child(2) {
  animation-delay: 0.15s;
}

.skeleton-tag:nth-child(3) {
  animation-delay: 0.3s;
}
</style>
