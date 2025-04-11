<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import {getVideoListService} from "@/api/video";
import { VideoPlay, CaretTop, ArrowUp, Refresh } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

// 添加 router 实例
const router = useRouter()

// 视频列表数据模型
const videos = ref([])

// 轮播图数据模型
const carouselItems = ref([
  {
    id: 1,
    title: '我推的孩子',
    description: '16岁的天才少女星野爱久爱海梦想成为偶像，但在甄选会上却屡屡受挫...',
    image: 'https://play.xfvod.pro/images/hb/wtdhz.png',
    link: '/video/1'
  },
  {
    id: 2,
    title: '败犬女主太多了',
    description: '这是一段视频介绍文字，简单描述视频的主要内容...',
    image: 'https://play.xfvod.pro/images/hb/baiquan.jpg',
    link: '/video/2'
  },
  {
    id: 3,
    title: '青之箱',
    description: '这是另一段视频介绍文字，帮助用户了解视频内容...',
    image: 'https://play.xfvod.pro/images/hb/lx.jpg',
    link: '/video/3'
  },
  {
    id: 4,
    title: '缘结甘神家',
    description: '这是另一段视频介绍文字，帮助用户了解视频内容...',
    image: 'https://picgg.cycimg.me/banner/GXehBtTbYAALPbN-up2x.webp',
    link: '/video/4'
  }
])

// 分类导航
const categories = ref([
  '沙雕', '恋爱', '校园', '热血', '奇幻', '小说', '漫画', '短剧'
])

// 当前激活的分类
const activeCategory = ref('沙雕')

// 分类点击处理
const handleCategoryClick = (category) => {
  activeCategory.value = category
  // 这里可以添加根据分类筛选内容的逻辑
  console.log('选择分类:', category)
}

// 更新轮播图高度的函数
const updateCarouselHeight = () => {
  // 在新布局中，轮播图高度固定
  carouselHeight.value = '480px'
}

// 轮播图高度
const carouselHeight = ref('480px')

// 视频分组，前6个显示在主区域，其余的显示在底部
const topVideos = computed(() => {
  return videos.value.slice(0, 6);
});

const bottomVideos = computed(() => {
  return videos.value.slice(6);
});

//调用获取视频列表数据接口
const getVideoList = async () => {
  const res = await getVideoListService()
  videos.value = res.data
}
getVideoList()

// 添加视频点击处函数
const handleVideoClick = (video) => {
  router.push({
    path: `/video/${video.id}`,
    // 可选:通过 query 传递一些基础数据,减少详情页的首次加载等待
    query: {
      title: video.title,
      cover: video.cover
    }
  })
}

// 添加刷新方法
const handleRefresh = () => {
  window.location.reload()
}

// 监听窗口大小变化
onMounted(() => {
  updateCarouselHeight()
  window.addEventListener('resize', updateCarouselHeight)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', updateCarouselHeight)
})
</script>

