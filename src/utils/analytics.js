// 访问统计配置
export const analyticsConfig = {
  // 百度统计
  baidu: {
    enabled: true,
    siteId: '' // 需要在百度统计后台获取
  },
  
  // Google Analytics
  google: {
    enabled: true,
    measurementId: '' // 需要在 Google Analytics 后台获取，格式：G-XXXXXXXXXX
  }
}

// 初始化百度统计
export function initBaiduAnalytics(siteId) {
  if (!siteId) return
  
  window._hmt = window._hmt || []
  const script = document.createElement('script')
  script.src = `https://hm.baidu.com/hm.js?${siteId}`
  script.async = true
  document.head.appendChild(script)
  
  console.log('✅ 百度统计已初始化')
}

// 初始化 Google Analytics
export function initGoogleAnalytics(measurementId) {
  if (!measurementId) return
  
  // 添加 gtag.js
  const script1 = document.createElement('script')
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  script1.async = true
  document.head.appendChild(script1)
  
  // 初始化 gtag
  window.dataLayer = window.dataLayer || []
  function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag = gtag
  
  gtag('js', new Date())
  gtag('config', measurementId)
  
  console.log('✅ Google Analytics 已初始化')
}

// 页面访问追踪
export function trackPageView(path, title) {
  // 百度统计
  if (window._hmt) {
    window._hmt.push(['_trackPageview', path])
  }
  
  // Google Analytics
  if (window.gtag) {
    window.gtag('config', analyticsConfig.google.measurementId, {
      page_path: path,
      page_title: title
    })
  }
  
  // 开发环境日志
  if (import.meta.env.DEV) {
    console.log('📊 页面访问已记录:', path)
  }
}

// 事件追踪
export function trackEvent(category, action, label, value) {
  // 百度统计
  if (window._hmt) {
    window._hmt.push(['_trackEvent', category, action, label, value])
  }
  
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    })
  }
  
  // 开发环境日志
  if (import.meta.env.DEV) {
    console.log('📊 事件已记录:', category, action, label)
  }
}

// 初始化所有统计
export function initAnalytics() {
  const savedConfig = localStorage.getItem('analyticsConfig')
  if (savedConfig) {
    const config = JSON.parse(savedConfig)
    Object.assign(analyticsConfig, config)
  }
  
  if (analyticsConfig.baidu.enabled && analyticsConfig.baidu.siteId) {
    initBaiduAnalytics(analyticsConfig.baidu.siteId)
  }
  
  if (analyticsConfig.google.enabled && analyticsConfig.google.measurementId) {
    initGoogleAnalytics(analyticsConfig.google.measurementId)
  }
  
  // 开发环境日志
  if (import.meta.env.DEV) {
    console.log('📊 访问统计已初始化')
  }
}

// 保存统计配置
export function saveAnalyticsConfig(config) {
  Object.assign(analyticsConfig, config)
  localStorage.setItem('analyticsConfig', JSON.stringify(analyticsConfig))
}
