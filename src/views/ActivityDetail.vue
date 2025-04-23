<template>
  <div class="activity-detail-page">
    <div class="container" v-loading="loading">
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
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <!-- 活动内容 -->
      <div class="activity-card" v-if="currentActivity">
        <div class="activity-header">
          <div class="title-section">
            <span class="activity-tag">活动</span>
            <h1 class="activity-title">{{ currentActivity.title }}</h1>
          </div>
          <div class="activity-meta">
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>发布时间: {{ formatDate(currentActivity.createTime) }}</span>
            </div>
          </div>
        </div>
        
        <!-- 活动图片（如果有） -->
        <div class="activity-image-container" v-if="currentActivity.image">
          <img :src="currentActivity.image" alt="活动图片" class="activity-image" />
        </div>
        
        <!-- 活动内容 -->
        <div class="activity-content">
          <div class="content-text">{{ currentActivity.text }}</div>
        </div>
        
        <!-- 返回按钮 -->
        <div class="action-buttons">
          <el-button type="primary" @click="goBack">
            <el-icon><ArrowLeft /></el-icon> 返回首页
          </el-button>
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
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Calendar, ArrowLeft } from '@element-plus/icons-vue';
import { getActivityListService } from '@/api/activity';

const route = useRoute();
const router = useRouter();

const activities = ref([]);
const loading = ref(true);
const activeActivityId = ref('1'); // 默认选择第一个活动

// 计算当前选中的活动
const currentActivity = computed(() => {
  if (!activities.value.length) return null;
  return activities.value.find(item => item.activityId.toString() === activeActivityId.value) || activities.value[0];
});

// 获取活动列表数据
const getActivityDetail = async () => {
  loading.value = true;
  try {
    const res = await getActivityListService();
    if (res.code === 200 && res.data) {
      activities.value = res.data;
      
      // 如果URL中有指定活动ID，则选中对应活动
      if (route.params.id) {
        activeActivityId.value = route.params.id.toString();
      } else {
        // 否则默认选择第一个活动
        activeActivityId.value = activities.value.length > 0 ? activities.value[0].activityId.toString() : '1';
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
    // 更新URL但不重新加载页面
    window.history.pushState(
      {}, 
      '', 
      `/activity/${tabId}`
    );
  }
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
  getActivityDetail();
});
</script>

<style scoped>
.activity-detail-page {
  padding: 20px 0;
  background-color: #f4f5f7;
  min-height: calc(100vh - 120px);
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
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

.activity-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.activity-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fffaf7;
}

.title-section {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
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

.activity-title {
  margin: 0;
  font-size: 24px;
  color: #333;
  font-weight: bold;
}

.activity-meta {
  display: flex;
  align-items: center;
  color: #888;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.meta-item .el-icon {
  margin-right: 6px;
  color: #ff5722;
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

.action-buttons {
  padding: 10px 20px 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .activity-title {
    font-size: 20px;
  }
  
  .activity-content {
    padding: 16px;
  }
  
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
}
</style> 