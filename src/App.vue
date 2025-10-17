<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <router-link to="/">博客系统</router-link>
      </div>
      <div class="nav-links">
        <router-link to="/">首页</router-link>
        <template v-if="!isAuthenticated">
          <router-link to="/login">登录</router-link>
          <router-link to="/register">注册</router-link>
        </template>
        <template v-else>
          <router-link to="/edit">写文章</router-link>
          <router-link to="/profile">个人中心</router-link>
          <span class="user-info">欢迎, {{ currentUser?.userName }}</span>
          <button @click="logout" class="logout-btn">退出</button>
          <router-link v-if="isAdmin" to="/admin" class="admin-link">管理</router-link>
        </template>
      </div>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'App',
  computed: {
    ...mapState(['user']),
    ...mapGetters(['isAuthenticated', 'currentUser', 'isAdmin'])
  },
  methods: {
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

.navbar {
  background: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-brand a {
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-links a:hover {
  background-color: rgba(255,255,255,0.1);
}

.nav-links a.router-link-active {
  background-color: #3498db;
}

.user-info {
  color: #ecf0f1;
  margin-right: 1rem;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background: #c0392b;
}

.admin-link {
  background: #e67e22;
}

.admin-link:hover {
  background: #d35400;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 80px);
}

.container {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ecf0f1;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover {
  background: #229954;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

.article-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.article-title {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  text-decoration: none;
  display: block;
  font-size: 1.25rem;
  font-weight: bold;
}

.article-meta {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.article-content {
  color: #555;
  line-height: 1.6;
}

.comment {
  border-left: 3px solid #3498db;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
}

.comment-meta {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.tag {
  display: inline-block;
  background: #ecf0f1;
  color: #2c3e50;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>