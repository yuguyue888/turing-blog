<template>
  <div class="editor-page">
    <div class="editor-header">
      <div class="header-left">
        <button @click="goBack" class="back-btn">← 返回</button>
        <h2>{{ isEdit ? '编辑文章' : '发布新文章' }}</h2>
      </div>
      <div class="header-actions">
        <button @click="toggleSidebar" class="sidebar-toggle">
          {{ showSidebar ? '隐藏设置' : '显示设置' }}
        </button>
        <button @click="saveDraft" class="draft-btn" :disabled="saving">
          {{ saving ? '保存中...' : '保存草稿' }}
        </button>
        <button @click="publish" class="publish-btn" :disabled="saving">
          {{ saving ? '发布中...' : (isEdit ? '更新文章' : '发布文章') }}
        </button>
      </div>
    </div>

    <div class="editor-container">
      <!-- 主编辑区 -->
      <div class="editor-main" :class="{ 'full-width': !showSidebar }">
        <div class="editor-title">
          <input 
            v-model="article.title" 
            type="text" 
            placeholder="请输入文章标题..."
            class="title-input"
          />
        </div>

        <div class="editor-toolbar">
          <div class="toolbar-group">
            <button @click="execCommand('bold')" title="粗体 (Ctrl+B)">
              <strong>B</strong>
            </button>
            <button @click="execCommand('italic')" title="斜体 (Ctrl+I)">
              <em>I</em>
            </button>
            <button @click="execCommand('underline')" title="下划线 (Ctrl+U)">
              <u>U</u>
            </button>
            <button @click="execCommand('strikeThrough')" title="删除线">
              <s>S</s>
            </button>
          </div>
          
          <div class="toolbar-divider"></div>
          
          <div class="toolbar-group">
            <button @click="insertHeading(1)" title="标题 1">H1</button>
            <button @click="insertHeading(2)" title="标题 2">H2</button>
            <button @click="insertHeading(3)" title="标题 3">H3</button>
          </div>
          
          <div class="toolbar-divider"></div>
          
          <div class="toolbar-group">
            <button @click="execCommand('insertUnorderedList')" title="无序列表">• 列表</button>
            <button @click="execCommand('insertOrderedList')" title="有序列表">1. 列表</button>
            <button @click="insertBlockquote" title="引用">引用</button>
          </div>
          
          <div class="toolbar-divider"></div>
          
          <div class="toolbar-group">
            <button @click="insertLink" title="插入链接">🔗</button>
            <button @click="insertCode" title="代码">代码</button>
            <button @click="insertCodeBlock" title="代码块">代码块</button>
            <button @click="insertDivider" title="分割线">—</button>
          </div>
          
          <div class="toolbar-divider"></div>
          
          <div class="toolbar-group">
            <button @click="triggerImageUpload" title="插入图片 (或拖拽/粘贴图片)" class="image-btn">
              🖼️ 插图
            </button>
          </div>
        </div>
        
        <!-- 隐藏的图片上传输入框 -->
        <input 
          type="file" 
          ref="imageInput"
          accept="image/*"
          multiple
          @change="handleImageSelect"
          style="display: none"
        />

        <div 
          class="editor-content"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          @drop.prevent="handleDrop"
          :class="{ 'drag-over': isDragOver }"
        >
          <div 
            ref="editorRef"
            class="content-editable"
            contenteditable="true"
            @input="handleInput"
            @paste="handlePaste"
            @keydown="handleKeydown"
          ></div>
          
          <!-- 拖拽提示 -->
          <div v-if="isDragOver" class="drag-overlay">
            <div class="drag-hint">
              <span class="drag-icon">📷</span>
              <p>释放鼠标以插入图片</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：设置面板 -->
      <div v-if="showSidebar" class="editor-sidebar">
        <div class="sidebar-section">
          <h3>📝 文章设置</h3>
          
          <div class="form-group">
            <label>分类 *</label>
            <select v-model="article.category" required>
              <option value="">选择分类</option>
              <option value="Linux运维">Linux运维</option>
              <option value="Docker">Docker</option>
              <option value="Kubernetes">Kubernetes</option>
              <option value="云原生">云原生</option>
              <option value="DevOps">DevOps</option>
              <option value="CI/CD">CI/CD</option>
              <option value="监控告警">监控告警</option>
              <option value="网络安全">网络安全</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div class="form-group">
            <label>标签</label>
            <input 
              v-model="tagsInput" 
              type="text" 
              placeholder="输入标签，按回车添加"
              @keydown.enter.prevent="addTag"
            />
            <div class="tags-list">
              <span 
                v-for="tag in article.tags" 
                :key="tag" 
                class="tag-item"
              >
                {{ tag }}
                <button @click="removeTag(tag)" class="tag-remove">×</button>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label>封面图</label>
            <div class="cover-upload">
              <input 
                type="file" 
                ref="coverInput"
                accept="image/*"
                @change="handleCoverUpload"
                style="display: none"
              />
              <div 
                v-if="!article.cover" 
                class="cover-placeholder"
                @click="$refs.coverInput.click()"
              >
                <span>点击上传封面图</span>
                <small>推荐尺寸 1200x630</small>
              </div>
              <div v-else class="cover-preview">
                <img :src="article.cover" alt="封面" />
                <button @click="removeCover" class="remove-cover">×</button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>摘要</label>
            <textarea 
              v-model="article.excerpt" 
              rows="4" 
              placeholder="文章摘要（可选，不填则自动提取）"
            ></textarea>
            <small>{{ article.excerpt.length }}/200 字符</small>
          </div>

          <div class="form-group">
            <label>SEO 关键词</label>
            <input 
              v-model="article.keywords" 
              type="text" 
              placeholder="关键词1, 关键词2, ..."
            />
          </div>

          <div class="form-group">
            <label>发布时间</label>
            <input 
              v-model="article.date" 
              type="datetime-local"
            />
          </div>
        </div>

        <div class="sidebar-section">
          <h3>📊 文章统计</h3>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">字数</span>
              <span class="stat-value">{{ wordCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">字符</span>
              <span class="stat-value">{{ charCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">图片</span>
              <span class="stat-value">{{ imageCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">预计阅读</span>
              <span class="stat-value">{{ estimatedReadingTime }} 分钟</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 离开确认 -->
    <div v-if="showLeaveDialog" class="dialog-overlay" @click.self="showLeaveDialog = false">
      <div class="dialog">
        <h3>离开确认</h3>
        <p>您有未保存的更改，确定要离开吗？</p>
        <div class="dialog-actions">
          <button @click="showLeaveDialog = false" class="cancel-btn">取消</button>
          <button @click="confirmLeave" class="confirm-btn">确定离开</button>
        </div>
      </div>
    </div>

    <!-- 图片调整对话框 -->
    <div v-if="showImageDialog" class="dialog-overlay" @click.self="showImageDialog = false">
      <div class="image-dialog">
        <h3>调整图片</h3>
        <div class="image-preview">
          <img :src="currentImage.src" :style="imageStyle" ref="imagePreviewRef" />
        </div>
        <div class="image-controls">
          <div class="control-group">
            <label>宽度</label>
            <input 
              v-model.number="imageSettings.width" 
              type="range" 
              min="100" 
              max="1200" 
              step="10"
            />
            <span>{{ imageSettings.width }}px</span>
          </div>
          <div class="control-group">
            <label>对齐</label>
            <select v-model="imageSettings.align">
              <option value="left">左对齐</option>
              <option value="center">居中</option>
              <option value="right">右对齐</option>
            </select>
          </div>
        </div>
        <div class="dialog-actions">
          <button @click="showImageDialog = false" class="cancel-btn">取消</button>
          <button @click="applyImageSettings" class="confirm-btn">应用</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  getArticles, 
  addArticle, 
  updateArticle 
} from '../data/store.js'

const router = useRouter()
const route = useRoute()
const editorRef = ref(null)
const coverInput = ref(null)
const imageInput = ref(null)
const imagePreviewRef = ref(null)

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const showSidebar = ref(true)
const showLeaveDialog = ref(false)
const hasChanges = ref(false)
const tagsInput = ref('')
const isDragOver = ref(false)

// 图片调整相关
const showImageDialog = ref(false)
const currentImage = ref({ src: '', element: null })
const imageSettings = ref({
  width: 600,
  align: 'center'
})

const article = ref({
  id: null,
  title: '',
  content: '',
  excerpt: '',
  category: '',
  tags: [],
  cover: '',
  keywords: '',
  date: new Date().toISOString().slice(0, 16),
  readingTime: 5,
  views: 0
})

// 计算属性
const imageStyle = computed(() => ({
  width: `${imageSettings.value.width}px`,
  display: 'block',
  margin: imageSettings.value.align === 'center' ? '0 auto' : 
         imageSettings.value.align === 'left' ? '0 auto 0 0' : '0 0 0 auto'
}))

const wordCount = computed(() => {
  if (!editorRef.value) return 0
  const text = editorRef.value.innerText || ''
  return text.trim().split(/\s+/).filter(Boolean).length
})

const charCount = computed(() => {
  if (!editorRef.value) return 0
  return editorRef.value.innerText.length
})

const imageCount = computed(() => {
  if (!editorRef.value) return 0
  return editorRef.value.querySelectorAll('img').length
})

const estimatedReadingTime = computed(() => {
  return Math.max(1, Math.ceil(wordCount.value / 300))
})

// 执行富文本命令
const execCommand = (command, value = null) => {
  document.execCommand(command, false, value)
  editorRef.value?.focus()
}

// 插入标题
const insertHeading = (level) => {
  document.execCommand('formatBlock', false, `h${level}`)
  editorRef.value?.focus()
}

// 插入引用
const insertBlockquote = () => {
  document.execCommand('formatBlock', false, 'blockquote')
  editorRef.value?.focus()
}

// 插入链接
const insertLink = () => {
  const url = prompt('请输入链接地址：')
  if (url) {
    document.execCommand('createLink', false, url)
  }
  editorRef.value?.focus()
}

// 插入行内代码
const insertCode = () => {
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    const code = document.createElement('code')
    code.className = 'inline-code'
    code.textContent = range.toString() || '代码'
    range.deleteContents()
    range.insertNode(code)
  }
  editorRef.value?.focus()
}

// 插入代码块
const insertCodeBlock = () => {
  const pre = document.createElement('pre')
  pre.className = 'code-block'
  const code = document.createElement('code')
  code.textContent = '// 在此输入代码'
  pre.appendChild(code)
  
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(pre)
    range.setStartAfter(pre)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
  }
  editorRef.value?.focus()
}

// 插入分割线
const insertDivider = () => {
  const hr = document.createElement('hr')
  hr.className = 'divider'
  
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(hr)
    range.setStartAfter(hr)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
  }
  editorRef.value?.focus()
}

// 触发图片上传
const triggerImageUpload = () => {
  imageInput.value?.click()
}

// 处理图片选择
const handleImageSelect = (e) => {
  const files = e.target.files
  if (!files || files.length === 0) return
  
  Array.from(files).forEach(file => {
    processImageFile(file)
  })
  
  e.target.value = ''
}

// 处理拖拽
const handleDragOver = (e) => {
  isDragOver.value = true
}

const handleDragLeave = (e) => {
  isDragOver.value = false
}

const handleDrop = (e) => {
  isDragOver.value = false
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return
  
  Array.from(files).forEach(file => {
    if (file.type.startsWith('image/')) {
      processImageFile(file)
    }
  })
}

// 处理粘贴
const handlePaste = (e) => {
  const items = e.clipboardData?.items
  if (!items) return
  
  Array.from(items).forEach(item => {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const file = item.getAsFile()
      if (file) {
        processImageFile(file)
      }
    }
  })
}

// 处理图片文件
const processImageFile = (file) => {
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    alert('图片大小不能超过 5MB')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target.result
    insertImage(base64, file.name)
  }
  reader.readAsDataURL(file)
}

