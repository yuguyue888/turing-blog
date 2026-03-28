import express from 'express';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import RSSParser from 'rss-parser';

const router = express.Router();
const rssParser = new RSSParser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

// RSS 新闻源配置
const RSS_SOURCES = {
  // === 技术博客 ===
  github_blog: {
    name: 'GitHub Blog',
    url: 'https://github.blog/feed',
    icon: '🐙',
    category: 'tech',
    enabled: true
  },
  docker_blog: {
    name: 'Docker Blog',
    url: 'https://www.docker.com/blog/feed/',
    icon: '🐳',
    category: 'tech',
    enabled: true
  },
  kubernetes_blog: {
    name: 'Kubernetes Blog',
    url: 'https://kubernetes.io/feed.xml',
    icon: '☸️',
    category: 'dev',
    enabled: true
  },
  
  // === 国内科技媒体 ===
  infoq_rss: {
    name: 'InfoQ',
    url: 'https://www.infoq.cn/feed',
    icon: '📰',
    category: 'tech',
    enabled: true
  },
  ithome_rss: {
    name: 'IT之家',
    url: 'https://www.ithome.com/rss/',
    icon: '🏠',
    category: 'tech',
    enabled: true
  },
  
  // === 国际科技媒体 ===
  techcrunch: {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    icon: '🚀',
    category: 'tech',
    enabled: true
  },
  the_verge: {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    icon: '📱',
    category: 'tech',
    enabled: true
  },
  
  // === 开源社区 ===
  oschina_rss: {
    name: '开源中国',
    url: 'https://www.oschina.net/news/rss',
    icon: '🇨🇳',
    category: 'opensource',
    enabled: true
  },
  
  // === 商业科技 ===
  huxiu_rss: {
    name: '虎嗅',
    url: 'https://www.huxiu.com/rss/0.xml',
    icon: '🐅',
    category: 'business',
    enabled: true
  }
};

// 解析 RSS 源
async function parseRSS(source) {
  try {
    console.log(`  📰 正在抓取 ${source.name} RSS...`);
    
    const feed = await rssParser.parseURL(source.url);
    const news = [];
    
    feed.items.slice(0, 10).forEach((item, index) => {
      news.push({
        id: `rss-${Date.now()}-${index}`,
        title: item.title || '无标题',
        url: item.link || item.url || '',
        source: source.name,
        icon: source.icon,
        category: source.category,
        time: item.pubDate || item.isoDate || new Date().toISOString(),
        tags: extractTags(item),
        summary: item.contentSnippet || item.summary || '',
        content: item.content || item['content:encoded'] || ''
      });
    });
    
    console.log(`  ✓ ${source.name}: ${news.length} 篇文章`);
    return news;
  } catch (error) {
    console.error(`  ✗ ${source.name}: ${error.message}`);
    return [];
  }
}

// 从 RSS 项目中提取标签
function extractTags(item) {
  const tags = [];
  
  if (item.categories) {
    tags.push(...item.categories.slice(0, 3));
  }
  
  if (item.creator) {
    tags.push(item.creator);
  }
  
  return tags.length > 0 ? tags : ['资讯'];
}

// 抓取所有 RSS 源
async function fetchAllRSS() {
  console.log('📰 开始抓取 RSS 新闻源...');
  const allNews = [];
  const errors = [];
  
  for (const [sourceKey, source] of Object.entries(RSS_SOURCES)) {
    if (!source.enabled) {
      continue;
    }
    
    try {
      const news = await parseRSS(source);
      allNews.push(...news);
      
      // 延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      errors.push({ source: source.name, error: error.message });
    }
  }
  
  console.log(`\n✅ RSS 总计抓取: ${allNews.length} 篇文章`);
  
  return {
    news: allNews,
    metadata: {
      total: allNews.length,
      sources: Object.keys(RSS_SOURCES).filter(k => RSS_SOURCES[k].enabled).length,
      errors: errors.length,
      timestamp: new Date().toISOString(),
      errorDetails: errors
    }
  };
}

// API 路由

// 抓取所有 RSS
router.get('/fetch', async (req, res) => {
  try {
    const result = await fetchAllRSS();
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

// 获取 RSS 源列表
router.get('/sources', (req, res) => {
  const sources = Object.entries(RSS_SOURCES).map(([key, value]) => ({
    id: key,
    name: value.name,
    url: value.url,
    icon: value.icon,
    category: value.category,
    enabled: value.enabled
  }));
  
  res.json({
    success: true,
    data: sources
  });
});

// 抓取指定源
router.get('/fetch/:source', async (req, res) => {
  const sourceKey = req.params.source;
  const source = RSS_SOURCES[sourceKey];
  
  if (!source) {
    return res.status(404).json({
      success: false,
      error: 'RSS source not found'
    });
  }
  
  try {
    const news = await parseRSS(source);
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
export { fetchAllRSS };
