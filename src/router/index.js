// 定义页面路由规则、配置页面跳转逻辑，以及控制页面访问权限
import { createRouter, createWebHistory } from 'vue-router'
// createRouter：Vue Router 提供的创建路由实例的函数。
// createWebHistory：创建 HTML5 历史模式的路由（URL 中不带 #，更美观）。
import store from '../store' //导入store/index.js里面export的函数和变量，用于获取用户登录状态、权限等信息（控制访问权限）。

const routes = [//定义路由规则（routes 数组）
    //每个对象代表一个路由规则，包含以下核心属性
    {
        path: '/',//URL 路径
        name: 'Home',//路由名称（可选，用于编程式导航）
        component: () => import('../views/Home.vue')//对应的页面组件（通过 import 动态加载，优化性能）
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
        meta: { requiresGuest: true }//路由元信息（自定义属性，用于权限控制等）。
        // 仅游客（未登录）可访问
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue'),
        // 仅游客（未登录）可访问
        meta: { requiresGuest: true }
    },
    {
        path: '/article/:aid',// 文章详情页：`:aid` 是动态参数（如 `/article/123` 表示 ID 为 123 的文章）
        name: 'ArticleDetail',
        component: () => import('../views/ArticleDetail.vue')
    },
    {
        path: '/article',//这个要放在后面，因为这个路由也可以匹配/article/123
        name: 'ArticleEdit',
        component: () => import('../views/ArticleEdit.vue'),
        meta: { requiresAuth: true }// 元信息：需登录才能访问
    },

    // {
    //     path: '/article',
    //
    //     name: 'ArticleEdit',
    //     component: () => import('../views/ArticleEdit.vue'),
    //     meta: { requiresAuth: true }// 元信息：需登录才能访问
    // },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/UserProfile.vue'),
        meta: { requiresAuth: true }// 元信息：需登录才能访问
    },
    {
        path: '/admin',
        name: 'Admin',
        component: () => import('../views/Admin.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }// 需登录且是管理员
    }
]

const router = createRouter({//创建路由实例
    history: createWebHistory(),// 使用 HTML5 历史模式（无 #）
    routes// 上面定义的路由数组，应用上面定义的路由规则
})

//路由守卫（router.beforeEach）
//这是全局前置守卫，作用是在页面跳转前检查权限，控制是否允许访问目标页面。
router.beforeEach((to, from, next) => {
    // 获取当前用户状态：是否登录、是否为管理员
    const isAuthenticated = store.state.isAuthenticated
    const isAdmin = store.getters.isAdmin

    if (to.meta.requiresAuth && !isAuthenticated) {
        // 目标页需要登录，但用户未登录 → 跳转到登录页
        next('/login')
    } else if (to.meta.requiresGuest && isAuthenticated) {
        // 目标页仅游客可访问，但用户已登录 → 跳转到首页
        next('/')
    } else if (to.meta.requiresAdmin && !isAdmin) {
        // 目标页需要管理员权限，但用户不是管理员 → 跳转到首页
        next('/')
    } else {
        // 所有条件都满足 → 允许访问目标页
        next()
    }
})

export default router