// 插入图片
const insertImage = (base64, filename = 'image') => {
  const img = document.createElement('img')
  img.src = base64
  img.alt = filename
  img.className = 'article-image'
  img.style.cssText = 'max-width: 100%; height: auto; display: block; margin: 1rem auto; cursor: pointer;'
  
  // 点击图片调整大小
  img.addEventListener('click', () => openImageDialog(img))
  
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(img)
    range.setStartAfter(img)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
  }
  
  editorRef.value?.focus()
  hasChanges.value = true
}

// 打开图片调整对话框
const openImageDialog = (imgElement) => {
  currentImage.value = {
    src: imgElement.src,
    element: imgElement
  }
  
  // 解析当前样式
  const currentWidth = parseInt(imgElement.style.width) || imgElement.naturalWidth || 600
  const align = imgElement.style.margin === '0px auto 0px 0px' ? 'left' :
                imgElement.style.margin === '0px 0px 0px auto' ? 'right' : 'center'
  
  imageSettings.value = {
    width: Math.min(currentWidth, 1200),
    align
  }
  
  showImageDialog.value = true
}

// 应用图片设置
const applyImageSettings = () => {
  if (currentImage.value.element) {
    const { width, align } = imageSettings.value
    currentImage.value.element.style.width = `${width}px`
    currentImage.value.element.style.margin = align === 'center' ? '1rem auto' :
                                              align === 'left' ? '1rem auto 1rem 0' : '1rem 0 1rem auto'
  }
  showImageDialog.value = false
  hasChanges.value = true
}

