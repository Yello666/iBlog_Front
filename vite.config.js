import { fileURLToPath, URL } from 'node:url'//Node.js 内置模块，用来把 URL 转成本地文件路径（稍后用于别名）。

import { defineConfig } from 'vite'//Vite 提供的函数，用来书写配置时有类型提示和自动补全（主要是语法糖）。
import vue from '@vitejs/plugin-vue'//让 Vite 能识别和编译 .vue 文件。
import vueDevTools from 'vite-plugin-vue-devtools'//让你在浏览器里直接调试 Vue 组件（相当于增强版 Vue DevTools）。

//导出配置：告诉vite项目的构建规则、插件配置、别名映射、代理转发规则
// https://vite.dev/config/
export default defineConfig({
  plugins: [//这里定义了 Vite 使用的插件：
    vue(),//支持.vue文件
    vueDevTools(),//集成开发者调试工具。
  ],
  resolve: {//路径别名配置（resolve.alias）alias就是别名的意思
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))//把 @ 映射到 src 目录。
    },
  },
//例如import MyComp from '@/components/MyComp.vue'可以等价为import MyComp from '/src/components/MyComp.vue'

    //本地开发服务器代理（server.proxy），使用这个会让Vite 本地服务器代为转发，不是浏览器发，
    // 浏览器默认禁止从 5173 向 8080 发请求（跨域）
    server: {
        proxy: {
            '/api': {//会匹配开头带有/api的请求
                target: 'http://localhost:8080',//转发到这个地址
                changeOrigin: true,//将http请求头的origin字段改成后端服务器的地址，"骗过"服务器的跨域检查。
                //因为原本后端服务器会拒绝跨域访问（防止CSRF攻击）

                rewrite: (path) => path.replace(/^\/api/, '')
                // /^\/api/这个是正则表达式，/表示正则表达式的边界，/正则表达式/，^是表示以什么作为开头^/api是以/api开头
                // 反斜杠是转义，就是以/api开头的路由，/api会被替换成空，可以去掉/api
            },

        }
    },
    //当浏览器请求 /api/xxx 时，
    // Vite 自动代理到 http://localhost:8080/xxx，
    build: {
        outDir: 'dist',//项目生成打包的目录
        sourcemap: false//是否生成源码映射文件，是给调试用的文件，可以帮助你在浏览器中定位到源码行数。
        //生产环境一般关闭，以减小体积。
    }
})
