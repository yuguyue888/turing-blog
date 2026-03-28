// 本地访问统计工具
class LocalAnalytics {
  constructor() {
    this.storageKey = 'localAnalytics'
    this.data = this.loadData()
  }

  // 加载数据
  loadData() {
    const stored = localStorage.getItem(this.storageKey)
    if (stored) {
      return JSON.parse(stored)
    }
    
    return {
      // 总览数据
      totalPV: 0,
      totalUV: 0,
      
      // 每日数据
      dailyStats: {},
      
      // 页面访问记录
      pageViews: [],
      
      // 用户行为记录
      events: [],
      
      // 访客ID（基于浏览器指纹）
      visitorId: this.generateVisitorId()
    }
  }

  // 保存数据
  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data))
  }

  // 生成访客ID
  generateVisitorId() {
    let visitorId = localStorage.getItem('visitorId')
    if (!visitorId) {
      visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('visitorId', visitorId)
    }
    return visitorId
  }

  // 记录页面访问
  trackPageView(path, title) {
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const timeStr = now.toISOString()
    
    // 更新总览
    this.data.totalPV++
    
    // 更新每日统计
    if (!this.data.dailyStats[dateStr]) {
      this.data.dailyStats[dateStr] = {
        pv: 0,
        uv: new Set(),
        pages: {}
      }
    }
    this.data.dailyStats[dateStr].pv++
    this.data.dailyStats[dateStr].uv.add(this.data.visitorId)
    
    // 记录页面访问
    if (!this.data.dailyStats[dateStr].pages[path]) {
      this.data.dailyStats[dateStr].pages[path] = 0
    }
    this.data.dailyStats[dateStr].pages[path]++
    
    // 添加访问记录
    this.data.pageViews.push({
      path,
      title,
      time: timeStr,
      visitorId: this.data.visitorId
    })
    
    // 只保留最近1000条记录
    if (this.data.pageViews.length > 1000) {
      this.data.pageViews = this.data.pageViews.slice(-1000)
    }
    
    this.saveData()
  }

  // 记录事件
  trackEvent(category, action, label) {
    const now = new Date()
    const timeStr = now.toISOString()
    
    this.data.events.push({
      category,
      action,
      label,
      time: timeStr,
      visitorId: this.data.visitorId
    })
    
    // 只保留最近500条事件
    if (this.data.events.length > 500) {
      this.data.events = this.data.events.slice(-500)
    }
    
    this.saveData()
  }

  // 获取统计数据
  getStats() {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const yesterday = new Date(now - 86400000).toISOString().split('T')[0]
    
    // 计算总UV
    const allVisitors = new Set()
    Object.values(this.data.dailyStats).forEach(day => {
      day.uv.forEach(v => allVisitors.add(v))
    })
    
    return {
      totalPV: this.data.totalPV,
      totalUV: allVisitors.size,
      
      todayPV: this.data.dailyStats[today]?.pv || 0,
      todayUV: this.data.dailyStats[today]?.uv.size || 0,
      
      yesterdayPV: this.data.dailyStats[yesterday]?.pv || 0,
      yesterdayUV: this.data.dailyStats[yesterday]?.uv.size || 0,
      
      recentPages: this.data.pageViews.slice(-50).reverse(),
      recentEvents: this.data.events.slice(-20).reverse(),
      
      dailyStats: this.data.dailyStats
    }
  }

  // 清除数据
  clearData() {
    this.data = {
      totalPV: 0,
      totalUV: 0,
      dailyStats: {},
      pageViews: [],
      events: [],
      visitorId: this.data.visitorId
    }
    this.saveData()
  }
}

// 创建实例
const localAnalytics = new LocalAnalytics()

// 导出方法
export function trackPageView(path, title) {
  localAnalytics.trackPageView(path, title)
}

export function trackEvent(category, action, label) {
  localAnalytics.trackEvent(category, action, label)
}

export function getStats() {
  return localAnalytics.getStats()
}

export function clearStats() {
  localAnalytics.clearData()
}

export default localAnalytics