// 处理输入
const handleInput = () => {
  hasChanges.value = true
  updateExcerpt()
}

// 自动提取摘要
const updateExcerpt = () => {
  if (!article.value.excerpt || article.value.excerpt.length < 50) {
    const plainText = editorRef.value?.innerText || ''
    article.value.excerpt = plainText.replace(/\n+/g, ' ').trim().substring(0, 200)
  }
}

// 键盘事件
const handleKeydown = (e) => {
  // Tab 键缩进
  if (e.key === 'Tab') {
    e.preventDefault()
    document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;')
  }
  
  // Ctrl+S 保存草稿
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()
    saveDraft()
  }
}

// 添加标签
const addTag = () => {
  const tag = tagsInput.value.trim()
  if (tag && !article.value.tags.includes(tag)) {
    article.value.tags.push(tag)
    tagsInput.value = ''
    hasChanges.value = true
  }
}

// 移除标签
const removeTag = (tag) => {
  article.value.tags = article.value.tags.filter(t => t !== tag)
  hasChanges.value = true
}

// 封面图上传
const handleCoverUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    article.value.cover = e.target.result
    hasChanges.value = true
  }
  reader.readAsDataURL(file)
}

// 移除封面
const removeCover = () => {
  article.value.cover = ''
  hasChanges.value = true
}

