import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
        meta: { requiresGuest: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue'),
        meta: { requiresGuest: true }
    },
    {
        path: '/article/:id',
        name: 'ArticleDetail',
        component: () => import('../views/ArticleDetail.vue')
    },
    {
        path: '/edit',
        name: 'ArticleEdit',
        component: () => import('../views/ArticleEdit.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/edit/:id',
        name: 'ArticleEdit',
        component: () => import('../views/ArticleEdit.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/UserProfile.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/admin',
        name: 'Admin',
        component: () => import('../views/Admin.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const isAuthenticated = store.state.isAuthenticated
    const isAdmin = store.getters.isAdmin

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login')
    } else if (to.meta.requiresGuest && isAuthenticated) {
        next('/')
    } else if (to.meta.requiresAdmin && !isAdmin) {
        next('/')
    } else {
        next()
    }
})

export default router