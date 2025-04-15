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
          <div class="announcement-title">
            <span class="title-text">{{ item.title }}</span>
          </div>
          <div class="announcement-actions">
            <el-button type="primary" link @click="openAnnouncementDialog(true, item)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button type="danger" link @click="deleteAnnouncement(item.id)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="announcement-content">{{ item.text }}</div>
        <div class="announcement-image" v-if="item.imageUrl">
          <el-image 
            :src="item.imageUrl" 
            :preview-src-list="[item.imageUrl]"
            fit="cover"
            class="content-image"
          />
        </div>
        <div class="announcement-video" v-if="item.videoUrl">
          <video 
            :src="item.videoUrl" 
            controls
            class="content-video"
          />
        </div>
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
        <el-form-item label="内容" prop="text">
          <el-input
            v-model="form.text"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容"
          />
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
            class="upload-container"
            action="/api/file/uploadImage"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-remove="handleRemove"
            :file-list="fileList"
            :limit="1"
            list-type="picture-card"
            :headers="uploadHeaders"
            name="image"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                只能上传jpg/png文件，且不超过2MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="视频">
          <el-upload
            class="upload-container"
            action="/api/file/uploadVideo"
            :on-success="handleVideoUploadSuccess"
            :on-error="handleUploadError"
            :on-remove="handleVideoRemove"
            :file-list="videoFileList"
            :limit="1"
            :headers="uploadHeaders"
            name="video"
          >
            <el-button type="primary">上传视频</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传mp4格式视频，且不超过100MB
              </div>
            </template>
          </el-upload>
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
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Plus, Delete } from '@element-plus/icons-vue'
import { 
  publishAnnouncementService, 
  getAnnouncementListService, 
  deleteAnnouncementService,
  updateAnnouncementService
} from '@/api/Announcement'
import { useTokenStore } from '@/stores/token'

// 公告列表数据
const announcements = ref([])
const loading = ref(false)

// 表单相关
const dialogVisible = ref(false)
const formRef = ref(null)
const formLoading = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const fileList = ref([])
const videoFileList = ref([])
const tokenStore = useTokenStore()

// 计算上传请求头，添加token认证
const uploadHeaders = computed(() => {
  return {
    'Authorization': tokenStore.token ? `Bearer ${tokenStore.token}` : ''
  }
})

// 处理上传成功
const handleUploadSuccess = (response, file, fileList) => {
  if (response.code === 200) {
    ElMessage.success('图片上传成功')
    form.value.imageUrl = response.data
  } else {
    ElMessage.error(response.message || '上传失败')
    fileList.pop()
  }
}

// 处理上传错误
const handleUploadError = (error) => {
  console.error('上传失败:', error)
  ElMessage.error('图片上传失败，请稍后重试')
}

// 处理移除文件
const handleRemove = () => {
  form.value.imageUrl = ''
}

// 处理视频上传成功
const handleVideoUploadSuccess = (response, file, fileList) => {
  if (response.code === 200) {
    ElMessage.success('视频上传成功')
    form.value.videoUrl = response.data
  } else {
    ElMessage.error(response.message || '上传失败')
    fileList.pop()
  }
}

// 处理视频移除
const handleVideoRemove = () => {
  form.value.videoUrl = ''
}

// 表单数据
const form = ref({
  title: '',
  text: '',
  type: 'normal',
  status: 'active',
  imageUrl: '',
  videoUrl: ''
})
const rules = {
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在2到50个字符之间', trigger: 'blur' }
  ],
  text: [
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
  fileList.value = []
  videoFileList.value = []
  
  if (editMode && announcement) {
    form.value = { ...announcement };
    currentId.value = announcement.id;
    
    // 如果有图片，添加到预览列表
    if (announcement.imageUrl) {
      fileList.value = [{
        name: '预览图片',
        url: announcement.imageUrl
      }]
    }
    
    // 如果有视频，添加到预览列表
    if (announcement.videoUrl) {
      videoFileList.value = [{
        name: '预览视频',
        url: announcement.videoUrl
      }]
    }
  } else {
    form.value = {
      title: '',
      text: '',
      type: 'normal',
      status: 'active',
      imageUrl: '',
      videoUrl: ''
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
        let result;
        
        if (isEdit.value) {
          // 调用更新API
          result = await updateAnnouncementService(currentId.value, form.value);
        } else {
          // 调用新增API
          result = await publishAnnouncementService(form.value);
        }
        
        if (result.code === 200) {
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
            // 添加新发布的公告到列表
            const newAnnouncement = {
              ...form.value,
              id: result.data.id || Date.now(),
              createTime: result.data.createTime || new Date().toISOString(),
              updateTime: result.data.updateTime || new Date().toISOString()
            };
            announcements.value.unshift(newAnnouncement);
            ElMessage.success('公告发布成功');
          }
          dialogVisible.value = false;
        } else {
          ElMessage.error(result.message || '操作失败');
        }
      } catch (error) {
        console.error('公告操作失败:', error);
        ElMessage.error('操作失败，请稍后重试');
      } finally {
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
  }).then(async () => {
    loading.value = true;
    try {
      const result = await deleteAnnouncementService(id);
      if (result.code === 200) {
        announcements.value = announcements.value.filter(item => item.id !== id);
        ElMessage.success('公告删除成功');
      } else {
        ElMessage.error(result.message || '删除失败');
      }
    } catch (error) {
      console.error('删除公告失败:', error);
      ElMessage.error('删除失败，请稍后重试');
    } finally {
      loading.value = false;
    }
  }).catch(() => {});
};

// 加载公告列表
const loadAnnouncements = async () => {
  loading.value = true;
  try {
    const result = await getAnnouncementListService();
    if (result.code === 200) {
      announcements.value = result.data || [];
    } else {
      ElMessage.error(result.message || '获取公告列表失败');
      announcements.value = [];
    }
  } catch (error) {
    console.error('获取公告列表失败:', error);
    ElMessage.error('获取公告列表失败，请稍后重试');
    announcements.value = [];
  } finally {
    loading.value = false;
  }
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

.announcement-image {
  margin-top: 10px;
  margin-bottom: 16px;
}

.content-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
}

.announcement-video {
  margin-top: 10px;
  margin-bottom: 16px;
}

.content-video {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
}

.upload-container {
  width: 100%;
}
</style> 