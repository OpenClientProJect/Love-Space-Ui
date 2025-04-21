<template>
  <div class="home-image-manager">
    <div class="section-header">
      <h2>首页图片管理</h2>
      <span class="section-subtitle">管理网站首页的背景图和轮播图</span>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="image-tabs">
      <el-tab-pane label="背景图管理" name="background">
        <div class="tab-content">
          <div class="background-image-section">
            <h3 class="subsection-title">当前背景图</h3>
            <div class="current-image-container">
              <img :src="currentBackgroundImage" alt="当前背景图" class="preview-image">
              <div class="image-overlay">
                <el-button type="primary" @click="handleUpdateBackgroundClick">
                  <el-icon><Edit /></el-icon>
                  更换背景图
                </el-button>
              </div>
            </div>
          </div>
          
          <!-- 上传新背景图 -->
          <el-dialog
            v-model="backgroundUploadVisible"
            title="上传新背景图"
            width="500px"
          >
            <el-upload
              class="image-uploader"
              :action="uploadAction"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleBackgroundSuccess"
              :before-upload="beforeImageUpload"
              :on-error="handleUploadError"
            >
              <img v-if="backgroundImageUrl" :src="backgroundImageUrl" class="upload-preview" />
              <el-icon v-else class="upload-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">
              * 推荐尺寸: 1920×300px，JPG或PNG格式，文件大小不超过2MB
            </div>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="backgroundUploadVisible = false">取消</el-button>
                <el-button 
                  type="primary" 
                  :disabled="!backgroundImageUrl" 
                  @click="confirmUpdateBackground"
                >
                  确认更换
                </el-button>
              </span>
            </template>
          </el-dialog>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="轮播图管理" name="carousel">
        <div class="tab-content">
          <div class="action-bar">
            <el-button type="primary" @click="handleAddCarouselClick">
              <el-icon><Plus /></el-icon> 添加轮播图
            </el-button>
          </div>
          
          <!-- 轮播图列表 -->
          <div class="carousel-list">
            <el-table :data="carouselItems" style="width: 100%" v-loading="loading">
              <el-table-column label="预览" width="180">
                <template #default="scope">
                  <img :src="scope.row.image" class="table-image" />
                </template>
              </el-table-column>
              <el-table-column prop="title" label="标题" />
              <el-table-column prop="description" label="描述" show-overflow-tooltip />
              <el-table-column label="视频" width="100">
                <template #default="scope">
                  <el-tag v-if="scope.row.video" type="success">已设置</el-tag>
                  <el-tag v-else type="info">未设置</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button 
                    type="primary" 
                    link
                    @click="handleEditCarousel(scope.row)"
                  >
                    编辑
                  </el-button>
                  <el-button 
                    type="danger" 
                    link
                    @click="handleDeleteCarousel(scope.row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          
          <!-- 添加/编辑轮播图对话框 -->
          <el-dialog
            v-model="carouselDialogVisible"
            :title="editingCarousel ? '编辑轮播图' : '添加轮播图'"
            width="600px"
          >
            <el-form :model="carouselForm" label-width="100px" ref="carouselFormRef">
              <el-form-item label="标题" prop="title" required>
                <el-input v-model="carouselForm.title" placeholder="请输入轮播图标题" />
              </el-form-item>
              <el-form-item label="描述" prop="description">
                <el-input 
                  v-model="carouselForm.description" 
                  type="textarea" 
                  rows="2"
                  placeholder="请输入轮播图描述文字"
                />
              </el-form-item>
              <el-form-item label="图片" prop="image" required>
                <el-upload
                  class="carousel-image-uploader"
                  :action="uploadAction"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="handleCarouselImageSuccess"
                  :before-upload="beforeImageUpload"
                  :on-error="handleUploadError"
                >
                  <img v-if="carouselForm.image" :src="carouselForm.image" class="upload-preview" />
                  <el-icon v-else class="upload-icon"><Plus /></el-icon>
                </el-upload>
                <div class="upload-tip">
                  * 推荐尺寸: 960×480px，JPG或PNG格式
                </div>
              </el-form-item>
              <el-form-item label="视频地址" prop="video">
                <el-input v-model="carouselForm.video" placeholder="请输入视频URL地址（可选）" />
                <div class="upload-tip">
                  * 视频格式需为mp4，建议使用直链
                </div>
              </el-form-item>
              <el-form-item label="链接地址" prop="link">
                <el-input v-model="carouselForm.link" placeholder="请输入点击轮播图跳转的链接（可选）" />
                <div class="upload-tip">
                  * 例如: /video/1（站内链接）或 https://example.com（外部链接）
                </div>
              </el-form-item>
            </el-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="carouselDialogVisible = false">取消</el-button>
                <el-button 
                  type="primary" 
                  @click="submitCarouselForm"
                  :loading="submitting"
                >
                  确认
                </el-button>
              </span>
            </template>
          </el-dialog>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Plus, Upload, Picture } from '@element-plus/icons-vue'
