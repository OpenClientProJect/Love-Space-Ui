<template>
  <div class="video-content">
    <!-- 顶部操作区域 -->
    <div class="header-actions">
      <h2 class="section-title">视频审核</h2>
      <el-button type="primary" @click="refreshData" class="refresh-button">
        <el-icon><Refresh /></el-icon>
        刷新列表
      </el-button>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="videoList.length === 0 && !loading">
      <el-empty description="暂无视频内容">
        <template #description>
          <p class="empty-text">暂无待审核视频</p>
        </template>
      </el-empty>
    </div>

    <!-- 视频列表展示 -->
    <div class="video-list" v-if="videoList.length > 0">
      <div v-for="video in videoList" :key="video.id" class="video-card">
        <div class="video-cover-wrap">
          <img :src="video.cover" class="video-cover" alt="图片获取失败"/>
          <div class="video-status">
            <el-tag :type="getStatusType(video.status)">
              {{ getStatusText(video.status) }}
            </el-tag>
          </div>
        </div>
        <div class="video-info">
          <div class="video-actions">
            <el-dropdown trigger="click" @command="command => handleCommand(command, video)">
              <div class="action-icon">
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="approve" v-if="video.status === 0">
                    <el-icon><Check /></el-icon>
                    审核通过
                  </el-dropdown-item>
                  <el-dropdown-item command="reject" v-if="video.status === 0">
                    <el-icon><Close /></el-icon>
                    拒绝发布
                  </el-dropdown-item>
                  <el-dropdown-item command="delete">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <h3 class="video-title">{{ video.title }}</h3>
          <p class="video-description">{{ video.content || '暂无简介' }}</p>
          <div class="video-meta">
            <span class="uploader">UP主: {{ video.nickname || '未知用户' }}</span>
            <span class="create-time">发布时间: {{ formatDate(video.createTime) }}</span>
          </div>
          <div class="video-preview-btn">
            <el-button 
              size="small" 
              type="primary" 
              @click="handlePreview(video)"
              :disabled="!video.videoUrl"
            >
              <el-icon><VideoPlay /></el-icon>
              预览视频
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 视频预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="视频预览"
      width="80%"
      class="preview-dialog"
      destroy-on-close
    >
      <div class="video-preview-container">
        <video 
          v-if="currentVideo.videoUrl" 
          controls 
          class="preview-video" 
          :src="currentVideo.videoUrl"
        ></video>
        <div class="video-preview-info">
          <h3>{{ currentVideo.title }}</h3>
          <p class="video-description">{{ currentVideo.content || '暂无简介' }}</p>
          <div class="video-meta">
            <span>UP主: {{ currentVideo.nickname || '未知用户' }}</span>
            <span>创建时间: {{ formatDate(currentVideo.createTime) }}</span>
          </div>
          <div class="preview-actions" v-if="currentVideo.status === 0">
            <el-button type="success" @click="handleQuickApprove">
              <el-icon><Check /></el-icon>
              通过审核
            </el-button>
            <el-button type="danger" @click="handleQuickReject">
              <el-icon><Close /></el-icon>
              拒绝发布
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 操作确认对话框 -->
    <el-dialog
      v-model="confirmDialogVisible"
      :title="confirmDialogTitle"
      width="30%"
    >
      <span>{{ confirmDialogMessage }}</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confirmDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmAction">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getVideoDraftListService } from '@/api/admin/adminVideo'
import { Check, Close, Delete, Refresh, ArrowDown, MoreFilled, VideoPlay } from '@element-plus/icons-vue'

// 数据加载状态
const loading = ref(false)

// 视频列表数据
const videoList = ref([])

// 分页信息
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 预览对话框
const previewDialogVisible = ref(false)
const currentVideo = ref({})

// 确认对话框
const confirmDialogVisible = ref(false)
const confirmDialogTitle = ref('')
const confirmDialogMessage = ref('')
const currentAction = ref('')
const selectedRow = ref(null)

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '未知时间'
  
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化时长
const formatDuration = (seconds) => {
  if (!seconds) return '未知'
  
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    0: 'warning',  // 待审核
    1: 'success',  // 已发布
    2: 'danger',   // 已拒绝
    3: 'info'      // 草稿
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    0: '待审核',
    1: '已发布',
    2: '已拒绝',
    3: '草稿'
  }
  return texts[status] || '未知'
}

