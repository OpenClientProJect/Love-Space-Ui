<template>
  <div class="activity-detail-page">
    <div class="container" v-loading="loading">
      <div class="page-header">
        <h1 class="page-title">活动详情</h1>
        <el-button @click="goBack" class="close-btn" type="default" circle>
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      
      <!-- 活动列表选择 -->
      <div class="activity-list-section" v-if="activities.length > 0">
        <h2 class="section-title">活动列表</h2>
        <el-tabs v-model="activeActivityId" tab-position="left" @tab-change="handleActivityChange">
          <el-tab-pane 
            v-for="item in activities" 
            :key="item.activityId" 
            :label="item.title" 
            :name="item.activityId.toString()"
          >
            <!-- 活动简介展示区域 -->
            <div class="activity-brief">
              <div class="brief-header">
                <span class="activity-tag">活动简介</span>
                <span class="brief-date">发布时间: {{ formatDate(item.createTime) }}</span>
              </div>
              <div class="brief-content">{{ item.text }}</div>
              <el-button 
                type="primary" 
                class="view-detail-btn" 
                @click="showDetailCard(item)"
              >查看详情</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Calendar, ArrowLeft, Close } from '@element-plus/icons-vue';
import { getActivityListService } from '@/api/activity';

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
  background-color: #f4f5f7;
  min-height: calc(100vh - 120px);
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
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

.section-title {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
  font-weight: bold;
  border-left: 4px solid #ff5722;
  padding-left: 12px;
}

.activity-list-section {
  margin-bottom: 30px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-tabs__item) {
  height: 50px;
  line-height: 50px;
  font-size: 15px;
  color: #555;
}

:deep(.el-tabs__item.is-active) {
  color: #ff5722;
  font-weight: bold;
}

:deep(.el-tabs__active-bar) {
  background-color: #ff5722;
}

/* 活动简介区域样式 */
.activity-brief {
  padding: 20px;
  background-color: #fffaf7;
  border-radius: 8px;
  border-left: 3px solid #ff5722;
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
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.view-detail-btn {
  margin-top: 10px;
}

/* 活动详情卡片样式 */
.activity-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
  animation: slideIn 0.3s ease;
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
  background-color: #fafafa;
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

@media (max-width: 768px) {
  .page-title {
    font-size: 20px;
  }
  
  .brief-content,
  .content-text {
    font-size: 14px;
    line-height: 1.6;
  }
  
  :deep(.el-tabs--left) {
    flex-direction: column;
  }
  
  :deep(.el-tabs__header.is-left) {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .card-title {
    font-size: 16px;
  }
}
</style> 