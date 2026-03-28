import express from 'express';

const router = express.Router();

// Puppeteer 动态页面抓取
// 注意：需要安装 puppeteer: npm install puppeteer

let puppeteer = null;

// 尝试加载 Puppeteer（可能未安装）
try {
  puppeteer = await import('puppeteer');
  console.log('✅ Puppeteer 已加载，支持动态页面抓取');
} catch (error) {
  console.log('⚠️  Puppeteer 未安装，动态页面抓取功能将不可用');
  console.log('💡 安装方法: npm install puppeteer');
}

// 需要动态渲染的网站列表
const DYNAMIC_SOURCES = {
  juejin_hot: {
    name: '掘金热门',
    url: 'https://juejin.cn/',
    selector: '.entry-title a, .title a, a[href*="/post"]',
    icon: '💎',
    category: 'dev',
    enabled: true,
    waitFor: '.entry-list, .content-list' // 等待这个元素出现
  },
  
  zhihu_hot: {
    name: '知乎热榜',
    url: 'https://www.zhihu.com/hot',
    selector: '.HotList-item a, a[href*="/question"]',
    icon: '🎓',
    category: 'social',
    enabled: true,
    waitFor: '.HotList'
  },
  
  weibo_hot: {
    name: '微博热搜',
    url: 'https://s.weibo.com/top/summary',
    selector: '.td-02 a, a[href*="/weibo"]',
    icon: '🔥',
    category: 'social',
    enabled: false, // 微博反爬严格，默认禁用
    waitFor: '.data'
  },
  
  bilibili_hot: {
    name: 'B站热门',
    url: 'https://www.bilibili.com/v/popular/rank/all',
    selector: '.rank-item a, a[href*="/video"]',
    icon: '📺',
    category: 'video',
    enabled: true,
    waitFor: '.rank-list'
  }
};

// 使用 Puppeteer 抓取动态页面
async function fetchWithPuppeteer(source) {
  if (!puppeteer) {
    console.log(`  ⚠️  Puppeteer 未安装，跳过 ${source.name}`);
    return [];
  }
  
  let browser = null;
  
  try {
    console.log(`  🌐 正在使用 Puppeteer 抓取 ${source.name}...`);
    
    // 启动浏览器
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // 设置 User-Agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    // 访问页面
    await page.goto(source.url, {
      waitUntil: 'networkidle2',
      timeout: 15000
    });
    
    // 等待动态内容加载
    if (source.waitFor) {
      await page.waitForSelector(source.waitFor, { timeout: 5000 });
    }
    
    // 提取链接
    const links = await page.evaluate((selector) => {
      const results = [];
      const elements = document.querySelectorAll(selector);
      
      elements.forEach((element, index) => {
        if (index >= 10) return; // 只取前10个
        
        const title = element.textContent.trim();
        const url = element.href;
        
        if (title && url && title.length > 5) {
          results.push({ title, url });
        }
      });
      
      return results;
    }, source.selector);
    
    // 转换为新闻格式
    const news = links.map((item, index) => ({
      id: `dynamic-${Date.now()}-${index}`,
      title: item.title,
      url: item.url,
      source: source.name,
      icon: source.icon,
      category: source.category,
      time: new Date().toISOString(),
      tags: ['动态', '实时']
    }));
    
    console.log(`  ✓ ${source.name}: ${news.length} 篇文章`);
    
    return news;
  } catch (error) {
    console.error(`  ✗ ${source.name}: ${error.message}`);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 抓取所有动态源
async function fetchAllDynamic() {
  console.log('🌐 开始抓取动态页面...');
  const allNews = [];
  const errors = [];
  
  if (!puppeteer) {
    console.log('⚠️  Puppeteer 未安装，跳过动态页面抓取');
    return {
      news: [],
      metadata: {
        total: 0,
        sources: 0,
        errors: Object.keys(DYNAMIC_SOURCES).length,
        timestamp: new Date().toISOString(),
        errorDetails: [{ error: 'Puppeteer not installed' }]
      }
    };
  }
  
  for (const [sourceKey, source] of Object.entries(DYNAMIC_SOURCES)) {
    if (!source.enabled) {
      continue;
    }
    
    try {
      const news = await fetchWithPuppeteer(source);
      allNews.push(...news);
      
      // 延迟避免被封
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      errors.push({ source: source.name, error: error.message });
    }
  }
  
  console.log(`\n✅ 动态页面总计抓取: ${allNews.length} 篇文章`);
  
  return {
    news: allNews,
    metadata: {
      total: allNews.length,
      sources: Object.keys(DYNAMIC_SOURCES).filter(k => DYNAMIC_SOURCES[k].enabled).length,
      errors: errors.length,
      timestamp: new Date().toISOString(),
      errorDetails: errors
    }
  };
}

// API 路由

// 抓取所有动态源
router.get('/fetch', async (req, res) => {
  try {
    const result = await fetchAllDynamic();
    res.json({
      success: true,
      data: result.news,
      metadata: result.metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取动态源列表
router.get('/sources', (req, res) => {
  const sources = Object.entries(DYNAMIC_SOURCES).map(([key, value]) => ({
    id: key,
    name: value.name,
    url: value.url,
    icon: value.icon,
    category: value.category,
    enabled: value.enabled,
    puppeteerAvailable: !!puppeteer
  }));
  
  res.json({
    success: true,
    data: sources,
    puppeteerInstalled: !!puppeteer
  });
});

// 抓取指定动态源
router.get('/fetch/:source', async (req, res) => {
  const sourceKey = req.params.source;
  const source = DYNAMIC_SOURCES[sourceKey];
  
  if (!source) {
    return res.status(404).json({
      success: false,
      error: 'Dynamic source not found'
    });
  }
  
  if (!puppeteer) {
    return res.status(503).json({
      success: false,
      error: 'Puppeteer not installed'
    });
  }
  
  try {
    const news = await fetchWithPuppeteer(source);
    res.json({
      success: true,
      data: news,
      source: {
        id: sourceKey,
        name: source.name,
        icon: source.icon
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
export { fetchAllDynamic };
