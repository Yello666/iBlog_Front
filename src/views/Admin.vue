<template>
  <div class="admin-container">
    <h1>管理员后台</h1>
    <p>功能开发中...</p>
  </div>
</template>

<script>
export default {
  name: 'Admin',
  mounted() {
    this.$store.commit('SET_GLOBAL_LOADING', false)
  }
}
</script>

<style scoped>
.admin-container {
  padding: 2rem;
  text-align: center;
}
</style>
