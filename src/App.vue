<!--App.vue = 网站的"外壳"或"框架"（永远显示的部分）-->
<!--.vue 文件是 Vue 组件的 “一站式” 文件，整合了结构（template）、逻辑（script）、样式（style），让组件更模块化、易维护。-->
<!--<template>：Vue 组件的模板根标签，定义了组件的 HTML 结构-->
<template>
<!--  <div id="app">整个应用的最外层容器，通过id="app"标识（通常与入口文件中的挂载点对应）-->
  <div id="app">
    <SpeedInsights />
    <!--      <nav></nav>是导航栏，是固定语法-->
    <nav class="navbar">
      <div class="nav-brand"> <!--nav-brand是网站logo -->
<!--        <router-link to="/">：Vue Router 提供的路由链接组件，
  to="/"表示点击后跳转到网站首页（根路径），在src/router/index.js中定义，相当于传统的<a href="/">但不会刷新页面-->
        <router-link to="/">iBLOG</router-link>
      </div>
      <div class="nav-links">
<!--        如果没有登录的话-->
        <template v-if="!isAuthenticated"><!--template是可以讲两个元素弄到一起，相当于一个div的作用，但是不会实际生成一个div，这样易于维护 -->
          <router-link to="/login" class="nav-btn nav-inside-btn">登录</router-link>
          <router-link to="/register" class="nav-btn nav-inside-btn">注册</router-link>
        </template>
<!--        已登录状态-->
        <template v-else>
          <router-link to="/article" class="nav-btn nav-inside-btn">写文章</router-link>
<!--          <router-link to="/profile" class="nav-btn nav-inside-btn">个人中心</router-link>-->
          <!-- 个人中心下拉菜单 -->
          <div class="user-menu">
            <button class="user-menu-trigger">个人中心</button>
            <div class="user-menu-dropdown">
              <router-link to="/profile" class="dropdown-item">个人资料</router-link>
              <button
                  @click="goToMyArticles"
                  class="dropdown-item"
              >
                我的文章
              </button>
            </div>
          </div>
          <span class="user-info">欢迎, {{ currentUser?.userName }}</span>
          <button @click="logout" class="logout-btn">退出</button>
<!--          如果是管理员，还有管理页面-->
          <router-link v-if="isAdmin" to="/admin" class="admin-link">管理</router-link>
        </template>
      </div>
    </nav>
<!--<main>：HTML5 语义化标签，用于定义页面的主要内容区域-->
    <main>
<!--      显示根目录，显示src/route/index.js中定义的/显示的vue组件:Home.vue-->
      <router-view />
    </main>
  </div>
</template>

<!--<script> 标签内的代码用于定义组件的逻辑部分-->
<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { SpeedInsights } from '@vercel/speed-insights/vue'

//导出了APP，会在main.js里面被引用
export default {
  name: 'iBLOG',// 组件名称（调试和开发工具中显示）,在main.js中引入，用于创建vue项目
  components: {
    SpeedInsights
  },
  // 通过 Vuex 获取全局状态（登录状态、用户信息等），在store/index.js里面
  computed: {
    ...mapState(['user']),//在state中获取
    ...mapGetters(['isAuthenticated', 'currentUser', 'isAdmin'])//经过计算后的action的getter中获取
  },
  methods: {
    // 定义退出登录的方法
    logout() {
      this.$store.dispatch('logout')// 调用 Vuex 的 logout 动作（清除登录状态）
      this.$router.push('/login')// 跳转到登录页
    },
    // 跳转到我的文章页面
    goToMyArticles() {
      // 检查登录状态（双重保险）
      if (!this.isAuthenticated) {
        alert('请先登录')
        return
      }
      // 跳转到用户文章列表页
      this.$router.push(`/articles/user/${this.currentUser.uid}`)//uid是字符串也没有关系，还是/user/123
    }
  }
}
</script>
<!--页面样式设计在style里面-->
<style>
/*清除默认边距，使用 border-box 盒模型*/
/*浏览器有默认样式，不同的元素有不同的默认 margin 和 padding，所以需要将所有元素的margin和padding都清0*/
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
  /* css的注释是这样写的，background: #0a22cd;*/
  /*渐变的背景*/
  /*background: linear-gradient(to right, #1c1f55, #343187, rgba(41, 34, 175, 0.73));*/
  background: #122165;
  /*字体颜色*/
  color: #1b1919;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: 60px;

}
/* 个人中心下拉菜单样式 */
.user-menu {
  position: relative;
  display: inline-block;
}

.user-menu-trigger {
  background: #e4e4f3;
  color: #4f5288 !important;
  border: 2px solid #e4e4f3;
  display: inline-block;
  width: 120px;
  height:45px;
  padding: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
  text-align: center;

  border-radius: 10px;
  cursor: pointer;
}

.user-menu-trigger:hover {
  background: #30337c;
  color: #ffffff !important;

  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* 下拉菜单容器 */
.user-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 120px;
  background-color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  z-index: 1000;
  display: none; /* 默认隐藏 */
  margin-top: 2px;
}

/* 下拉菜单项 */
.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 15px;
  text-align: left;
  background: none;
  border: none;
  color: #4f5288;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: medium;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

/* 悬停显示下拉菜单 */
.user-menu:hover .user-menu-dropdown {
  display: block;
}
.nav-brand a {
  /* 字体颜色渐变 */
  background: linear-gradient(to bottom, #ffffff, #5588f4);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent; /* 备用 */

  text-decoration: none;
  font-size: 1.5rem;/*字体大小*/
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 1000;
}

/* 确保导航链接的间距适应新按钮 */
.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem; /* 调整间距以适应按钮 */
}

/*登陆和注册字体的颜色
这个是父类，它的样式会掩盖子类，除非在子类的样式里特地标注!important
*/

.nav-links a {
  color: #4f5288;
  text-decoration: none;
  padding: 0.5rem;
  transition: background-color 0.3s;
}

.nav-links a:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.nav-links a.router-link-active {
  background-color: #8a8eae;
  color:white;
}

.nav-btn {
  display: inline-block;
  padding: 0.5rem;
  text-decoration: none;

  font-weight: 500;
  transition: all 0.3s ease;

  text-align: center;
  width: 110px;
  border-radius: 10px; /* 椭圆形 */
}

.nav-inside-btn {
  background: #e4e4f3;
  color: #333;
  border: 2px solid #e4e4f3;

}

.nav-inside-btn:hover {
  background: #ffffff;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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