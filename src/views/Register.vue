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

      <div v-if="message" :class="['message', code===200 ? 'success' : 'error']">
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
        password: '',
        role:'ROLE_USER'
      },
      loading: false,
      message: '',
      code:0,
    }
  },
  mounted() {
    this.$store.commit('SET_GLOBAL_LOADING', false)
  },
  methods: {
    async register() {
      this.loading = true
      this.message = ''
//通过dispatch调用store/index.js,actions里面的register函数，并传入参数：this.user，由于直接传入了对象，所以actions那里不需要加{}就可以获取user对象
    try{
      const result = await this.$store.dispatch('register', this.user)

      if (result.code === 200) {
        this.message = '注册成功！2秒后跳转到登录页'
        this.code = 200
        this.user = { userName: '', email: '', password: '' }

        // 延迟2秒后跳转
        setTimeout(() => {
          this.$router.push('/login')//跳转到登录页面
        }, 2000) // 2000 毫秒 = 2秒
      }else {
        // 后端返回失败（如用户名已存在）
        this.message = result.message || '注册失败，请稍后再试'
        this.code = result.code || -1
      }
    } catch (error) {
      // 捕获网络错误或前端代码错误（如之前的authAPI异步处理错误）
      console.error('注册过程发生错误:', error)
      this.message = '网络异常，注册失败，请检查网络后重试'
      this.code = -1 // 标记为网络错误
    } finally {
      // 无论成功/失败，都结束加载状态
      this.loading = false
    }
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