import { useTokenStore } from '@/stores/token'
import defaultBackground from '@/assets/background/background.webp'

// 创建状态变量
const activeTab = ref('background')
const loading = ref(false)
const submitting = ref(false)
const backgroundUploadVisible = ref(false)
const carouselDialogVisible = ref(false)
const backgroundImageUrl = ref('')
const editingCarousel = ref(null)

// 当前背景图
const currentBackgroundImage = ref(defaultBackground)

// Token相关
const tokenStore = useTokenStore()
const uploadHeaders = computed(() => {
  return {
    Authorization: tokenStore.token ? `Bearer ${tokenStore.token}` : ''
  }
})

// 上传接口地址
const uploadAction = '/api/upload/image' // 修改为你的实际上传接口

// 轮播图列表
const carouselItems = ref([
  {
    id: 1,
    title: '我推的孩子',
    description: '16岁的天才少女星野爱久爱海梦想成为偶像，但在甄选会上却屡屡受挫...',
    image: 'https://play.xfvod.pro/images/hb/wtdhz.png',
    video: 'https://hydownload.pan.wo.cn/openapi/download?fid=wTbXk_kRq0NKsFelRGRstdjDMR/fEyQrMMRTbxIRvDvWfwStrRKqUxUwjmBEYYK7rnZA0ZXLTZtTX4zwcoayAgVQk2dA==',
    link: '/video/1'
  },
  {
    id: 2,
    title: '败犬女主太多了',
    description: '这是一段视频介绍文字，简单描述视频的主要内容...',
    image: 'https://play.xfvod.pro/images/hb/baiquan.jpg',
    video: 'https://tgh0tsm6ca.senhewenhua.com:8080/cache/6LSl54qs5aWz5Li75aSq5aSa5LqG77yBLUVQMS5tcDQ=.mp4?verify=1745028270-gqi6GLPClU8iQx7vnIuWhl%2F5HtFDtbnq7O1trk3vMMc%3D',
    link: '/video/2'
  },
  {
    id: 3,
    title: '青之箱',
    description: '这是另一段视频介绍文字，帮助用户了解视频内容...',
    image: 'https://play.xfvod.pro/images/hb/lx.jpg',
    video: 'https://tjdownload.pan.wo.cn/openapi/download?fid=11ZdW_3bp%2B4AeSsrwwrgRwvyMqP/CbTvxB/MojZMWZIkEEfNe7RFDpbiRit6qT2JiXZ%2BbQrgxEbx3kwQn8jpZ9AGGhMg==',
    link: '/video/3'
  },
  {
    id: 4,
    title: '缘结甘神家',
    description: '这是另一段视频介绍文字，帮助用户了解视频内容...',
    image: 'https://picgg.cycimg.me/banner/GXehBtTbYAALPbN-up2x.webp',
    video: 'https://tjdownload.pan.wo.cn/openapi/download?fid=cxHot_0WTDoRp%2BfdPpcnDVyNxk5CufKuJyv8GjprsE2lW4%2BKK5xyLGeeJJR7nYipRubIzDydsXcaguR6JyWTgFrzqvQA==',
    link: '/video/4'
  }
])

// 轮播图表单
const carouselForm = reactive({
  id: null,
  title: '',
  description: '',
  image: '',
  video: '',
  link: ''
})

