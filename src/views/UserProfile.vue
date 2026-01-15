<template>
  <div class="user-profile-container">
    <!-- 新增：右上角返回按钮 -->
    <div class="back-btn-container">
      <button @click="$router.push('/')" class="back-btn">
        ← 返回首页
      </button>
    </div>

    <div class="profile-header">
      <h2>个人资料</h2>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 用户信息展示 -->
    <div v-else class="profile-content">
      <!-- 基本信息卡片 -->
      <div class="profile-card">
        <div class="profile-info" v-if="!editing">
          <div class="info-item">
            <span class="label">用户ID:</span>
            <span class="value">{{ user.uid }}</span>
          </div>
          <div class="info-item">
            <span class="label">用户名:</span>
            <span class="value">{{ user.userName }}</span>
          </div>
          <div class="info-item">
            <span class="label">性别:</span>
            <span class="value">{{ user.gender === 'M' ? '男' : user.gender === 'F' ? '女' : '未知' }}</span>
          </div>
          <div class="info-item">
            <span class="label">年龄:</span>
            <span class="value">{{ user.age || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="label">角色:</span>
            <span class="value">{{ user.role === 'ROLE_ADMIN' ? '管理员' : '普通用户' }}</span>
          </div>
          <div class="action-buttons">
            <button @click="editing = true" class="edit-btn">编辑资料</button>
            <button @click="showPasswordModal = true" class="password-btn">修改密码</button>
            <button @click="showDeleteModal = true" class="delete-btn">注销账号</button>
          </div>
        </div>

        <!-- 编辑资料表单 -->
        <div class="edit-form" v-if="editing">
          <div class="form-group">
            <label>用户名:</label>
            <input v-model="editUser.userName" type="text" placeholder="请输入用户名">
          </div>
          <div class="form-group">
            <label>性别:</label>
            <select v-model="editUser.gender">
              <option value="">请选择</option>
              <option value="M">男</option>
              <option value="F">女</option>
            </select>
          </div>
          <div class="form-group">
            <label>年龄:</label>
            <input v-model.number="editUser.age" type="number" min="0" placeholder="请输入年龄">
          </div>
          <div class="form-actions">
            <button @click="cancelEdit" class="cancel-btn">取消</button>
            <button @click="saveUserInfo" class="save-btn">保存</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <div v-if="showPasswordModal" class="modal-overlay">
      <div class="modal">
        <h3>修改密码</h3>
        <div class="form-group">
          <label>原密码:</label>
          <input v-model="passwordForm.oldPsw" type="password" placeholder="请输入原密码">
        </div>
        <div class="form-group">
          <label>新密码:</label>
          <input v-model="passwordForm.newPsw" type="password" placeholder="请输入新密码">
        </div>
        <div class="form-actions">
          <button @click="showPasswordModal = false" class="cancel-btn">取消</button>
          <button @click="updatePassword" class="save-btn">确认修改</button>
        </div>
      </div>
    </div>

    <!-- 注销账号确认弹窗 -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal delete-modal">
        <h3>确认注销账号</h3>
        <p class="warning-text">警告：注销账号后所有数据将不可恢复，是否确定要注销？</p>
        <div class="form-actions">
          <button @click="showDeleteModal = false" class="cancel-btn">取消</button>
          <button @click="deleteAccount" class="confirm-delete-btn">确认注销</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { userAPI } from '../api/user.js'
// 1. 引入 Vuex 的 mapGetters，用于获取 currentUser
import { mapGetters } from 'vuex'
export default {
  // 2. 通过 mapGetters 映射 Vuex 中的 currentUser
  computed: {
    ...mapGetters(['currentUser'])
  },
  data() {
    return {
      user: {},
      editUser: {},
      loading: true,
      error: '',
      editing: false,
      showPasswordModal: false,
      showDeleteModal: false,
      passwordForm: {
        uid: null,
        oldPsw: '',
        newPsw: ''
      }
    }
  },

  async created() {
    // 3. 从 currentUser 中获取 uid，替代原有的 getCurrentUserUid()
    const currentUid = this.currentUser?.uid
    // 校验当前用户是否存在（避免未登录状态访问）
    if (!currentUid) {
      this.error = '未检测到登录状态，请先登录'
      this.loading = false
      // 关闭全局loading
      this.$store.commit('SET_GLOBAL_LOADING', false)
      return
    }

    try {
      // 4. 使用 currentUser 的 uid 调用接口获取用户信息
      console.log("currentUid:",currentUid)
      const response = await userAPI.getUser(currentUid)
      // 注意：需匹配后端返回格式（参考 store 中 fetchUser 逻辑，响应体包含 code 和 data）
      if (response.code === 200) {
        this.user = response.data
        this.initializeEditUser()
        this.passwordForm.uid = currentUid // 给密码表单赋值 uid
      } else {
        this.error = response.message || '获取用户信息失败'
      }
    } catch (err) {
      this.error = '网络错误，无法获取用户信息'
      console.error('获取用户信息失败:', err)
    } finally {
      this.loading = false
      // 关闭全局loading
      this.$store.commit('SET_GLOBAL_LOADING', false)
    }
  },

  methods: {
    // 初始化编辑用户对象
    initializeEditUser() {
      this.editUser = {
        uid: this.user.uid,
        userName: this.user.userName,
        gender: this.user.gender,
        age: this.user.age
      }
    },

    // 取消编辑
    cancelEdit() {
      this.initializeEditUser()
      this.editing = false
    },

    // 保存用户信息
    async saveUserInfo() {
      if (!this.editUser.userName) {
        this.$message.error('用户名不能为空')
        return
      }

      try {
        this.loading = true
        const response = await userAPI.updateUser(this.editUser)
        if (response.success) {
          this.user = response.data
          this.editing = false
          this.$message.success('用户信息更新成功')
        } else {
          this.$message.error(response.message || '更新用户信息失败')
        }
      } catch (err) {
        this.$message.error('网络错误，更新失败')
        console.error('更新用户信息失败:', err)
      } finally {
        this.loading = false
      }
    },

    // 修改密码
    async updatePassword() {
      if (!this.passwordForm.oldPsw || !this.passwordForm.newPsw) {
        this.$message.error('原密码和新密码不能为空')
        return
      }

      if (this.passwordForm.oldPsw === this.passwordForm.newPsw) {
        this.$message.error('新密码不能与原密码相同')
        return
      }

      try {
        this.loading = true
        const response = await userAPI.updatePassword(this.passwordForm)
        if (response.success) {
          this.showPasswordModal = false
          this.passwordForm.oldPsw = ''
          this.passwordForm.newPsw = ''
          this.$message.success('密码修改成功，请重新登录')
          // 密码修改成功后通常需要重新登录
          this.$router.push('/login')
        } else {
          this.$message.error(response.message || '修改密码失败')
        }
      } catch (err) {
        this.$message.error('网络错误，修改密码失败')
        console.error('修改密码失败:', err)
      } finally {
        this.loading = false
      }
    },

    // 注销账号
    async deleteAccount() {
      try {
        this.loading = true
        const response = await userAPI.deleteUser()
        if (response.success) {
          this.$message.success('账号注销成功')
          // 注销成功后跳转到登录页
          this.$router.push('/login')
        } else {
          this.$message.error(response.message || '注销账号失败')
          this.showDeleteModal = false
        }
      } catch (err) {
        this.$message.error('网络错误，注销失败')
        console.error('注销账号失败:', err)
        this.showDeleteModal = false
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
/* 新增：返回按钮样式 */
.back-btn-container {
  text-align: right;
  margin-bottom: 15px;
}

.back-btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  background-color: #95a5a6;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #7f8c8d;
}

.user-profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.loading {
  text-align: center;
  padding: 50px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #e74c3c;
  background-color: #fadbd8;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.profile-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.info-item {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f5f5f5;
}

.label {
  display: inline-block;
  width: 100px;
  font-weight: bold;
  color: #666;
}

.value {
  color: #333;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.edit-btn, .password-btn, .delete-btn, .save-btn, .cancel-btn, .confirm-delete-btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.edit-btn {
  background-color: #3498db;
  color: white;
}

.password-btn {
  background-color: #2ecc71;
  color: white;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #666;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.save-btn {
  background-color: #3498db;
  color: white;
}

.cancel-btn {
  background-color: #95a5a6;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  padding: 20px;
}

.delete-modal .warning-text {
  color: #e74c3c;
  margin: 15px 0;
  padding: 10px;
  background-color: #fadbd8;
  border-radius: 4px;
}

.confirm-delete-btn {
  background-color: #e74c3c;
  color: white;
}
</style>
