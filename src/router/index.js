import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Article from '../views/Article.vue'
import Category from '../views/Category.vue'
import About from '../views/About.vue'
import News from '../views/News.vue'
import NewsDetail from '../views/NewsDetail.vue'
import Navigation from '../views/Navigation.vue'
import Login from '../views/Login.vue'
import Admin from '../views/Admin.vue'
import Editor from '../views/Editor.vue'
import ApiManagement from '../views/ApiManagement.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/article/:id',
    name: 'Article',
    component: Article
  },
  {
    path: '/category/:name',
    name: 'Category',
    component: Category
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/news',
    name: 'News',
    component: News
  },
  {
    path: '/news/:id',
    name: 'NewsDetail',
    component: NewsDetail
  },
  {
    path: '/navigation',
    name: 'Navigation',
    component: Navigation
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true }
  },
  {
    path: '/editor',
    name: 'Editor',
    component: Editor,
    meta: { requiresAuth: true }
  },
  {
    path: '/editor/:id',
    name: 'EditArticle',
    component: Editor,
    meta: { requiresAuth: true }
  },
  {
    path: '/api-management',
    name: 'ApiManagement',
    component: ApiManagement,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    next('/admin')
  } else {
    next()
  }
})

export default router
