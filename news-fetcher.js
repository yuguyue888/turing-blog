import express from 'express';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

const router = express.Router();

// 通用 fetch 函数
async function fetchWithRetry(url, retries = 3) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  };
  
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(url, { 
        headers, 
        signal: controller.signal,
        redirect: 'follow'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
}

// 根据URL判断新闻源并提取内容
function extractContent($, url) {
  let content = '';
  let title = '';
  
  // 提取标题
  title = $('h1').first().text().trim() || $('title').text().trim();
  
  // 根据域名提取内容
  if (url.includes('infoq.cn')) {
    content = $('.article-content').html() || 
              $('.content').html() || 
              $('article').html() || '';
  } else if (url.includes('csdn.net')) {
    content = $('#article_content').html() || 
              $('.article-content').html() || '';
  } else if (url.includes('segmentfault.com')) {
    content = $('.article__content').html() || 
              $('.content').html() || '';
  } else if (url.includes('ithome.com')) {
    content = $('.post-content').html() || 
              $('.content').html() || '';
  } else if (url.includes('oschina.net')) {
    content = $('.article-detail').html() || 
              $('.content').html() || '';
  } else if (url.includes('36kr.com')) {
    content = $('.article-content').html() || 
              $('.content').html() || '';
  } else if (url.includes('huxiu.com')) {
    content = $('.article-content').html() || 
              $('.content').html() || '';
  } else if (url.includes('sspai.com')) {
    content = $('.content').html() || 
              $('article').html() || '';
  } else if (url.includes('github.com')) {
    content = $('.markdown-body').html() || 
              $('article').html() || '';
  } else if (url.includes('dev.to')) {
    content = $('.crayons-article__body').html() || 
              $('article').html() || '';
  } else {
    // 通用提取
    content = $('article').html() || 
              $('.article').html() || 
              $('.content').html() || 
              $('.post').html() || 
              $('main').html() || '';
  }
  
  return { title, content };
}

// 清理HTML内容
function cleanContent(html) {
  if (!html) return '';
  
  const $ = cheerio.load(html);
  
  // 移除不需要的元素
  $('script, style, noscript, iframe, nav, header, footer, aside').remove();
  $('.ad, .advertisement, .sidebar, .comment, .share, .related').remove();
  $('[class*="ad-"], [id*="ad-"]').remove();
  
  // 获取清理后的HTML
  let cleaned = $.html();
  
  // 限制长度
  if (cleaned.length > 100000) {
    cleaned = cleaned.substring(0, 100000) + '...(内容过长已截断)';
  }
  
  return cleaned;
}

// API: 抓取单个URL的完整内容
router.post('/fetch-content', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }
    
    console.log(`📄 抓取文章内容: ${url}`);
    
    const response = await fetchWithRetry(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // 提取内容
    let { title, content } = extractContent($, url);
    
    // 清理内容
    content = cleanContent(content);
    
    // 如果内容为空，返回提示
    if (!content || content.length < 50) {
      content = `
        <div style="padding: 2rem; text-align: center;">
          <p>⚠️ 无法提取文章内容</p>
          <p>这可能是因为：</p>
          <ul style="text-align: left; display: inline-block;">
            <li>网站有反爬虫保护</li>
            <li>内容需要登录才能查看</li>
            <li>网站结构发生变化</li>
          </ul>
          <p style="margin-top: 1rem;">
            <a href="${url}" target="_blank" style="color: #3b82f6;">🔗 查看原文</a>
          </p>
        </div>
      `;
    }
    
    res.json({
      success: true,
      data: {
        title,
        content,
        url,
        fetchedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('抓取失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: {
        content: `
          <div style="padding: 2rem; text-align: center;">
            <p>❌ 内容抓取失败</p>
            <p>错误: ${error.message}</p>
            <p style="margin-top: 1rem;">
              <a href="${req.body.url}" target="_blank" style="color: #3b82f6;">🔗 查看原文</a>
            </p>
          </div>
        `
      }
    });
  }
});

// 简化的新闻列表抓取
async function fetchAllNews() {
  console.log('🕷️  开始抓取新闻列表...');
  
  // 返回示例数据（实际使用时可以从API获取）
  const news = [
    {
      id: `news-${Date.now()}-1`,
      title: 'AI 已能写 80% 代码，但 Agent 也有致命短板！',
      url: 'https://www.infoq.cn/article/bycqtv38Ng71KoUjC0bH',
      source: 'InfoQ',
      icon: '📰',
      category: 'ai',
      time: new Date().toISOString(),
      tags: ['AI', '技术'],
      excerpt: 'OpenAI Codex 技术总监分享了对AI编程能力的最新见解...',
      summary: '',
      content: '' // 内容将在用户点击时实时抓取
    },
    {
      id: `news-${Date.now()}-2`,
      title: 'Docker 24.0 发布：容器启动速度提升40%',
      url: 'https://www.docker.com/blog/',
      source: 'Docker Blog',
      icon: '🐳',
      category: 'tech',
      time: new Date().toISOString(),
      tags: ['Docker', '容器'],
      excerpt: 'Docker发布最新版本，带来重大性能提升...',
      summary: '',
      content: ''
    }
  ];
  
  console.log(`✅ 总计: ${news.length} 篇文章`);
  
  return {
    news,
    metadata: {
      total: news.length,
      sources: 1,
      errors: 0,
      timestamp: new Date().toISOString()
    }
  };
}

router.get('/fetch', async (req, res) => {
  try {
    const result = await fetchAllNews();
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

router.get('/sources', (req, res) => {
  res.json({ success: true, data: [] });
});

export default router;
export { fetchAllNews };