// 切换侧边栏
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

// 保存草稿
const saveDraft = async () => {
  saving.value = true
  try {
    const content = editorRef.value?.innerHTML || ''
    const draft = {
      article: { ...article.value, content },
      timestamp: Date.now()
    }
    localStorage.setItem('article_draft', JSON.stringify(draft))
    hasChanges.value = false
    alert('草稿已保存')
  } catch (error) {
    console.error('保存草稿失败:', error)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 发布文章
const publish = async () => {
  if (!article.value.title.trim()) {
    alert('请输入文章标题')
    return
  }
  if (!article.value.category) {
    alert('请选择文章分类')
    return
  }
  
  const content = editorRef.value?.innerHTML || ''
  if (!content.trim() || content === '<br>') {
    alert('请输入文章内容')
    return
  }
  
  saving.value = true
  try {
    const articleData = {
      ...article.value,
      content,
      date: article.value.date || new Date().toISOString().slice(0, 10),
      readingTime: article.value.readingTime || estimatedReadingTime.value
    }
    
    if (isEdit.value) {
      updateArticle(articleData)
      alert('文章更新成功！')
    } else {
      addArticle(articleData)
      alert('文章发布成功！')
    }
    
    localStorage.removeItem('article_draft')
    hasChanges.value = false
    router.push('/admin')
  } catch (error) {
    console.error('发布失败:', error)
    alert('发布失败，请重试')
  } finally {
    saving.value = false
  }
}

// 返回
const goBack = () => {
  if (hasChanges.value) {
    showLeaveDialog.value = true
  } else {
    router.push('/admin')
  }
}

const confirmLeave = () => {
  showLeaveDialog.value = false
  router.push('/admin')
}

// 加载文章
onMounted(() => {
  const draftStr = localStorage.getItem('article_draft')
  if (draftStr && !isEdit.value) {
    const confirmLoad = confirm('发现未保存的草稿，是否加载？')
    if (confirmLoad) {
      try {
        const draft = JSON.parse(draftStr)
        article.value = draft.article || draft
        if (editorRef.value && article.value.content) {
          editorRef.value.innerHTML = article.value.content
        }
      } catch (e) {
        console.error('加载草稿失败:', e)
      }
    } else {
      localStorage.removeItem('article_draft')
    }
  }
  
  if (isEdit.value) {
    const articles = getArticles()
    const existing = articles.find(a => a.id === route.params.id)
    if (existing) {
      article.value = { ...existing }
      if (editorRef.value && existing.content) {
        editorRef.value.innerHTML = existing.content
        // 为已有图片添加点击事件
        editorRef.value.querySelectorAll('img').forEach(img => {
          img.addEventListener('click', () => openImageDialog(img))
        })
      }
    }
  }
  
  watch(article, () => {
    hasChanges.value = true
  }, { deep: true })
})
</script>

<style scoped>
.editor-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 2px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-left h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.back-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.sidebar-toggle {
  padding: 0.6rem 1rem;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-toggle:hover {
  background: #f3f4f6;
}

.draft-btn {
  padding: 0.6rem 1.25rem;
  background: white;
  border: 2px solid #10b981;
  border-radius: 8px;
  color: #10b981;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.draft-btn:hover:not(:disabled) {
  background: #10b981;
  color: white;
}

.publish-btn {
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.publish-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.publish-btn:disabled,
.draft-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 0;
  max-width: 1800px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
}

.editor-main {
  display: flex;
  flex-direction: column;
  background: white;
  transition: all 0.3s;
}

.editor-main.full-width {
  grid-column: 1 / -1;
}

.editor-title {
  padding: 2.5rem 3rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.title-input {
  width: 100%;
  padding: 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  border: none;
  background: transparent;
  color: #1f2937;
  outline: none;
  letter-spacing: -0.02em;
}

.title-input::placeholder {
  color: #d1d5db;
}

.editor-toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: #fafbfc;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
  align-items: center;
}

.toolbar-group {
  display: flex;
  gap: 0.25rem;
}

.editor-toolbar button {
  padding: 0.5rem 0.85rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  font-weight: 500;
}

.editor-toolbar button:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #1f2937;
}

.editor-toolbar button.image-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.editor-toolbar button.image-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e5e7eb;
  margin: 0 0.5rem;
}

.editor-content {
  flex: 1;
  position: relative;
  background: white;
  min-height: 600px;
}

.editor-content.drag-over {
  background: rgba(102, 126, 234, 0.05);
}

.content-editable {
  width: 100%;
  min-height: 600px;
  padding: 3rem;
  outline: none;
  font-size: 1.1rem;
  line-height: 1.8;
  color: #374151;
}

.content-editable:empty:before {
  content: "开始写作...\A\A💡 提示：\A• 选中文本后点击工具栏按钮进行格式化\A• 拖拽或粘贴图片可直接插入\A• 点击已插入的图片可调整大小";
  color: #9ca3af;
  white-space: pre-wrap;
  font-size: 1rem;
}

.content-editable:focus:empty:before {
  content: "开始写作...";
}

/* 富文本样式 */
.content-editable :deep(h1) {
  font-size: 2rem;
  font-weight: 700;
  margin: 1.5rem 0 1rem;
  color: #1f2937;
}

.content-editable :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.25rem 0 0.75rem;
  color: #1f2937;
}

