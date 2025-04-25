<template>
  <div class="announcement-list-page page-background bg-wave">
    <div class="top-dots"></div>
    <div class="side-dots"></div>
    <div class="bottom-wave"></div>
    
    <div class="announcement-list-container">
      <div class="header-section">
        <h1 class="page-title">公告列表</h1>
        <el-button @click="goBack" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </el-button>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      
      <!-- 公告为空状态 -->
      <div v-else-if="announcements.length === 0" class="empty-state">
        <el-empty description="暂无公告" />
      </div>
      
      <!-- 公告内容区 -->
      <div v-else class="announcement-content-area">
        <!-- 左侧轮播图 -->
        <div class="announcement-carousel">
          <el-carousel height="300px" :interval="4000" indicator-position="outside">
            <el-carousel-item v-for="item in featuredAnnouncements" :key="item.announcementId">
              <div 
                class="carousel-item" 
                @click="viewAnnouncementDetail(item.announcementId)"
              >
                <div class="carousel-image" :style="getCarouselBackground(item)"></div>
                <div class="carousel-content">
                  <h3 class="carousel-title">{{ item.title }}</h3>
                  <p class="carousel-desc">{{ getAnnouncementSnippet(item.text) }}</p>
                  <div class="carousel-meta">
                    <span class="carousel-time">{{ formatDate(item.createTime) }}</span>
                    <el-button size="small" type="primary">查看详情</el-button>
                  </div>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
        
        <!-- 右侧公告列表 -->
        <div class="announcement-list-section">
          <div class="announcement-list">
            <div 
              v-for="item in paginatedAnnouncements" 
              :key="item.announcementId" 
              class="announcement-item"
              @click="viewAnnouncementDetail(item.announcementId)"
            >
              <div class="announcement-info">
                <h3 class="announcement-title">{{ item.title }}</h3>
                <div class="announcement-meta">
                  <span class="publish-time">{{ formatDate(item.createTime) }}</span>
                  <div class="announcement-tags">
                    <span class="media-tag" v-if="item.imageUrl">包含图片</span>
                    <span class="media-tag video-tag" v-if="item.videoUrl">包含视频</span>
                  </div>
                </div>
              </div>
              <div class="announcement-action">
                <el-button type="primary" size="small" plain>查看详情</el-button>
              </div>
            </div>
          </div>
          
          <!-- 分页器 -->
          <div class="pagination-container">
            <el-pagination
              v-model:currentPage="currentPage"
              :page-size="pageSize"
              layout="prev, pager, next"
              :total="announcements.length"
              @current-change="handlePageChange"
              background
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAnnouncementListService } from '@/api/Announcement'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import '@/assets/styles/common-bg.css'

const router = useRouter()
const announcements = ref([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(5)

// 获取轮播图展示的公告
const featuredAnnouncements = computed(() => {
  return announcements.value.slice(0, Math.min(5, announcements.value.length))
})

// 计算当前页的公告
const paginatedAnnouncements = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  return announcements.value.slice(startIndex, startIndex + pageSize.value)
})

// 获取公告列表
const fetchAnnouncements = async () => {
  loading.value = true
  try {
    const result = await getAnnouncementListService()
    if (result.code === 200) {
      announcements.value = result.data || []
    } else {
      ElMessage.error(result.message || '获取公告列表失败')
    }
  } catch (error) {
    console.error('获取公告列表失败:', error)
    ElMessage.error('获取公告列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知时间'
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 返回首页
const goBack = () => {
  router.push('/')
}

// 查看公告详情
const viewAnnouncementDetail = (id) => {
  router.push(`/announcement/${id}`)
}

// 处理页码变更
const handlePageChange = (page) => {
  currentPage.value = page
}

// 获取轮播图背景样式
const getCarouselBackground = (announcement) => {
  if (announcement.imageUrl) {
    return {
      backgroundImage: `url(${announcement.imageUrl})`,
    }
  }
  // 默认背景色
  return {
    backgroundColor: '#409EFF',
    backgroundImage: 'linear-gradient(135deg, #409EFF 0%, #36cfc9 100%)'
  }
}

// 获取公告内容摘要
const getAnnouncementSnippet = (text) => {
  if (!text) return '暂无详细内容'
  return text.length > 100 ? text.substring(0, 100) + '...' : text
}

onMounted(() => {
  fetchAnnouncements()
})
</script>

<style scoped>
.announcement-list-page {
  min-height: 100vh;
  padding: 80px 0 40px;
}

.announcement-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.loading-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-state {
  background: white;
  border-radius: 8px;
  padding: 50px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
}

/* 内容区样式 */
.announcement-content-area {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

/* 轮播图样式 */
.announcement-carousel {
  flex: 1;
  min-width: 300px;
}

.carousel-item {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.carousel-image {
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.3s ease;
}

.carousel-item:hover .carousel-image {
  transform: scale(1.05);
}

.carousel-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
  color: white;
}

.carousel-title {
  font-size: 20px;
  margin: 0 0 10px;
  font-weight: 600;
}

.carousel-desc {
  font-size: 14px;
  margin: 0 0 10px;
  opacity: 0.9;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.carousel-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.carousel-time {
  font-size: 12px;
  opacity: 0.8;
}

/* 公告列表样式 */
.announcement-list-section {
  flex: 2;
  min-width: 450px;
  display: flex;
  flex-direction: column;
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.announcement-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.announcement-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.announcement-info {
  flex: 1;
  min-width: 0;
}

.announcement-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.announcement-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #909399;
  font-size: 13px;
}

.announcement-action {
  margin-left: 20px;
  flex-shrink: 0;
}

.announcement-tags {
  display: flex;
  gap: 8px;
}

.media-tag {
  display: inline-flex;
  align-items: center;
  background-color: #fb729915;
  color: #fb7299;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.media-tag::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #fb7299;
  margin-right: 4px;
}

.media-tag.video-tag {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.media-tag.video-tag::before {
  background-color: #409eff;
}

/* 分页器样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: auto;
  padding-top: 20px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .announcement-content-area {
    flex-direction: column;
  }
  
  .announcement-carousel,
  .announcement-list-section {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .announcement-list-container {
    padding: 15px;
  }
  
  .announcement-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .announcement-action {
    margin-left: 0;
    margin-top: 15px;
    align-self: flex-end;
  }
  
  .announcement-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .carousel-title {
    font-size: 18px;
  }
  
  .carousel-desc {
    -webkit-line-clamp: 1;
  }
}
</style> 