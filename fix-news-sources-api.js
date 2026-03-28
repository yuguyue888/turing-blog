import fs from 'fs-extra';

const serverFile = './server.js';
let content = await fs.readFile(serverFile, 'utf-8');

// 找到并替换添加新闻源的API
const oldAddAPI = `// 添加新闻源
app.post('/api/news-sources/add', validateApiKey, checkPermission('news', 'write'), async (req, res) => {
  try {
    const { name, url, type = 'website', category = 'tech', isEnglish = false } = req.body;
    
    if (!name || !url) {
      return res.status(400).json({ success: false, message: '名称和URL不能为空' });
    }
    
    let data = { sources: {} };
    try {
      data = await fs.readJson(join(DATA_DIR, 'news-sources.json'));
    } catch {}
    
    const key = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    
    if (data.sources[key]) {
      return res.status(400).json({ success: false, message: '该新闻源已存在' });
    }
    
    data.sources[key] = {
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
    
    await fs.writeJson(join(DATA_DIR, 'news-sources.json'), data, { spaces: 2 });
    
    res.json({ success: true, message: '新闻源添加成功', source: data.sources[key] });
  } catch (error) {
    res.status(500).json({ success: false, message: '添加失败', error: error.message });
  }
});`;

const newAddAPI = `// 添加新闻源
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
});`;

content = content.replace(oldAddAPI, newAddAPI);

// 同样修复获取所有新闻源的API
const oldGetAPI = `// 获取所有新闻源
app.get('/api/news-sources', validateApiKey, async (req, res) => {
  try {
    const data = await fs.readJson(join(DATA_DIR, 'news-sources.json'));
    res.json({ success: true, sources: data.sources || {} });
  } catch {
    res.json({ success: true, sources: {} });
  }
});`;

const newGetAPI = `// 获取所有新闻源
app.get('/api/news-sources', validateApiKey, async (req, res) => {
  try {
    const sources = await fs.readJson(join(DATA_DIR, 'news-sources.json'));
    res.json({ success: true, sources: sources || {} });
  } catch {
    res.json({ success: true, sources: {} });
  }
});`;

content = content.replace(oldGetAPI, newGetAPI);

await fs.writeFile(serverFile, content, 'utf-8');

console.log('✅ API已修复');
