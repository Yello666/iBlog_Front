<template>
  <div class="register-container container">
    <h2>用户注册</h2>
    <form @submit.prevent="register" class="register-form">
      <div class="form-group">
        <label class="form-label">用户名</label>
        <input
            v-model="user.userName"
            type="text"
            class="form-input"
            required
            placeholder="请输入用户名"
        />
      </div>

      <div class="form-group">
        <label class="form-label">邮箱</label>
        <input
            v-model="user.email"
            type="email"
            class="form-input"
            required
            placeholder="请输入邮箱"
        />
      </div>

      <div class="form-group">
        <label class="form-label">密码</label>
        <input
            v-model="user.password"
            type="password"
            class="form-input"
            required
            placeholder="请输入密码"
        />
      </div>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>

      <div v-if="message" :class="['message', success ? 'success' : 'error']">
        {{ message }}
      </div>
    </form>

    <p class="login-link">
      已有账号？<router-link to="/login">立即登录</router-link>
    </p>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Register',
  data() {
    return {
      user: {
        userName: '',
        email: '',
        password: ''
      },
      loading: false,
      message: '',
      success: false
    }
  },
  methods: {
    async register() {
      this.loading = true
      this.message = ''

      const result = await this.$store.dispatch('register', this.user)

      if (result.success) {
        this.message = '注册成功！请登录'
        this.success = true
        this.user = { userName: '', email: '', password: '' }
      } else {
        this.message = result.message
        this.success = false
      }

      this.loading = false
    }
  }
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 2rem auto;
}

.register-form {
  margin-bottom: 2rem;
}

.message {
  margin-top: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
}

.message.success {
  color: #27ae60;
  background: #f0f9f4;
  border: 1px solid #27ae60;
}

.message.error {
  color: #e74c3c;
  background: #fdf2f2;
  border: 1px solid #e74c3c;
}

.login-link {
  text-align: center;
  color: #7f8c8d;
}

.login-link a {
  color: #3498db;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>