<template>
  <div class="home">
    <!-- 顶部背景图 -->
    <div class="top-background">
      <img src="../assets/background/background.webp" alt="顶部背景图" class="background-image">
    </div>

    <!-- 分类导航 -->
    <div class="category-nav">
      <div
          class="category-item"
          v-for="(category, index) in categories"
          :key="index"
          @click="handleCategoryClick(category)"
          :class="{ active: category === activeCategory }"
      >
        {{ category }}
      </div>
    </div>
    
    <!-- 新的主要内容区域，左边轮播图，右边视频 -->
    <div class="main-layout">
      <!-- 左侧轮播图区域 -->
      <div class="left-carousel">
        <el-carousel
          :height="carouselHeight"
          class="carousel-container"
          :interval="4000"
          :indicator-position="'none'"
        >
          <el-carousel-item v-for="item in carouselItems" :key="item.id" class="carousel-item">
            <div class="carousel-content">
              <img :src="item.image" :alt="item.title" class="carousel-image">
              <div class="carousel-overlay">
                <h3 class="carousel-title">{{ item.title }}</h3>
                <p class="carousel-description">{{ item.description }}</p>
                <div class="carousel-info">
                  <span class="play-icon">
                    <el-icon><VideoPlay /></el-icon>
                    立即观看
                  </span>
                </div>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 右侧视频区域 -->
      <div class="right-videos">
        <!-- 视频列表 -->
        <div class="video-grid">
          <div v-for="(video, index) in topVideos" :key="index" class="video-card" @click="handleVideoClick(video)">
            <div class="video-thumbnail">
              <img :src="video.cover" :alt="video.title" class="cover-image">
            </div>
            <div class="video-title">
              {{ video.title }}
            </div>
            <div class="video-info">
              <div class="uploader">
                <span class="up-tag"><img src="../assets/iconsvg/up.svg" style="width: 20px" alt=""></span>
                <img :src="video.userPic || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" class="user-avatar">
                <span class="username">{{ video.nickname }} </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部额外内容区域 -->
    <div class="bottom-section" v-if="bottomVideos.length > 0">
      <div class="section-title">
        <h2>更多推荐</h2>
      </div>
      <div class="bottom-video-grid">
        <div v-for="(video, index) in bottomVideos" :key="index" class="video-card" @click="handleVideoClick(video)">
          <div class="video-thumbnail">
            <img :src="video.cover" :alt="video.title" class="cover-image">
          </div>
          <div class="video-title">
            {{ video.title }}
          </div>
          <div class="video-info">
            <div class="uploader">
              <span class="up-tag"><img src="../assets/iconsvg/up.svg" style="width: 20px" alt=""></span>
              <img :src="video.userPic || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" class="user-avatar">
              <span class="username">{{ video.nickname }} </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改固定按钮组 -->
    <div class="fixed-buttons">
      <!-- 刷新按钮 -->
      <div class="action-button refresh-btn" @click="handleRefresh">
        <el-icon><Refresh /></el-icon>
      </div>

      <!-- 返回顶部按钮 -->
      <el-backtop
        :right="40"
        :bottom="100"
        :visibility-height="400"
        class="back-to-top"
      >
        <div class="back-top-content">
          <el-icon><ArrowUp /></el-icon>
        </div>
      </el-backtop>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding-bottom: 20px;
  width: 100%;
  min-height: 100vh;
  padding-top: 0;
  margin: 0 auto;
  position: relative;
  max-width: 100%;
  background-color: #f4f5f7;
}

/* 顶部背景图样式 */
.top-background {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  z-index: 0;
  margin-bottom: 10px;
  margin-top: -64px; /* 负外边距，使背景图位于导航栏下方 */
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 添加顶部背景图蒙版效果 */
.top-background::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.2) 20%,
    rgba(0, 0, 0, 0) 40%,
    rgba(244, 245, 247, 0) 60%,
    rgba(244, 245, 247, 0.8) 95%,
    rgba(244, 245, 247, 1) 100%
  ),
  linear-gradient(
    to right,
    rgba(244, 245, 247, 0.5) 0%,
    rgba(244, 245, 247, 0) 10%,
    rgba(244, 245, 247, 0) 90%,
    rgba(244, 245, 247, 0.5) 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* 分类导航样式 */
.category-nav {
  display: flex;
  justify-content: space-around;
  padding: 12px 40px;
  margin-bottom: 0;
  margin-top: 0;
  overflow-x: auto;
  white-space: nowrap;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  position: relative;
  z-index: 2; /* 确保在背景图上方 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
}

/* 隐藏滚动条 Chrome, Safari */
.category-nav::-webkit-scrollbar {
  display: none;
}

.category-item {
  padding: 6px 20px;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.3s;
  position: relative;
  box-sizing: border-box;
}

.category-item:hover {
  color: #fb7299;
  transform: scale(1.05);
}

/* 修改激活状态样式，确保不会导致内容溢出 */
.category-item.active {
  color: #fb7299;
  font-weight: bold;
}

.category-item.active::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: #fb7299;
  border-radius: 2px;
  /* 确保伪元素不会造成内容溢出 */
  box-sizing: content-box;
}

/* 新的主布局样式 */
.main-layout {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  padding: 0 40px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 2; /* 确保在背景图上方 */
}

.left-carousel {
  width: 40%;
  min-width: 460px;
}

.right-videos {
  width: 60%;
  flex-grow: 1;
}

/* 轮播图样式 */
.carousel-container {
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.carousel-item {
  overflow: hidden;
  border-radius: 4px;
}

.carousel-content {
  position: relative;
  height: 100%;
  transition: transform 0.3s ease;
  overflow: hidden;
  border-radius: 4px;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(
    transparent 0%,
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 0, 0, 0.8) 100%
  );
  color: #fff;
}

.carousel-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  margin-bottom: 8px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.carousel-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 10px 0;
  line-height: 1.4;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.carousel-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.play-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #fb7299;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-icon:hover {
  background-color: #fc8bab;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(251, 114, 153, 0.4);
}

