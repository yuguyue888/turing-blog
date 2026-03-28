import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, 'data');
const DEFAULT_SOURCES_FILE = join(DATA_DIR, 'default-news-sources.json');
const CURRENT_SOURCES_FILE = join(DATA_DIR, 'news-sources.json');

async function mergeSources() {
  try {
    // 读取默认新闻源
    const defaultSources = await fs.readJson(DEFAULT_SOURCES_FILE);
    console.log(`📖 读取到 ${Object.keys(defaultSources).length} 个默认新闻源`);

    // 读取当前新闻源
    let currentSources = {};
    try {
      currentSources = await fs.readJson(CURRENT_SOURCES_FILE);
      console.log(`📖 读取到 ${Object.keys(currentSources).length} 个现有新闻源`);
    } catch {
      console.log('📝 未找到现有新闻源文件，将创建新文件');
    }

    // 合并新闻源（保留用户的自定义源和状态）
    const mergedSources = { ...defaultSources };

    // 添加用户自定义源
    for (const [key, source] of Object.entries(currentSources)) {
      if (!source.isDefault) {
        mergedSources[key] = source;
        console.log(`✅ 保留用户源: ${source.name}`);
      } else {
        // 对于默认源，保留用户的启用/禁用状态和失败计数
        if (mergedSources[key]) {
          mergedSources[key].enabled = source.enabled;
          mergedSources[key].failures = source.failures || 0;
          mergedSources[key].lastSuccess = source.lastSuccess || null;
          console.log(`🔄 更新默认源状态: ${source.name} (enabled: ${source.enabled})`);
        }
      }
    }

    // 保存合并后的新闻源
    await fs.writeJson(CURRENT_SOURCES_FILE, mergedSources, { spaces: 2 });
    console.log(`\n✅ 成功合并 ${Object.keys(mergedSources).length} 个新闻源！`);

    // 统计信息
    const stats = {
      total: Object.keys(mergedSources).length,
      enabled: Object.values(mergedSources).filter(s => s.enabled).length,
      disabled: Object.values(mergedSources).filter(s => !s.enabled).length,
      english: Object.values(mergedSources).filter(s => s.isEnglish).length,
      chinese: Object.values(mergedSources).filter(s => !s.isEnglish).length
    };

    console.log('\n📊 统计信息:');
    console.log(`   总计: ${stats.total} 个`);
    console.log(`   启用: ${stats.enabled} 个`);
    console.log(`   禁用: ${stats.disabled} 个`);
    console.log(`   中文: ${stats.chinese} 个`);
    console.log(`   英文: ${stats.english} 个`);

    return stats;
  } catch (error) {
    console.error('❌ 合并失败:', error.message);
    throw error;
  }
}

mergeSources();
