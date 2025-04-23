<template>
  <div class="activity-detail-page page-background bg-wave">
    <div class="top-wave"></div>
    <div class="side-dots"></div>
    <div class="side-dots-left"></div>
    <div class="bottom-wave"></div>
    <div class="page-content">
      <div class="container" v-loading="loading">
        <div class="page-header">
          <h1 class="page-title">活动详情</h1>
          <el-button @click="goBack" class="close-btn" type="default" circle>
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        
        <!-- 主要内容区域 - 左侧菜单和右侧轮播图 -->
        <div class="main-content-wrapper" v-if="activities.length > 0">
          <!-- 左侧活动菜单 -->
          <div class="activity-menu">
            <h3 class="menu-title">活动列表</h3>
            <ul class="activity-menu-list">
              <li v-for="item in activities" 
                  :key="item.activityId"
                  :class="{ active: activeActivityId === item.activityId.toString() }"
                  @click="handleActivityChange(item.activityId.toString())"
              >
                {{ item.title }}
              </li>
            </ul>
          </div>
          
          <!-- 右侧内容区域 -->
          <div class="activity-content-area">
            <!-- 轮播图展示区域 -->
            <div class="carousel-container">
              <el-carousel :interval="4000" height="320px" arrow="always" indicator-position="outside">
                <el-carousel-item v-for="item in activitiesWithImages" :key="item.activityId">
                  <div class="carousel-content">
                    <img :src="item.image" :alt="item.title" class="carousel-image">
                    <div class="carousel-caption">
                      <h3>{{ item.title }}</h3>
                      <p class="carousel-date">{{ formatDate(item.createTime) }}</p>
                    </div>
                  </div>
                </el-carousel-item>
              </el-carousel>
            </div>
            
            <!-- 当前选中的活动简介 -->
            <div class="activity-brief" v-if="currentActivity">
              <div class="brief-header">
                <span class="activity-tag">活动简介</span>
                <span class="brief-date">发布时间: {{ formatDate(currentActivity.createTime) }}</span>
              </div>
              <div class="brief-content">{{ currentActivity.text }}</div>
              <el-button 
                type="primary" 
                class="view-detail-btn" 
                @click="showDetailCard(currentActivity)"
              >查看详情</el-button>
            </div>
          </div>
        </div>
        
        <!-- 活动内容详情卡片 -->
        <div class="activity-card" v-if="showDetail && currentActivity">
          <div class="card-header">
            <h3 class="card-title">{{ currentActivity.title }}</h3>
            <el-button type="text" class="close-detail" @click="showDetail = false">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          
          <!-- 活动图片（如果有） -->
          <div class="activity-image-container" v-if="currentActivity.image">
            <img :src="currentActivity.image" alt="活动图片" class="activity-image" />
          </div>
          
          <!-- 活动内容 -->
          <div class="activity-content">
            <div class="content-text">{{ currentActivity.text }}</div>
          </div>
        </div>
        
        <!-- 未找到活动的提示 -->
        <el-empty v-else-if="!loading && activities.length === 0" description="暂无活动信息">
          <el-button type="primary" @click="goBack">返回首页</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Calendar, ArrowLeft, Close } from '@element-plus/icons-vue';
import { getActivityListService } from '@/api/activity';
import '@/assets/styles/common-bg.css';

const router = useRouter();

const activities = ref([]);
const loading = ref(true);
const activeActivityId = ref('1'); // 默认选择第一个活动
const showDetail = ref(false); // 控制是否显示详情卡片

// 计算当前选中的活动
const currentActivity = computed(() => {
  if (!activities.value.length) return null;
  return activities.value.find(item => item.activityId.toString() === activeActivityId.value) || activities.value[0];
});

// 筛选有图片的活动用于轮播图展示
const activitiesWithImages = computed(() => {
  return activities.value.filter(item => item.image && item.image.trim() !== '');
});