/* 视频网格样式 */
.video-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
}

.video-card {
  overflow: hidden;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  min-width: 0;
  margin-bottom: 0;
  background-color: #fff;
  border: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.video-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-thumbnail {
  position: relative;
  aspect-ratio: 16 / 9;
  background-color: #f5f5f5;
  margin-bottom: 0;
  overflow: hidden;
  border-radius: 6px 6px 0 0;
}

.video-title {
  margin: 0;
  padding: 8px 10px;
  -webkit-line-clamp: 1;
  line-height: 1.3;
  font-weight: normal;
  height: auto;
  border-bottom: 1px solid #f0f0f0;
  white-space: nowrap;
  background-color: #f8f8f9;
}

.video-info {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  padding: 6px 10px;
  text-align: left;
  margin-top: 0;
}

.uploader {
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
}

.up-tag {
  color: #fb7299;
  font-weight: bold;
  font-size: 12px;
  margin-right: 0;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.video-thumbnail:hover .cover-image {
  transform: scale(1.05);
}

.video-duration {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 0 4px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  border-radius: 2px;
  line-height: 1.5;
}

.video-views {
  position: absolute;
  bottom: 8px;
  left: 8px;
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 添加固定按钮组样式 */
.fixed-buttons {
  position: fixed;
  right: 40px;
  bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 999;
}

/* 通用按钮样式 */
.action-button {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background-color: #fb7299;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-button:hover {
  background-color: #fc8bab;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(251, 114, 153, 0.3);
}

.action-button .el-icon {
  font-size: 20px;
}

/* 返回顶部按钮样式 */
.back-to-top {
  --el-backtop-bg-color: #fb7299;
  --el-backtop-text-color: #fff;
  --el-backtop-hover-bg-color: #fc8bab;
}

.back-top-content {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-top-content .el-icon {
  font-size: 20px;
}

:deep(.el-backtop) {
  background-color: var(--el-backtop-bg-color);
  color: var(--el-backtop-text-color);
  height: 44px;
  width: 44px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: static;
  transform: none;
}

:deep(.el-backtop:hover) {
  background-color: var(--el-backtop-hover-bg-color);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(251, 114, 153, 0.3);
}

/* 响应式调整 */
@media screen and (max-width: 1200px) {
  .main-layout {
    flex-direction: column;
  }
  
  .left-carousel, .right-videos {
    width: 100%;
    min-width: auto;
  }
  
  .video-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media screen and (max-width: 992px) {
  .video-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .video-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .fixed-buttons {
    right: 20px;
    bottom: 20px;
    gap: 12px;
  }
  
  .action-button,
  :deep(.el-backtop) {
    width: 40px;
    height: 40px;
  }
  
  .carousel-title {
    font-size: 20px;
  }
  
  .carousel-description {
    -webkit-line-clamp: 1;
  }
}

@media screen and (max-width: 576px) {
  .video-grid {
    grid-template-columns: repeat(1, 1fr);
  }
  
  .carousel-title {
    font-size: 18px;
  }
  
  .category-nav {
    padding: 0 10px;
  }
  
  .category-item {
    padding: 8px 12px;
    font-size: 14px;
  }
}

/* 视频缩略图样式优化 */
.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #666;
  font-size: 12px;
}

/* 底部内容区域样式 */
.bottom-section {
  margin-top: 40px;
  padding: 0 40px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 40px;
}

.section-title {
  margin-bottom: 20px;
  border-left: 4px solid #fb7299;
  padding-left: 12px;
}

.section-title h2 {
  font-size: 20px;
  font-weight: bold;
  color: #18191c;
  margin: 0;
}

.bottom-video-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  width: 100%;
}

/* 响应式调整 */
@media screen and (max-width: 1200px) {
  .bottom-video-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media screen and (max-width: 992px) {
  .bottom-video-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .bottom-video-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .bottom-section {
    padding: 0 20px;
  }
}

@media screen and (max-width: 576px) {
  .bottom-video-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>