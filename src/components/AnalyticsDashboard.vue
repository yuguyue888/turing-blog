<template>
  <div class="analytics-section">
    <div class="section-header">
      <h2>📊 访问统计</h2>
      <button @click="refreshStats" class="refresh-btn">🔄 刷新</button>
      <button @click="clearData" class="clear-btn">🗑️ 清除数据</button>
    </div>

    <!-- 总览卡片 -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">👁️</div>
        <div class="stat-content">
          <h3>{{ stats.totalPV }}</h3>
          <p>总浏览量 (PV)</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>{{ stats.totalUV }}</h3>
          <p>总访客数 (UV)</p>
        </div>
      </div>

      <div class="stat-card highlight">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <h3>{{ stats.todayPV }}</h3>
          <p>今日浏览 (PV)</p>
          <span class="stat-trend" v-if="stats.yesterdayPV > 0">
            较昨日 {{ getTrend(stats.todayPV, stats.yesterdayPV) }}
          </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">👤</div>
        <div class="stat-content">
          <h3>{{ stats.todayUV }}</h3>
          <p>今日访客 (UV)</p>
        </div>
      </div>
    </div>

    <!-- 最近访问记录 -->
    <div class="recent-section">
      <h3>🕐 最近访问记录 (最近50条)</h3>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>页面</th>
              <th>标题</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(page, index) in stats.recentPages" :key="index">
              <td>{{ formatTime(page.time) }}</td>
              <td class="path-cell">{{ page.path }}</td>
              <td>{{ page.title || '未知页面' }}</td>
            </tr>
            <tr v-if="stats.recentPages.length === 0">
              <td colspan="3" class="empty-text">暂无访问记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 用户行为事件 -->
    <div class="recent-section" v-if="stats.recentEvents && stats.recentEvents.length > 0">
      <h3>⚡ 用户行为事件 (最近20条)</h3>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>类别</th>
              <th>行为</th>
              <th>标签</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(event, index) in stats.recentEvents" :key="index">
              <td>{{ formatTime(event.time) }}</td>
              <td>{{ event.category }}</td>
              <td>{{ event.action }}</td>
              <td>{{ event.label || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 每日趋势 -->
    <div class="trend-section">
      <h3>📈 最近7天趋势</h3>
      <div class="trend-chart">
        <div class="trend-bar" v-for="(day, index) in getLast7Days" :key="index">
          <div class="bar-label">{{ day.label }}</div>
          <div class="bar-container">
            <div class="bar pv" :style="{ height: getBarHeight(day.pv) + '%' }">
              <span class="bar-value">{{ day.pv }}</span>
            </div>
          </div>
          <div class="bar-label">PV: {{ day.pv }} | UV: {{ day.uv }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getStats, clearStats } from '../utils/localAnalytics.js'

const stats = ref({
  totalPV: 0,
  totalUV: 0,
  todayPV: 0,
  todayUV: 0,
  yesterdayPV: 0,
  yesterdayUV: 0,
  recentPages: [],
  recentEvents: [],
  dailyStats: {}
})

// 刷新统计
const refreshStats = () => {
  stats.value = getStats()
}

// 清除数据
const clearData = () => {
  if (confirm('确定要清除所有访问统计数据吗？此操作不可恢复！')) {
    clearStats()
    refreshStats()
    alert('✅ 访问统计已清除')
  }
}

// 格式化时间
const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前'
  } else if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前'
  } else {
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
}

// 计算趋势
const getTrend = (today, yesterday) => {
  if (yesterday === 0) return '新增'
  const trend = ((today - yesterday) / yesterday * 100).toFixed(1)
  if (trend > 0) {
    return `↑ ${trend}%`
  } else if (trend < 0) {
    return `↓ ${Math.abs(trend)}%`
  } else {
    return '持平'
  }
}

// 获取最近7天数据
const getLast7Days = computed(() => {
  const days = []
  const now = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now - i * 86400000)
    const dateStr = date.toISOString().split('T')[0]
    const dayData = stats.value.dailyStats[dateStr] || { pv: 0, uv: new Set() }
    
    days.push({
      label: i === 0 ? '今天' : i === 1 ? '昨天' : date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
      date: dateStr,
      pv: dayData.pv || 0,
      uv: dayData.uv ? dayData.uv.size : 0
    })
  }
  
  return days
})

// 计算柱状图高度
const getBarHeight = (pv) => {
  const maxPV = Math.max(...getLast7Days.value.map(d => d.pv))
  if (maxPV === 0) return 0
  return (pv / maxPV) * 100
}

onMounted(() => {
  refreshStats()
})
</script>

<style scoped>
.analytics-section {
  padding: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin: 0;
}

.refresh-btn,
.clear-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--card-bg);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.refresh-btn:hover,
.clear-btn:hover {
  background: var(--tag-bg);
  color: var(--primary-color);
}

.clear-btn {
  color: #ef4444;
  border-color: #ef4444;
}

.clear-btn:hover {
  background: #fef2f2;
}

/* 统计卡片 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.stat-card.highlight .stat-content p {
  color: rgba(255, 255, 255, 0.9);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content h3 {
  font-size: 2rem;
  margin: 0;
  font-weight: 600;
}

.stat-content p {
  margin: 0.25rem 0 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.stat-trend {
  display: block;
  font-size: 0.75rem;
  margin-top: 0.5rem;
  opacity: 0.9;
}

/* 表格 */
.recent-section,
.trend-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.recent-section h3,
.trend-section h3 {
  font-size: 1.125rem;
  margin: 0 0 1rem;
  color: var(--text-primary);
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.data-table th {
  font-weight: 600;
  color: var(--text-primary);
  background: var(--bg-secondary);
  font-size: 0.875rem;
}

.data-table td {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.data-table tr:hover {
  background: var(--bg-secondary);
}

.path-cell {
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--primary-color);
}

.empty-text {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem !important;
}

/* 趋势图 */
.trend-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200px;
  padding: 1rem 0;
  gap: 1rem;
}

.trend-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.bar-container {
  width: 100%;
  height: 150px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 60%;
  background: linear-gradient(to top, #667eea, #818cf8);
  border-radius: 6px 6px 0 0;
  position: relative;
  min-height: 4px;
  transition: height 0.3s;
}

.bar.pv {
  background: linear-gradient(to top, #667eea, #818cf8);
}

.bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: var(--text-primary);
  font-weight: 600;
}

.bar-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .trend-chart {
    overflow-x: auto;
  }
}
</style>
