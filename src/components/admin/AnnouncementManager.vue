<template>
  <div class="announcement-manager">
    <div class="header-actions">
      <h2 class="section-title">公告管理</h2>
      <el-button type="primary" @click="openAnnouncementDialog(false)">
        <el-icon><Plus /></el-icon>发布公告
      </el-button>
    </div>
    
    <div v-loading="loading" class="announcement-list">
      <el-empty v-if="announcements.length === 0" description="暂无公告" />
      <el-card v-else v-for="item in announcements" :key="item.id" class="announcement-card" shadow="hover">
        <div class="announcement-header">
          <div class="announcement-actions">
            <el-button type="primary" link @click="openAnnouncementDialog(true, item)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button type="danger" link @click="deleteAnnouncement(item.id)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="announcement-content">{{ item.content }}</div>
        <div class="announcement-footer">
          <span class="announcement-time">发布时间: {{ formatDate(item.createTime) }}</span>
        </div>
      </el-card>
    </div>

    <!-- 公告表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑公告' : '发布公告'"
      width="600px"
      :close-on-click-modal="false"
      class="announcement-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        status-icon
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="formLoading">
            {{ isEdit ? '更新' : '发布' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Plus, Delete } from '@element-plus/icons-vue'

// 公告列表数据
const announcements = ref([])
const loading = ref(false)

// 表单相关
const dialogVisible = ref(false)
const formRef = ref(null)
const formLoading = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const form = ref({
  title: '',
  content: '',
  type: 'normal',
  status: 'active'
})
const rules = {
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在2到50个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' },
    { min: 5, max: 500, message: '内容长度在5到500个字符之间', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知时间';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 打开公告对话框
const openAnnouncementDialog = (editMode, announcement = null) => {
  isEdit.value = editMode;
  if (editMode && announcement) {
    form.value = { ...announcement };
    currentId.value = announcement.id;
  } else {
    form.value = {
      title: '',
      content: '',
      type: 'normal',
      status: 'active'
    };
    currentId.value = null;
  }
  dialogVisible.value = true;
};

// 提交表单
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      formLoading.value = true;
      try {
        // 这里应该调用API保存公告
        // 模拟API调用
        setTimeout(() => {
          if (isEdit.value) {
            const index = announcements.value.findIndex(item => item.id === currentId.value);
            if (index !== -1) {
              announcements.value[index] = {
                ...form.value,
                id: currentId.value,
                updateTime: new Date().toISOString()
              };
            }
            ElMessage.success('公告更新成功');
          } else {
            // 模拟新增
            announcements.value.unshift({
              ...form.value,
              id: Date.now(),
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString()
            });
            ElMessage.success('公告发布成功');
          }
          dialogVisible.value = false;
          formLoading.value = false;
        }, 1000);
      } catch (error) {
        ElMessage.error('操作失败，请稍后重试');
        formLoading.value = false;
      }
    }
  });
};

// 删除公告
const deleteAnnouncement = (id) => {
  ElMessageBox.confirm('确认删除该公告吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 这里应该调用API删除公告
    // 模拟API调用
    loading.value = true;
    setTimeout(() => {
      announcements.value = announcements.value.filter(item => item.id !== id);
      ElMessage.success('公告删除成功');
      loading.value = false;
    }, 1000);
  }).catch(() => {});
};

// 加载公告列表
const loadAnnouncements = () => {
  loading.value = true;
  // 这里应该调用API获取公告列表
  // 模拟API调用
  setTimeout(() => {
    // 模拟数据
    announcements.value = [
      {
        id: 1,
        title: '网站维护通知',
        content: '尊敬的用户，本站将于2025年5月1日凌晨2:00-4:00进行系统维护，期间网站将无法访问，请合理安排您的观影时间。',
        type: 'important',
        status: 'active',
        createTime: '2025-04-20 10:00:00',
        updateTime: '2025-04-20 10:00:00'
      },
      {
        id: 2,
        title: '五一活动预告',
        content: '五一劳动节期间，本站将推出特别活动，敬请期待！',
        type: 'event',
        status: 'active',
        createTime: '2025-04-18 14:30:00',
        updateTime: '2025-04-18 14:30:00'
      }
    ];
    loading.value = false;
  }, 1000);
};

// 初始化加载数据
onMounted(() => {
  loadAnnouncements();
});
</script>

<style scoped>
.announcement-manager {
  width: 100%;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.announcement-list {
  min-height: 300px;
}

.announcement-card {
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.announcement-card:hover {
  transform: translateY(-2px);
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.announcement-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.announcement-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
  white-space: pre-line;
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #999;
  font-size: 12px;
}

.announcement-time {
  color: #999;
}

/* 公告表单对话框样式 */
.announcement-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 