.content-editable :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
  color: #374151;
}

.content-editable :deep(p) {
  margin: 0.75rem 0;
}

.content-editable :deep(blockquote) {
  border-left: 4px solid #667eea;
  padding-left: 1.5rem;
  margin: 1.5rem 0;
  color: #6b7280;
  font-style: italic;
  background: #f9fafb;
  padding: 1rem 1.5rem;
  border-radius: 0 8px 8px 0;
}

.content-editable :deep(ul),
.content-editable :deep(ol) {
  margin: 1rem 0;
  padding-left: 2rem;
}

.content-editable :deep(li) {
  margin: 0.5rem 0;
}

.content-editable :deep(code.inline-code) {
  background: #f3f4f6;
  color: #ef4444;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
}

.content-editable :deep(pre.code-block) {
  background: #1f2937;
  color: #e5e7eb;
  padding: 1.5rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.content-editable :deep(pre.code-block code) {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
}

.content-editable :deep(a) {
  color: #667eea;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s;
}

.content-editable :deep(a:hover) {
  border-bottom-color: #667eea;
}

.content-editable :deep(hr.divider) {
  border: none;
  height: 2px;
  background: linear-gradient(to right, transparent, #e5e7eb, transparent);
  margin: 2rem 0;
}

.content-editable :deep(img.article-image) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
}

.content-editable :deep(img.article-image:hover) {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* 拖拽提示 */
.drag-overlay {
  position: absolute;
  inset: 0;
  background: rgba(102, 126, 234, 0.1);
  border: 3px dashed #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
  border-radius: 8px;
  margin: 1rem;
}

.drag-hint {
  text-align: center;
}

.drag-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.drag-hint p {
  font-size: 1.25rem;
  color: #667eea;
  font-weight: 600;
}

/* 右侧边栏 */
.editor-sidebar {
  background: white;
  border-left: 1px solid #e5e7eb;
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(100vh - 64px);
}

.sidebar-section {
  margin-bottom: 2rem;
  background: #f9fafb;
  padding: 1.25rem;
  border-radius: 12px;
}

.sidebar-section h3 {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
  color: #1f2937;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.65rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #1f2937;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.7rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.tag-remove {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  font-size: 1.1rem;
  line-height: 1;
  opacity: 0.7;
}

.tag-remove:hover {
  opacity: 1;
}

.cover-upload {
  margin-top: 0.5rem;
}

.cover-placeholder {
  padding: 3rem 1rem;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.cover-placeholder:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.cover-placeholder span {
  display: block;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
  font-weight: 500;
  color: #374151;
}

.cover-placeholder small {
  color: #9ca3af;
  font-size: 0.75rem;
}

.cover-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.cover-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.remove-cover {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  transition: all 0.2s;
}

.remove-cover:hover {
  background: #ef4444;
  transform: scale(1.1);
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.stat-item {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e5e7eb;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

/* 对话框 */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.dialog h3 {
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.dialog p {
  color: #6b7280;
  margin-bottom: 1.25rem;
}

.dialog-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 0.6rem 1.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #f3f4f6;
}

.confirm-btn {
  padding: 0.6rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 图片调整对话框 */
.image-dialog {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.image-dialog h3 {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.image-preview {
  background: #f3f4f6;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.image-preview img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.control-group label {
  min-width: 60px;
  font-weight: 500;
  color: #374151;
}

.control-group input[type="range"] {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
  outline: none;
  cursor: pointer;
}

.control-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.control-group span {
  min-width: 60px;
  text-align: right;
  font-weight: 500;
  color: #667eea;
}

.control-group select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
}

@media (max-width: 1024px) {
  .editor-container {
    grid-template-columns: 1fr;
  }
  
  .editor-sidebar {
    max-height: none;
    position: fixed;
    right: 0;
    top: 64px;
    bottom: 0;
    width: 360px;
    transform: translateX(100%);
    transition: transform 0.3s;
    z-index: 90;
  }
  
  .editor-sidebar {
    transform: translateX(0);
  }
}
</style>
