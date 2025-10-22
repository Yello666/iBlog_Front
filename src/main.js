// 创建 Vue 应用实例 → 注册全局功能（如路由、状态管理）→ 挂载到页面。
import { createApp } from 'vue'//从 vue 库中导入 createApp 函数。vue3的写法
import iBLOG from './App.vue'//导入根组件 App.vue，这是整个应用的根组件。 所有页面最终都会被挂载在它的模板下。
import router from './router'//导入 Vue Router 实例（路由配置）。它负责管理页面跳转（SPA 单页应用的多“页面”逻辑）。
import store from './store'//导入 Vuex（或 Pinia）状态管理模块，用来在不同组件之间共享数据。

//APP.vue的东西在这里被使用
const app = createApp(iBLOG)
//创建一个 Vue 应用实例，并指定根组件是 App.vue。

app.use(store)
app.use(router)
//给应用安装插件：
//app.use(store)：注册全局状态管理。
//app.use(router)：注册全局路由系统。

app.mount('#app')
//将应用挂载到 HTML 页面中 <div id="app"></div> 的位置。
//Vue 会在这个元素内部渲染整个应用。