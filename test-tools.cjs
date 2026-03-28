const https = require('https');
const http = require('http');
const fs = require('fs');

const TOOLS_FILE = './src/data/tools.js';
const TIMEOUT = 8000;

// 读取并解析工具数据
const content = fs.readFileSync(TOOLS_FILE, 'utf-8');

// 提取数组部分
const startIdx = content.indexOf('[');
const endIdx = content.lastIndexOf(']') + 1;
const arrayStr = content.substring(startIdx, endIdx);

const tools = eval(arrayStr);

console.log(`📊 开始测试 ${tools.length} 个工具...\n`);

// 测试单个URL
function testUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const timer = setTimeout(() => resolve(false), TIMEOUT);

    try {
      protocol.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }, (res) => {
        clearTimeout(timer);
        resolve(res.statusCode < 500);
      }).on('error', () => {
        clearTimeout(timer);
        resolve(false);
      });
    } catch {
      clearTimeout(timer);
      resolve(false);
    }
  });
}

// 测试所有工具
async function testAll() {
  const valid = [];
  const invalid = [];

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    process.stdout.write(`[${i + 1}/${tools.length}] ${tool.name.padEnd(20)} `);

    const ok = await testUrl(tool.url);

    if (ok) {
      console.log('✅');
      valid.push(tool);
    } else {
      console.log('❌');
      invalid.push(tool);
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ 可访问: ${valid.length} 个`);
  console.log(`❌ 不可访问: ${invalid.length} 个\n`);

  if (invalid.length > 0) {
    console.log('不可访问的工具:');
    invalid.forEach(t => console.log(`  - ${t.name}: ${t.url}`));

    // 生成新的工具文件
    const newContent = `// 默认工具数据 - 已验证可访问（${new Date().toLocaleDateString('zh-CN')}）
export const defaultTools = ${JSON.stringify(valid, null, 2)};
`;
    fs.writeFileSync(TOOLS_FILE, newContent, 'utf-8');
    console.log(`\n✅ 已更新工具列表，删除了 ${invalid.length} 个不可访问的工具`);
  } else {
    console.log('\n✅ 所有工具均可访问！');
  }

  return { valid, invalid };
}

testAll().catch(console.error);
