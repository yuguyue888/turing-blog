import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs-extra';
import newsFetcher from './news-fetcher.js';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 数据存储路径
const DATA_DIR = join(__dirname, 'data');
const API_KEYS_FILE = join(DATA_DIR, 'api-keys.json');
const EMAIL_CONFIG_FILE = join(DATA_DIR, 'email-config.json');
const NEWS_SOURCES_FILE = join(DATA_DIR, 'news-sources.json');

// 确保数据目录存在
await fs.ensureDir(DATA_DIR);

// 邮件配置管理
async function loadEmailConfig() {
  try {
    return await fs.readJson(EMAIL_CONFIG_FILE);
  } catch {
    const defaultConfig = {
      enabled: false,
      smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        user: '',
        pass: ''
      },
      recipient: '',
      notifications: {
        systemErrors: true,
        newsSourceFailures: true,
        dailyDigest: false
      }
    };
    await fs.writeJson(EMAIL_CONFIG_FILE, defaultConfig, { spaces: 2 });
    return defaultConfig;
  }
}

async function saveEmailConfig(config) {
  await fs.writeJson(EMAIL_CONFIG_FILE, config, { spaces: 2 });
}

// 邮件发送函数
async function sendEmail(subject, content) {
  try {
    const config = await loadEmailConfig();
    
    if (!config.enabled || !config.recipient) {
      console.log('邮件未启用或未配置收件人');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      }
    });

    await transporter.sendMail({
      from: config.smtp.user,
      to: config.recipient,
      subject: `[图灵博客] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
            ${subject}
          </h2>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            ${content}
          </div>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            此邮件由图灵博客系统自动发送<br>
            时间: ${new Date().toLocaleString('zh-CN')}
          </p>
        </div>
      `
    });

    console.log('邮件发送成功:', subject);
    return true;
  } catch (error) {
    console.error('邮件发送失败:', error);
    return false;
  }
}

// 错误通知函数
async function sendErrorNotification(errorType, errorDetails) {
  const config = await loadEmailConfig();
  
  if (!config.enabled || !config.notifications.systemErrors) {
    return;
  }

  const subject = `系统错误: ${errorType}`;
  const content = `
    <h3>错误类型</h3>
    <p><strong>${errorType}</strong></p>
    
    <h3>错误详情</h3>
    <pre style="background: #fff; padding: 10px; border-radius: 4px; overflow-x: auto;">
${JSON.stringify(errorDetails, null, 2)}
    </pre>
    
    <h3>发生时间</h3>
    <p>${new Date().toLocaleString('zh-CN')}</p>
  `;

  await sendEmail(subject, content);
}

// 新闻源失败通知
async function sendNewsSourceFailureNotification(sourceName, failureCount) {
  const config = await loadEmailConfig();
  
  if (!config.enabled || !config.notifications.newsSourceFailures) {
    return;
  }

  const subject = `新闻源异常: ${sourceName}`;
  const content = `
    <h3>新闻源信息</h3>
    <p><strong>名称:</strong> ${sourceName}</p>
    <p><strong>连续失败次数:</strong> ${failureCount}/3</p>
    
    <h3>状态</h3>
    <p style="color: #ef4444; font-weight: bold;">
      ⚠️ 该新闻源已被自动禁用
    </p>
    
    <h3>建议操作</h3>
    <ul>
      <li>检查网站是否可访问</li>
      <li>验证RSS链接是否有效</li>
      <li>考虑更换其他新闻源</li>
    </ul>
    
    <h3>操作链接</h3>
    <a href="http://localhost:5173/#/admin" 
       style="background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
      前往管理后台
    </a>
  `;

  await sendEmail(subject, content);
}

// API Key 管理
async function loadApiKeys() {
  try {
    return await fs.readJson(API_KEYS_FILE);
  } catch {
    const defaultKeys = {
      keys: [
        {
          id: 'default',
          name: 'Default API Key',
          key: 'sk-turing-blog-default-key-2026',
          createdAt: new Date().toISOString(),
          lastUsed: null,
          permissions: ['articles:read', 'articles:write', 'tools:read', 'tools:write', 'news:read', 'news:write']
        }
      ]
    };
    await fs.writeJson(API_KEYS_FILE, defaultKeys, { spaces: 2 });
    return defaultKeys;
  }
}

async function saveApiKeys(data) {
  await fs.writeJson(API_KEYS_FILE, data, { spaces: 2 });
}

