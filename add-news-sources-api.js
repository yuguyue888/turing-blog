import fs from 'fs-extra';

const serverFile = './server.js';
const content = await fs.readFile(serverFile, 'utf-8');

// 找到新闻API结束的位置（在API Key管理之前）
const insertPoint = content.indexOf('// ==================== API Key 管理 API ====================');

const newsSourcesAPI = `
// ==================== 新闻源管理 API ====================

// 获取所有新闻源
app.get('/api/news-sources', validateApiKey, async (req, res) => {
  try {
    const data = await fs.readJson(join(DATA_DIR, 'news-sources.json'));
    res.json({ success: true, sources: data.sources || {} });
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

`;

const newContent = content.slice(0, insertPoint) + newsSourcesAPI + '\n' + content.slice(insertPoint);

await fs.writeFile(serverFile, newContent, 'utf-8');

console.log('✅ 新闻源管理API已添加到server.js');
