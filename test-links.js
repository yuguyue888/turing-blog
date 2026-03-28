// 测试AI导航链接的可访问性
import fetch from 'node-fetch';
import fs from 'fs';

const TOOLS_FILE = './src/data/tools.js';
const TIMEOUT = 10000; // 10秒超时

// 读取工具数据
const toolsContent = fs.readFileSync(TOOLS_FILE, 'utf-8');
const toolsMatch = toolsContent.match(/export const defaultTools = \[([\s\S]*?)\];/);
const toolsCode = `const defaultTools = [${toolsMatch[1]}];`;
eval(toolsCode);

console.log(`📊 共找到 ${defaultTools.length} 个工具\n`);

// 测试单个URL
async function testUrl(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    clearTimeout(timeoutId);
    return response.ok || response.status < 500;
  } catch (error) {
    return false;
  }
}

// 测试所有工具
async function testAllTools() {
  const validTools = [];
  const invalidTools = [];

  for (let i = 0; i < defaultTools.length; i++) {
    const tool = defaultTools[i];
    process.stdout.write(`[${i + 1}/${defaultTools.length}] 测试 ${tool.name}... `);

    const isValid = await testUrl(tool.url);

    if (isValid) {
      console.log('✅ 可访问');
      validTools.push(tool);
    } else {
      console.log('❌ 不可访问');
      invalidTools.push(tool);
    }

    // 延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ 可访问: ${validTools.length} 个`);
  console.log(`❌ 不可访问: ${invalidTools.length} 个\n`);

  if (invalidTools.length > 0) {
    console.log('不可访问的工具列表:');
    invalidTools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.url}`);
    });
  }

  return { validTools, invalidTools };
}

testAllTools();
