<template>
  <div class="login-container container">
    <h2>用户登录</h2>
    <form @submit.prevent="login" class="login-form">
      <div class="form-group">
        <label class="form-label">用户名</label>
        <input
            v-model="loginInfo.userName"
            type="text"
            class="form-input"
            required
            placeholder="请输入用户名"
        />
      </div>

      <div class="form-group">
        <label class="form-label">密码</label>
        <input
            v-model="loginInfo.password"
            type="password"
            class="form-input"
            required
            placeholder="请输入密码"
        />
      </div>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </form>

    <p class="register-link">
      还没有账号？<router-link to="/register">立即注册</router-link>
    </p>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Login',
  data() {
    return {
      loginInfo: {
        userName: '',
        password: ''
      },
      loading: false,//loading用于表示 “当前是否正在执行异步操作（比如登录、注册请求）”，
      // 主要作用是优化用户体验（避免用户重复点击按钮，同时显示 “加载中” 提示）
      error: ''
    }
  },
  methods: {
    async login() {
      this.loading = true
      this.error = ''
      //通过dispatch调用store/index.js里面的login函数，并传入一个列表
      // 里面包括loginInfo对象，在login那里要加{}，才能获取到loginInfo对象
      const result = await this.$store.dispatch('login', { loginInfo: this.loginInfo })

      if (result.code===200) {
        this.$router.push('/')
      } else {
        this.error = result.message
      }

      this.loading = false
    }
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 2rem auto;
}

.login-form {
  margin-bottom: 2rem;
}

.error-message {
  color: #e74c3c;
  margin-top: 1rem;
  padding: 0.5rem;
  background: #fdf2f2;
  border: 1px solid #e74c3c;
  border-radius: 4px;
}

.register-link {
  text-align: center;
  color: #7f8c8d;
}

.register-link a {
  color: #3498db;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>