// 获取视频列表数据
const fetchVideoList = async () => {
  loading.value = true
  try {
    const response = await getVideoDraftListService()
    if (response && response.data) {
      videoList.value = response.data
      // 如果后端返回了分页信息，则更新
      if (response.pageNum) pagination.value.pageNum = response.pageNum
      if (response.pageSize) pagination.value.pageSize = response.pageSize
      if (response.total) pagination.value.total = response.total
    }
  } catch (error) {
    console.error('获取视频列表失败:', error)
    ElMessage.error('获取视频列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  fetchVideoList()
}

// 处理预览
const handlePreview = (video) => {
  currentVideo.value = video
  previewDialogVisible.value = true
}

// 预览对话框中快速审核通过
const handleQuickApprove = () => {
  handleCommand('approve', currentVideo.value)
  previewDialogVisible.value = false
}

// 预览对话框中快速拒绝
const handleQuickReject = () => {
  handleCommand('reject', currentVideo.value)
  previewDialogVisible.value = false
}

// 处理下拉菜单命令
const handleCommand = (command, video) => {
  selectedRow.value = video
  
  switch (command) {
    case 'approve':
      confirmDialogTitle.value = '审核通过'
      confirmDialogMessage.value = `确定要通过视频 "${video.title}" 的审核吗？`
      currentAction.value = 'approve'
      confirmDialogVisible.value = true
      break
      
    case 'reject':
      confirmDialogTitle.value = '拒绝发布'
      confirmDialogMessage.value = `确定要拒绝视频 "${video.title}" 的发布申请吗？`
      currentAction.value = 'reject'
      confirmDialogVisible.value = true
      break
      
    case 'delete':
      confirmDialogTitle.value = '删除视频'
      confirmDialogMessage.value = `确定要删除视频 "${video.title}" 吗？此操作不可恢复！`
      currentAction.value = 'delete'
      confirmDialogVisible.value = true
      break
  }
}

// 处理确认操作
const handleConfirmAction = () => {
  // 这里实现对应的操作逻辑，如调用审核API等
  // 暂时只做模拟，后续需要接入真实的API
  const video = selectedRow.value
  
  switch (currentAction.value) {
    case 'approve':
      ElMessage.success(`已通过视频 "${video.title}" 的审核`)
      // 这里调用审核通过API
      break
      
    case 'reject':
      ElMessage.info(`已拒绝视频 "${video.title}" 的发布申请`)
      // 这里调用拒绝发布API
      break
      
    case 'delete':
      ElMessage.success(`已删除视频 "${video.title}"`)
      // 这里调用删除视频API
      break
  }
  
  // 关闭对话框并刷新数据
  confirmDialogVisible.value = false
  fetchVideoList()
}

// 处理分页大小变化
const handleSizeChange = (newSize) => {
  pagination.value.pageSize = newSize
  fetchVideoList()
}

// 处理页码变化
const handleCurrentChange = (newPage) => {
  pagination.value.pageNum = newPage
  fetchVideoList()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchVideoList()
})
</script>

<style scoped>
.video-content {
  width: 100%;
  padding: 10px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 22px;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px 0;
}

.video-card {
  display: flex;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e3e5e7;
  height: 150px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.video-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-cover-wrap {
  width: 240px;
  height: 150px;
  flex-shrink: 0;
  position: relative;
}

.video-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-status {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
}

.video-info {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.video-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: #18191c;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.video-description {
  font-size: 14px;
  color: #61666d;
  margin: 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  max-height: 2.8em;
}

.video-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: #9499a0;
  margin-bottom: 10px;
}

.video-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.action-icon {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #666;
  transition: all 0.3s;
}

.action-icon:hover {
  background-color: #f5f5f5;
  color: #fb7299;
}

.video-preview-btn {
  display: flex;
  justify-content: flex-end;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 10px 0;
}

/* 视频预览对话框 */
.preview-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.video-preview-container {
  display: flex;
  flex-direction: column;
}

.preview-video {
  width: 100%;
  max-height: 500px;
  background: #000;
}

.video-preview-info {
  padding: 20px;
}

.preview-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.empty-text {
  color: #666;
  font-size: 14px;
  margin: 16px 0;
}

/* Element Plus 主题覆盖 */
:deep(.el-button--primary) {
  background-color: #fb7299;
  border-color: #fb7299;
}

:deep(.el-button--primary:hover) {
  background-color: #fc8bab;
  border-color: #fc8bab;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #fb7299;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled):hover) {
  color: #fb7299;
}

:deep(.el-button--success) {
  background-color: #67c23a;
  border-color: #67c23a;
}

:deep(.el-button--danger) {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .video-card {
    height: auto;
    flex-direction: column;
  }

  .video-cover-wrap {
    width: 100%;
    height: 180px;
  }

  .video-info {
    padding: 12px;
  }

  .video-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style> 