// 初始化数据
const initData = async () => {
  loading.value = true
  try {
    // 这里应该调用API获取背景图和轮播图数据
    // const result = await getHomeImagesService()
    // carouselItems.value = result.data.carousel || []
    // if (result.data.background) {
    //   currentBackgroundImage.value = result.data.background
    // }
    
    // 目前使用模拟数据
    setTimeout(() => {
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取首页图片失败:', error)
    ElMessage.error('获取首页图片失败，请稍后重试')
    loading.value = false
  }
}

// 上传图片前验证
const beforeImageUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isWebP = file.type === 'image/webp'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG && !isWebP) {
    ElMessage.error('上传图片只能是 JPG/PNG/WebP 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理背景图上传成功
const handleBackgroundSuccess = (response) => {
  if (response.code === 200 && response.data) {
    backgroundImageUrl.value = response.data
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败: ' + (response.message || '未知错误'))
  }
}

// 处理轮播图上传成功
const handleCarouselImageSuccess = (response) => {
  if (response.code === 200 && response.data) {
    carouselForm.image = response.data
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败: ' + (response.message || '未知错误'))
  }
}

// 处理上传错误
const handleUploadError = (error) => {
  console.error('上传失败:', error)
  ElMessage.error('图片上传失败，请检查网络连接或稍后重试')
}

// 点击更新背景图
const handleUpdateBackgroundClick = () => {
  backgroundImageUrl.value = ''
  backgroundUploadVisible.value = true
}

// 确认更新背景图
const confirmUpdateBackground = async () => {
  if (!backgroundImageUrl.value) {
    ElMessage.warning('请先上传图片')
    return
  }
  
  submitting.value = true
  try {
    // 调用API更新背景图
    // await updateBackgroundImageService(backgroundImageUrl.value)
    
    // 模拟API调用
    setTimeout(() => {
      currentBackgroundImage.value = backgroundImageUrl.value
      ElMessage.success('背景图更新成功')
      backgroundUploadVisible.value = false
      submitting.value = false
    }, 500)
  } catch (error) {
    console.error('更新背景图失败:', error)
    ElMessage.error('更新背景图失败，请稍后重试')
    submitting.value = false
  }
}

// 点击添加轮播图
const handleAddCarouselClick = () => {
  editingCarousel.value = null
  Object.keys(carouselForm).forEach(key => {
    carouselForm[key] = key === 'id' ? null : ''
  })
  carouselDialogVisible.value = true
}

// 编辑轮播图
const handleEditCarousel = (item) => {
  editingCarousel.value = item
  Object.keys(carouselForm).forEach(key => {
    carouselForm[key] = item[key]
  })
  carouselDialogVisible.value = true
}

// 删除轮播图
const handleDeleteCarousel = (item) => {
  ElMessageBox.confirm(
    `确认要删除轮播图 "${item.title}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    loading.value = true
    try {
      // 调用API删除轮播图
      // await deleteCarouselItemService(item.id)
      
      // 模拟API调用
      setTimeout(() => {
        const index = carouselItems.value.findIndex(i => i.id === item.id)
        if (index !== -1) {
          carouselItems.value.splice(index, 1)
        }
        ElMessage.success('删除成功')
        loading.value = false
      }, 500)
    } catch (error) {
      console.error('删除轮播图失败:', error)
      ElMessage.error('删除轮播图失败，请稍后重试')
      loading.value = false
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 提交轮播图表单
const submitCarouselForm = async () => {
  // 表单验证
  if (!carouselForm.title) {
    return ElMessage.warning('请输入轮播图标题')
  }
  if (!carouselForm.image) {
    return ElMessage.warning('请上传轮播图图片')
  }
  
  submitting.value = true
  try {
    if (editingCarousel.value) {
      // 更新已有轮播图
      // await updateCarouselItemService(carouselForm)
      
      // 模拟API调用
      setTimeout(() => {
        const index = carouselItems.value.findIndex(i => i.id === carouselForm.id)
        if (index !== -1) {
          carouselItems.value[index] = { ...carouselForm }
        }
        ElMessage.success('轮播图更新成功')
        carouselDialogVisible.value = false
        submitting.value = false
      }, 500)
    } else {
      // 添加新轮播图
      // const result = await addCarouselItemService(carouselForm)
      
      // 模拟API调用
      setTimeout(() => {
        const newItem = { 
          ...carouselForm, 
          id: Date.now() // 模拟生成ID
        }
        carouselItems.value.push(newItem)
        ElMessage.success('轮播图添加成功')
        carouselDialogVisible.value = false
        submitting.value = false
      }, 500)
    }
  } catch (error) {
    console.error('保存轮播图失败:', error)
    ElMessage.error('保存轮播图失败，请稍后重试')
    submitting.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  initData()
})
</script>

<style scoped>
.home-image-manager {
  padding: 10px 0;
}

.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 20px;
  margin: 0 0 8px;
  color: #18191c;
}

.section-subtitle {
  font-size: 14px;
  color: #61666d;
}

.image-tabs {
  margin-top: 20px;
}

.tab-content {
  padding: 20px 0;
}

.subsection-title {
  font-size: 16px;
  margin: 0 0 16px;
  color: #18191c;
}

.current-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 24px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.current-image-container:hover .image-overlay {
  opacity: 1;
}

.image-uploader,
.carousel-image-uploader {
  width: 300px;
  height: 150px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-uploader:hover,
.carousel-image-uploader:hover {
  border-color: #fb7299;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
}

.action-bar {
  margin-bottom: 20px;
}

.carousel-list {
  margin-bottom: 20px;
}

.table-image {
  width: 120px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .carousel-list {
    width: 100%;
    overflow-x: auto;
  }
  
  .image-uploader,
  .carousel-image-uploader {
    width: 100%;
    max-width: 300px;
  }
}
</style> 