// Service Worker for PWA
const CACHE_NAME = 'turing-blog-v1'
const OFFLINE_URL = '/offline.html'

// 需要缓存的静态资源（仅在生产环境）
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
]

// 安装事件 - 预缓存关键资源
self.addEventListener('install', (event) => {
  console.log('[SW] 安装中...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 预缓存关键资源')
        // 使用 try-catch 避免单个文件失败导致整体失败
        return Promise.all(
          STATIC_CACHE_URLS.map(url => 
            fetch(url)
              .then(response => {
                if (response.ok) {
                  return cache.put(url, response)
                }
              })
              .catch(() => {
                console.log('[SW] 缓存失败，跳过:', url)
              })
          )
        )
      })
      .then(() => {
        console.log('[SW] 安装完成')
        return self.skipWaiting()
      })
  )
})

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活中...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('[SW] 删除旧缓存:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        console.log('[SW] 激活完成')
        return self.clients.claim()
      })
  )
})

// 请求拦截 - 缓存策略
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // 只处理 GET 请求
  if (request.method !== 'GET') {
    return
  }
  
  // 开发环境跳过 Vite 相关请求
  if (url.pathname.includes('/@') || url.pathname.includes('/node_modules/')) {
    return
  }
  
  // API 请求 - 网络优先
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request))
    return
  }
  
  // 静态资源 - 网络优先（开发环境）或缓存优先（生产环境）
  if (isStaticResource(url)) {
    // 检查是否是开发环境
    if (url.port === '5173' || url.hostname === 'localhost') {
      // 开发环境：总是从网络获取
      event.respondWith(fetch(request).catch(() => caches.match(request)))
    } else {
      // 生产环境：缓存优先
      event.respondWith(cacheFirst(request))
    }
    return
  }
  
  // HTML 页面 - 网络优先，离线时返回缓存
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithOfflineFallback(request))
    return
  }
  
  // 其他请求 - 网络优先
  event.respondWith(networkFirst(request))
})

// 缓存优先策略
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    // 后台更新缓存
    fetchAndCache(request)
    return cachedResponse
  }
  
  // 没有缓存，从网络获取
  return fetchAndCache(request)
}

// 网络优先策略
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    
    // 缓存成功的响应
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    // 网络失败，返回缓存
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    throw error
  }
}

// 网络优先 + 离线页面
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request)
    
    // 缓存成功的响应
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    // 网络失败，返回缓存
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // 返回离线页面
    return caches.match(OFFLINE_URL)
  }
}

// 获取并缓存
async function fetchAndCache(request) {
  try {
    const response = await fetch(request)
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    // 网络失败，返回缓存
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    throw error
  }
}

// 判断是否为静态资源
function isStaticResource(url) {
  const staticExtensions = [
    '.css',
    '.js',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot'
  ]
  
  return staticExtensions.some((ext) => url.pathname.endsWith(ext))
}

// 后台同步
self.addEventListener('sync', (event) => {
  console.log('[SW] 后台同步:', event.tag)
  
  if (event.tag === 'sync-articles') {
    event.waitUntil(syncArticles())
  }
})

// 推送通知
self.addEventListener('push', (event) => {
  console.log('[SW] 收到推送:', event)
  
  const options = {
    body: event.data?.text() || '有新内容更新',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看详情',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/icons/icon-96x96.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('图灵花园', options)
  )
})

// 通知点击
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 通知点击:', event.action)
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// 同步文章（示例）
async function syncArticles() {
  // 这里可以实现离线时的数据同步逻辑
  console.log('[SW] 同步文章...')
}

console.log('[SW] Service Worker 已加载')