// API Key 验证中间件
async function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API Key is required' });
  }
  
  const keysData = await loadApiKeys();
  const keyObj = keysData.keys.find(k => k.key === apiKey);
  
  if (!keyObj) {
    return res.status(403).json({ error: 'Invalid API Key' });
  }
  
  // 更新最后使用时间
  keyObj.lastUsed = new Date().toISOString();
  await saveApiKeys(keysData);
  
  req.apiKey = keyObj;
  next();
}

// 权限检查中间件
function checkPermission(resource, action) {
  return (req, res, next) => {
    const permission = `${resource}:${action}`;
    if (!req.apiKey.permissions.includes(permission)) {
      return res.status(403).json({ error: `Permission denied: ${permission}` });
    }
    next();
  };
}

// ==================== 文章 API ====================

// 获取所有文章
app.get('/api/articles', validateApiKey, checkPermission('articles', 'read'), async (req, res) => {
  try {
    const data = await fs.readJson(join(DATA_DIR, 'articles.json'));
    res.json({ success: true, data: data.articles || [] });
  } catch {
    res.json({ success: true, data: [] });
  }
});

// 获取单个文章
app.get('/api/articles/:id', validateApiKey, checkPermission('articles', 'read'), async (req, res) => {
  try {
    const data = await fs.readJson(join(DATA_DIR, 'articles.json'));
    const article = data.articles.find(a => a.id === req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json({ success: true, data: article });
  } catch {
    res.status(404).json({ error: 'Article not found' });
  }
});

// 创建文章
app.post('/api/articles', validateApiKey, checkPermission('articles', 'write'), async (req, res) => {
  try {
    const article = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    let data = { articles: [] };
    try {
      data = await fs.readJson(join(DATA_DIR, 'articles.json'));
    } catch {}
    
    data.articles.unshift(article);
    await fs.writeJson(join(DATA_DIR, 'articles.json'), data, { spaces: 2 });
    
    res.json({ success: true, data: article, message: 'Article created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create article', details: error.message });
  }
});

// 更新文章
app.put('/api/articles/:id', validateApiKey, checkPermission('articles', 'write'), async (req, res) => {
  try {
    const data = await fs.readJson(join(DATA_DIR, 'articles.json'));
    const index = data.articles.findIndex(a => a.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    data.articles[index] = {
      ...data.articles[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeJson(join(DATA_DIR, 'articles.json'), data, { spaces: 2 });
    
    res.json({ success: true, data: data.articles[index], message: 'Article updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update article', details: error.message });
  }
});

// 删除文章
app.delete('/api/articles/:id', validateApiKey, checkPermission('articles', 'write'), async (req, res) => {
  try {
    const data = await fs.readJson(join(DATA_DIR, 'articles.json'));
    const index = data.articles.findIndex(a => a.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    data.articles.splice(index, 1);
    await fs.writeJson(join(DATA_DIR, 'articles.json'), data, { spaces: 2 });
    
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete article', details: error.message });
  }
});

// ==================== 工具 API ====================

// 获取所有工具
app.get('/api/tools', validateApiKey, checkPermission('tools', 'read'), async (req, res) => {
  try {
    const data = await fs.readJson(join(DATA_DIR, 'tools.json'));
    res.json({ success: true, data: data.tools || [] });
  } catch {
    res.json({ success: true, data: [] });
  }
});

// 创建工具
app.post('/api/tools', validateApiKey, checkPermission('tools', 'write'), async (req, res) => {
  try {
    const tool = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    let data = { tools: [] };
    try {
      data = await fs.readJson(join(DATA_DIR, 'tools.json'));
    } catch {}
    
    data.tools.unshift(tool);
    await fs.writeJson(join(DATA_DIR, 'tools.json'), data, { spaces: 2 });
    
    res.json({ success: true, data: tool, message: 'Tool created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tool', details: error.message });
  }
});

// 更新工具
app.put('/api/tools/:id', validateApiKey, checkPermission('tools', 'write'), async (req, res) => {
  try {
    const data = await fs.readJson(join(DATA_DIR, 'tools.json'));
    const index = data.tools.findIndex(t => t.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    
    data.tools[index] = { ...data.tools[index], ...req.body };
    await fs.writeJson(join(DATA_DIR, 'tools.json'), data, { spaces: 2 });
    
    res.json({ success: true, data: data.tools[index], message: 'Tool updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tool', details: error.message });
  }
});

// 删除工具
app.delete('/api/tools/:id', validateApiKey, checkPermission('tools', 'write'), async (req, res) => {
  try {
    const data = await fs.readJson(join(DATA_DIR, 'tools.json'));
    const index = data.tools.findIndex(t => t.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    
    data.tools.splice(index, 1);
    await fs.writeJson(join(DATA_DIR, 'tools.json'), data, { spaces: 2 });
    
    res.json({ success: true, message: 'Tool deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tool', details: error.message });
  }
});

// ==================== 新闻 API ====================

// 获取所有新闻
app.get('/api/news', validateApiKey, checkPermission('news', 'read'), async (req, res) => {
  try {
    const data = await fs.readJson(join(DATA_DIR, 'news.json'));
    res.json({ success: true, data: data.news || [] });
  } catch {
    res.json({ success: true, data: [] });
  }
});

// 创建新闻
app.post('/api/news', validateApiKey, checkPermission('news', 'write'), async (req, res) => {
  try {
    const news = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    let data = { news: [] };
    try {
      data = await fs.readJson(join(DATA_DIR, 'news.json'));
    } catch {}
    
    data.news.unshift(news);
    await fs.writeJson(join(DATA_DIR, 'news.json'), data, { spaces: 2 });
    
    res.json({ success: true, data: news, message: 'News created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create news', details: error.message });
  }
});

// 更新新闻
app.put('/api/news/:id', validateApiKey, checkPermission('news', 'write'), async (req, res) => {
  try {
    const data = await fs.readJson(join(DATA_DIR, 'news.json'));
    const index = data.news.findIndex(n => n.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'News not found' });
    }
    
    data.news[index] = { ...data.news[index], ...req.body };
    await fs.writeJson(join(DATA_DIR, 'news.json'), data, { spaces: 2 });
    
    res.json({ success: true, data: data.news[index], message: 'News updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update news', details: error.message });
  }
});

// 删除新闻
app.delete('/api/news/:id', validateApiKey, checkPermission('news', 'write'), async (req, res) => {
  try {
    const data = await fs.readJson(join(DATA_DIR, 'news.json'));
    const index = data.news.findIndex(n => n.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'News not found' });
    }
    
    data.news.splice(index, 1);
    await fs.writeJson(join(DATA_DIR, 'news.json'), data, { spaces: 2 });
    
    res.json({ success: true, message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete news', details: error.message });
  }
});


// ==================== 新闻源管理 API ====================

// 获取所有新闻源
app.get('/api/news-sources', validateApiKey, async (req, res) => {
  try {
    const sources = await fs.readJson(join(DATA_DIR, 'news-sources.json'));
    res.json({ success: true, sources: sources || {} });
  } catch {
    res.json({ success: true, sources: {} });
  }
});

// 添加新闻源
app.post('/api/news-sources/add', validateApiKey, checkPermission('news', 'write'), async (req, res) => {
  try {
    const { name, url, type = 'website', category = 'tech', isEnglish = false } = req.body;
    
    if (!name || !url) {
      return res.status(400).json({ success: false, message: '名称和URL不能为空' });
    }
    
    // 读取现有数据，如果不存在则创建空对象
    let sources = {};
    try {
      sources = await fs.readJson(join(DATA_DIR, 'news-sources.json'));
    } catch {
      sources = {};
    }
    
    const key = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    
    if (sources[key]) {
      return res.status(400).json({ success: false, message: '该新闻源已存在' });
    }
    
    sources[key] = {
      name,
      url,
      type,
      category,
      isEnglish,
      icon: type === 'rss' ? '📡' : '🌐',
      enabled: true,
      failures: 0,
      addedAt: new Date().toISOString()
    };
    
    await fs.writeJson(join(DATA_DIR, 'news-sources.json'), sources, { spaces: 2 });
    
    res.json({ success: true, message: '新闻源添加成功', source: sources[key] });
  } catch (error) {
    res.status(500).json({ success: false, message: '添加失败', error: error.message });
  }
});

// 更新新闻源
app.patch('/api/news-sources/:key', validateApiKey, checkPermission('news', 'write'), async (req, res) => {
  try {
    const data = await fs.readJson(join(DATA_DIR, 'news-sources.json'));
    
    if (!data.sources[req.params.key]) {
      return res.status(404).json({ success: false, message: '新闻源不存在' });
    }
    
    data.sources[req.params.key] = {
      ...data.sources[req.params.key],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    // 如果重新启用，重置失败计数
    if (req.body.enabled === true) {
      data.sources[req.params.key].failures = 0;
    }
    
    await fs.writeJson(join(DATA_DIR, 'news-sources.json'), data, { spaces: 2 });
    
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新失败', error: error.message });
  }
});

// 删除新闻源
app.delete('/api/news-sources/:key', validateApiKey, checkPermission('news', 'write'), async (req, res) => {
  try {
    const data = await fs.readJson(join(DATA_DIR, 'news-sources.json'));
    
    if (!data.sources[req.params.key]) {
      return res.status(404).json({ success: false, message: '新闻源不存在' });
    }
    
    delete data.sources[req.params.key];
    await fs.writeJson(join(DATA_DIR, 'news-sources.json'), data, { spaces: 2 });
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除失败', error: error.message });
  }
});

// 测试所有新闻源
app.post('/api/news-sources/test', validateApiKey, checkPermission('news', 'write'), async (req, res) => {
  try {
    const data = await fs.readJson(join(DATA_DIR, 'news-sources.json'));
    let valid = 0;
    let invalid = 0;
    
    for (const [key, source] of Object.entries(data.sources)) {
      if (!source.enabled) continue;
      
      try {
        const response = await fetch(source.url, {
          method: 'HEAD',
          timeout: 5000
        });
        
        if (response.ok) {
          valid++;
          data.sources[key].lastSuccess = new Date().toISOString();
          data.sources[key].failures = 0;
        } else {
          invalid++;
          data.sources[key].failures = (data.sources[key].failures || 0) + 1;
          if (data.sources[key].failures >= 3) {
            data.sources[key].enabled = false;
          }
        }
      } catch {
        invalid++;
        data.sources[key].failures = (data.sources[key].failures || 0) + 1;
        if (data.sources[key].failures >= 3) {
          data.sources[key].enabled = false;
        }
      }
    }
    
    await fs.writeJson(join(DATA_DIR, 'news-sources.json'), data, { spaces: 2 });
    
    res.json({ success: true, valid, invalid });
  } catch (error) {
    res.status(500).json({ success: false, message: '测试失败', error: error.message });
  }
});

// 重置所有新闻源
app.post('/api/news-sources/reset', validateApiKey, checkPermission('news', 'write'), async (req, res) => {
  try {
    const data = await fs.readJson(join(DATA_DIR, 'news-sources.json'));
    
    for (const key of Object.keys(data.sources)) {
      data.sources[key].enabled = true;
      data.sources[key].failures = 0;
    }
    
    await fs.writeJson(join(DATA_DIR, 'news-sources.json'), data, { spaces: 2 });
    
    res.json({ success: true, message: '重置成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '重置失败', error: error.message });
  }
});


// ==================== API Key 管理 API ====================

// 获取所有 API Keys（需要特殊权限）
app.get('/api/api-keys', validateApiKey, async (req, res) => {
  try {
    const data = await loadApiKeys();
    // 隐藏完整的 key，只显示部分
    const keys = data.keys.map(k => ({
      ...k,
      key: k.key.substring(0, 10) + '...' + k.key.substring(k.key.length - 4)
    }));
    res.json({ success: true, data: keys });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load API keys', details: error.message });
  }
});

// 创建新的 API Key
app.post('/api/api-keys', validateApiKey, async (req, res) => {
  try {
    const { name, permissions } = req.body;
    const newKey = {
      id: Date.now().toString(),
      name: name || 'New API Key',
      key: `sk-turing-blog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      permissions: permissions || ['articles:read', 'tools:read', 'news:read']
    };
    
    const data = await loadApiKeys();
    data.keys.push(newKey);
    await saveApiKeys(data);
    
    res.json({ success: true, data: newKey, message: 'API Key created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create API key', details: error.message });
  }
});

// 删除 API Key
app.delete('/api/api-keys/:id', validateApiKey, async (req, res) => {
  try {
    const data = await loadApiKeys();
    const index = data.keys.findIndex(k => k.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'API Key not found' });
    }
    
    // 不能删除最后一个 key
    if (data.keys.length === 1) {
      return res.status(400).json({ error: 'Cannot delete the last API key' });
    }
    
    data.keys.splice(index, 1);
    await saveApiKeys(data);
    
    res.json({ success: true, message: 'API Key deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete API key', details: error.message });
  }
});

// ==================== 统计 API ====================

app.get('/api/stats', validateApiKey, async (req, res) => {
  try {
    const articles = await fs.readJson(join(DATA_DIR, 'articles.json')).catch(() => ({ articles: [] }));
    const tools = await fs.readJson(join(DATA_DIR, 'tools.json')).catch(() => ({ tools: [] }));
    const news = await fs.readJson(join(DATA_DIR, 'news.json')).catch(() => ({ news: [] }));
    
    res.json({
      success: true,
      data: {
        articles: articles.articles.length,
        tools: tools.tools.length,
        news: news.news.length,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats', details: error.message });
  }
});

// ==================== 批量操作 API ====================

// 批量创建文章
app.post('/api/articles/batch', validateApiKey, checkPermission('articles', 'write'), async (req, res) => {
  try {
    const { articles } = req.body;
    if (!Array.isArray(articles)) {
      return res.status(400).json({ error: 'Articles must be an array' });
    }
    
    let data = { articles: [] };
    try {
      data = await fs.readJson(join(DATA_DIR, 'articles.json'));
    } catch {}
    
    const newArticles = articles.map(article => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...article,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    data.articles = [...newArticles, ...data.articles];
    await fs.writeJson(join(DATA_DIR, 'articles.json'), data, { spaces: 2 });
    
    res.json({ 
      success: true, 
      data: newArticles, 
      count: newArticles.length,
      message: `Successfully created ${newArticles.length} articles` 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to batch create articles', details: error.message });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 文档
app.get('/api', (req, res) => {
  res.json({
    name: 'Turing Blog API',
    version: '1.0.0',
    description: 'RESTful API for managing Turing Blog',
    authentication: {
      type: 'API Key',
      header: 'X-API-Key',
      queryParam: 'apiKey'
    },
    endpoints: {
      articles: {
        'GET /api/articles': 'Get all articles',
        'GET /api/articles/:id': 'Get single article',
        'POST /api/articles': 'Create article',
        'PUT /api/articles/:id': 'Update article',
        'DELETE /api/articles/:id': 'Delete article',
        'POST /api/articles/batch': 'Batch create articles'
      },
      tools: {
        'GET /api/tools': 'Get all tools',
        'POST /api/tools': 'Create tool',
        'PUT /api/tools/:id': 'Update tool',
        'DELETE /api/tools/:id': 'Delete tool'
      },
      news: {
        'GET /api/news': 'Get all news',
        'POST /api/news': 'Create news',
        'PUT /api/news/:id': 'Update news',
        'DELETE /api/news/:id': 'Delete news'
      },
      'api-keys': {
        'GET /api/api-keys': 'Get all API keys',
        'POST /api/api-keys': 'Create API key',
        'DELETE /api/api-keys/:id': 'Delete API key'
      },
      stats: {
        'GET /api/stats': 'Get blog statistics'
      }
    }
  });
});

// ==================== 邮件配置 API ====================

// 获取邮件配置
app.get('/api/email-config', validateApiKey, async (req, res) => {
  try {
    const config = await loadEmailConfig();
    // 不返回密码
    const safeConfig = {
      ...config,
      smtp: {
        ...config.smtp,
        password: '******'
      }
    };
    res.json({ success: true, config: safeConfig });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 保存邮件配置
app.post('/api/email-config', validateApiKey, async (req, res) => {
  try {
    const config = req.body;
    
    // 如果密码是******，保留原密码
    if (config.smtp.password === '******') {
      const oldConfig = await loadEmailConfig();
      config.smtp.password = oldConfig.smtp.password;
    }
    
    await saveEmailConfig(config);
    res.json({ success: true, message: '邮件配置已保存' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 测试邮件发送
app.post('/api/email-config/test', validateApiKey, async (req, res) => {
  try {
    const config = await loadEmailConfig();
    
    if (!config.enabled) {
      return res.json({ success: false, message: '邮件通知未启用' });
    }
    
    const result = await sendEmail('测试邮件', `
      <h3>邮件测试</h3>
      <p>这是一封测试邮件，用于验证邮件配置是否正确。</p>
      <p>发送时间: ${new Date().toLocaleString('zh-CN')}</p>
    `);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 手动发送系统错误通知
app.post('/api/email-config/notify-error', validateApiKey, async (req, res) => {
  try {
    const { errorType, errorMessage, stackTrace } = req.body;
    
    await sendSystemErrorNotification(errorType, errorMessage, stackTrace);
    res.json({ success: true, message: '错误通知已发送' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 新闻抓取 API ====================

// 新闻抓取路由
app.use('/api/news-fetcher', newsFetcher);

// 自动抓取并保存新闻
app.post('/api/news/auto-fetch', validateApiKey, checkPermission('news', 'write'), async (req, res) => {
  try {
    const result = await fetchAllNews();
    
    if (result.news.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch any news',
        metadata: result.metadata
      });
    }
    
    // 保存到新闻数据文件
    let data = { news: [] };
    try {
      data = await fs.readJson(join(DATA_DIR, 'news.json'));
    } catch {}
    
    // 添加新新闻到开头（去重）
    const existingUrls = new Set(data.news.map(n => n.url));
    const newNews = result.news.filter(n => !existingUrls.has(n.url));
    data.news = [...newNews, ...data.news].slice(0, 100); // 保留最新100条
    
    await fs.writeJson(join(DATA_DIR, 'news.json'), data, { spaces: 2 });
    
    res.json({
      success: true,
      data: {
        fetched: result.news.length,
        added: newNews.length,
        total: data.news.length
      },
      metadata: result.metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to auto-fetch news',
      details: error.message
    });
  }
});

// 定时任务：每天9点自动抓取新闻
import { fetchAllNews } from './news-fetcher.js';

let newsFetchInterval;

function startNewsScheduler() {
  // 每天抓取一次
  const FETCH_INTERVAL = 24 * 60 * 60 * 1000; // 24小时
  
  // 立即执行一次
  scheduleNewsFetch();
  
  // 设置定时任务
  newsFetchInterval = setInterval(scheduleNewsFetch, FETCH_INTERVAL);
  
  console.log('📰 News scheduler started (every 24 hours)');
}

async function scheduleNewsFetch() {
  try {
    console.log('⏰ Scheduled news fetch started...');
    const result = await fetchAllNews();
    
    if (result.news.length > 0) {
      let data = { news: [] };
      try {
        data = await fs.readJson(join(DATA_DIR, 'news.json'));
      } catch {}
      
      // 去重并保存
      const existingUrls = new Set(data.news.map(n => n.url));
      const newNews = result.news.filter(n => !existingUrls.has(n.url));
      data.news = [...newNews, ...data.news].slice(0, 100);
      
      await fs.writeJson(join(DATA_DIR, 'news.json'), data, { spaces: 2 });
      console.log(`✅ Auto-fetched ${newNews.length} new articles`);
    }
  } catch (error) {
    console.error('❌ Scheduled news fetch failed:', error.message);
  }
}

// ==================== AI 摘要 API ====================

// 生成AI摘要
app.post('/api/ai/summarize', validateApiKey, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }
    
    // 模拟AI摘要生成（实际应用中应该调用真实的AI API）
    const summary = generateSummary(title, content);
    
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate summary',
      details: error.message
    });
  }
});

// 简单的摘要生成函数（模拟）
function generateSummary(title, content) {
  // 移除HTML标签
  const plainText = content
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // 如果有标题，从内容中提取关键句
  if (plainText.length < 100) {
    return plainText;
  }
  
  // 提取前200个字符作为摘要
  let summary = plainText.substring(0, 200);
  
  // 尝试在句号、问号、感叹号处截断
  const lastPunctuation = Math.max(
    summary.lastIndexOf('。'),
    summary.lastIndexOf('！'),
    summary.lastIndexOf('？'),
    summary.lastIndexOf('.')
  );
  
  if (lastPunctuation > 50) {
    summary = summary.substring(0, lastPunctuation + 1);
  } else {
    summary += '...';
  }
  
  return summary;
}

// 启动服务器
app.listen(PORT, () => {

// ==================== 认证相关 API ====================

// 修改密码
app.post('/api/change-password', validateApiKey, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    
    // 读取当前密码
    const dataDir = path.join(__dirname, 'data')
    const credentialsPath = path.join(dataDir, 'credentials.json')
    
    let credentials = { username: 'admin', password: 'admin123' }
    
    if (fs.existsSync(credentialsPath)) {
      credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'))
    }
    
    // 验证当前密码
    if (currentPassword !== credentials.password) {
      return res.status(400).json({
        success: false,
        error: '当前密码不正确'
      })
    }
    
    // 验证新密码强度
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: '密码至少需要8个字符'
      })
    }
    
    // 更新密码
    credentials.password = newPassword
    
    // 保存到文件
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2))
    
    res.json({
      success: true,
      message: '密码修改成功'
    })
    
    console.log('✅ 管理员密码已修改')
    
  } catch (error) {
    console.error('修改密码失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器错误'
    })
  }
})

  console.log(`🚀 Turing Blog API Server running at http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🔑 Default API Key: sk-turing-blog-default-key-2026`);
  console.log(`📰 News Fetcher: http://localhost:${PORT}/api/news-fetcher/fetch`);
  
  // 启动新闻定时抓取
  startNewsScheduler();
});