// 获取活动列表数据
const getActivityList = async () => {
  loading.value = true;
  try {
    const res = await getActivityListService();
    if (res.code === 200 && res.data) {
      activities.value = res.data;
      
      // 选择第一个活动作为默认显示
      if (activities.value.length > 0) {
        activeActivityId.value = activities.value[0].activityId.toString();
      }
      
      // 设置页面标题
      if (currentActivity.value) {
        document.title = `${currentActivity.value.title} - 活动详情`;
      }
    } else {
      ElMessage.error(res.message || '获取活动列表失败');
    }
  } catch (error) {
    console.error('获取活动列表失败:', error);
    ElMessage.error('获取活动列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 处理活动选择变化
const handleActivityChange = (tabId) => {
  activeActivityId.value = tabId;
  const activity = activities.value.find(item => item.activityId.toString() === tabId);
  if (activity) {
    document.title = `${activity.title} - 活动详情`;
    showDetail.value = false; // 切换活动时关闭详情卡片
  }
};

// 显示活动详情卡片
const showDetailCard = (activity) => {
  activeActivityId.value = activity.activityId.toString();
  showDetail.value = true;
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 返回上一页
const goBack = () => {
  router.push('/');
};

onMounted(() => {
  getActivityList();
});
</script>

<style scoped>
.activity-detail-page {
  padding: 20px 0;
  min-height: calc(100vh - 120px);
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin: 0;
  font-weight: bold;
}

.close-btn {
  font-size: 18px;
}

/* 主内容区布局 */
.main-content-wrapper {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
}

/* 左侧菜单样式 */
.activity-menu {
  width: 220px;
  background-color: rgba(248, 248, 248, 0.8);
  padding: 20px 0;
  border-right: 1px solid #eee;
  flex-shrink: 0;
}

.menu-title {
  font-size: 18px;
  padding: 0 20px 15px;
  margin: 0;
  color: #333;
  font-weight: bold;
  border-bottom: 1px solid #eee;
}

.activity-menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-menu-list li {
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border-left: 3px solid transparent;
  color: #555;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-menu-list li:hover {
  background-color: rgba(240, 240, 240, 0.8);
  color: #ff5722;
}

.activity-menu-list li.active {
  background-color: rgba(255, 255, 255, 0.8);
  color: #ff5722;
  font-weight: bold;
  border-left-color: #ff5722;
}

/* 右侧内容区域 */
.activity-content-area {
  flex-grow: 1;
  padding: 20px;
  overflow: hidden;
}

/* 轮播图样式 */
.carousel-container {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.carousel-content {
  position: relative;
  height: 100%;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
}

.carousel-caption h3 {
  margin: 0 0 5px;
  font-size: 18px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.carousel-date {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

:deep(.el-carousel__button) {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 87, 34, 0.5);
}

:deep(.el-carousel__button:hover),
:deep(.el-carousel__indicator.is-active .el-carousel__button) {
  background-color: #ff5722;
}

:deep(.el-carousel__arrow) {
  background-color: rgba(255, 87, 34, 0.7);
}

:deep(.el-carousel__arrow:hover) {
  background-color: #ff5722;
}

/* 活动简介区域样式 */
.activity-brief {
  padding: 20px;
  background-color: rgba(255, 250, 247, 0.8);
  border-radius: 8px;
  border-left: 3px solid #ff5722;
  backdrop-filter: blur(5px);
}

.brief-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.brief-date {
  font-size: 14px;
  color: #999;
}

.brief-content {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 20px;
  max-height: 150px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.view-detail-btn {
  margin-top: 10px;
}

/* 活动详情卡片样式 */
.activity-card {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
  animation: slideIn 0.3s ease;
  backdrop-filter: blur(10px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  padding: 15px 20px;
  background-color: #ff5722;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.close-detail {
  color: white;
  font-size: 18px;
}

.activity-tag {
  display: inline-block;
  background-color: #ff5722;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 10px;
}

.activity-image-container {
  width: 100%;
  text-align: center;
  padding: 20px;
  background-color: rgba(250, 250, 250, 0.8);
}

.activity-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.activity-content {
  padding: 20px;
}

.content-text {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .main-content-wrapper {
    flex-direction: column;
  }
  
  .activity-menu {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #eee;
    padding: 15px 0;
  }
  
  .activity-menu-list {
    display: flex;
    overflow-x: auto;
    padding-bottom: 10px;
  }
  
  .activity-menu-list li {
    padding: 8px 15px;
    border-left: none;
    border-bottom: 3px solid transparent;
    white-space: nowrap;
  }
  
  .activity-menu-list li.active {
    border-left-color: transparent;
    border-bottom-color: #ff5722;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .brief-content,
  .content-text {
    font-size: 14px;
    line-height: 1.6;
  }
  
  .card-title {
    font-size: 16px;
  }
  
  .carousel-caption h3 {
    font-size: 16px;
  }
}
</style> 