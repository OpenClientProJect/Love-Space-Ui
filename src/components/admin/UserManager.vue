<template>
  <div class="user-content">
    <!-- 顶部操作区域 -->
    <div class="header-actions">
      <h2 class="section-title">用户管理</h2>
      <div class="action-group">
        <el-button type="primary" @click="refreshData" class="refresh-button">
          <el-icon>
            <Refresh/>
          </el-icon>
          刷新列表
        </el-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-container">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="用户角色">
          <el-select v-model="filterRole" placeholder="选择角色" clearable>
            <el-option label="全部" value=""/>
            <el-option label="普通用户" value="user"/>
            <el-option label="管理员" value="admin"/>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterStatus" placeholder="选择状态" clearable>
            <el-option label="全部" value=""/>
            <el-option label="正常" :value="1"/>
            <el-option label="禁用" :value="0"/>
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchKeyword" placeholder="用户名/昵称/邮箱" clearable/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search/>
            </el-icon>
            搜索
          </el-button>
          <el-button @click="resetFilter">
            <el-icon>
              <RefreshRight/>
            </el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="userList.length === 0 && !loading">
      <el-empty description="暂无用户数据">
        <template #description>
          <p class="empty-text">暂无符合条件的用户</p>
        </template>
      </el-empty>
    </div>

    <!-- 用户列表表格 -->
    <el-table
        v-if="userList.length > 0"
        :data="userList"
        border
        style="width: 100%"
        v-loading="loading"
    >
      <el-table-column type="index" width="50" label="序号"/>
      <el-table-column prop="id" label="用户ID" width="100"/>
      <el-table-column label="用户头像" width="80">
        <template #default="scope">
          <el-avatar :size="40" :src="scope.row.userPic || defaultAvatar">
            {{ scope.row.nickname?.substring(0, 1) || '用' }}
          </el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" width="120"/>
      <el-table-column prop="nickname" label="昵称" width="120"/>
      <el-table-column prop="email" label="邮箱" width="180"/>
      <el-table-column label="性别" width="80">
        <template #default="scope">
          <span>{{ scope.row.sex === 0 ? '男' : scope.row.sex === 1 ? '女' : '未知' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'primary'">
            {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="注册时间" width="180"/>
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="scope">
          <el-button
              size="small"
              type="primary"
              @click="viewUserDetail(scope.row)"
          >
            查看
          </el-button>
          <el-button
              size="small"
              :type="scope.row.status === 1 ? 'danger' : 'success'"
              @click="toggleUserStatus(scope.row)"
          >
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button
              v-if="scope.row.role !== 'admin'"
              size="small"
              type="warning"
              @click="setAsAdmin(scope.row)"
          >
            设为管理员
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-container" v-if="pagination.total > 0">
      <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
      />
    </div>

    <!-- 用户详情对话框 -->
    <el-dialog
        v-model="userDetailDialogVisible"
        title="用户详情"
        width="500px"
    >
      <div class="user-detail" v-if="currentUser">
        <div class="user-header">
          <el-avatar :size="80" :src="currentUser.userPic || defaultAvatar">
            {{ currentUser.nickname?.substring(0, 1) || '用' }}
          </el-avatar>
          <div class="user-basic-info">
            <h3>{{ currentUser.nickname }}</h3>
            <p>ID: {{ currentUser.id }}</p>
            <p>用户名: {{ currentUser.username }}</p>
          </div>
        </div>
        <div class="user-info-list">
          <div class="info-item">
            <span class="label">邮箱:</span>
            <span class="value">{{ currentUser.email || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="label">性别:</span>
            <span class="value">{{ currentUser.sex === 0 ? '男' : currentUser.sex === 1 ? '女' : '未知' }}</span>
          </div>
          <div class="info-item">
            <span class="label">角色:</span>
            <span class="value">
              <el-tag :type="currentUser.role === 'admin' ? 'danger' : 'primary'">
                {{ currentUser.role === 'admin' ? '管理员' : '普通用户' }}
              </el-tag>
            </span>
          </div>
          <div class="info-item">
            <span class="label">状态:</span>
            <span class="value">
              <el-tag :type="currentUser.status === 1 ? 'success' : 'info'">
                {{ currentUser.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </span>
          </div>
          <div class="info-item">
            <span class="label">注册时间:</span>
            <span class="value">{{ currentUser.createTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">最后更新:</span>
            <span class="value">{{ currentUser.updateTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">简介:</span>
            <span class="value">{{ currentUser.introduction || '暂无简介' }}</span>
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
import {ref, onMounted} from 'vue'
import {ElMessage} from 'element-plus'
import {getUserListService, updateUserStatusService, updateUserRoleService} from '@/api/admin/managementUser'
import {Refresh, Search, RefreshRight} from '@element-plus/icons-vue'

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 数据加载状态
const loading = ref(false)

// 用户列表数据
const userList = ref([])

// 筛选条件
const filterRole = ref('')
const filterStatus = ref('')
const searchKeyword = ref('')

// 分页信息
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 用户详情对话框
const userDetailDialogVisible = ref(false)
const currentUser = ref(null)

// 操作确认对话框
const confirmDialogVisible = ref(false)
const confirmDialogTitle = ref('')
const confirmDialogMessage = ref('')
const confirmCallback = ref(null)

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
      role: filterRole.value || undefined,
      status: filterStatus.value !== '' ? filterStatus.value : undefined,
      keyword: searchKeyword.value || undefined
    }

    const res = await getUserListService(params)
    if (res.code === 200) {
      userList.value = res.data || []
      pagination.value.total = res.total || userList.value.length
    } else {
      ElMessage.error(res.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表出错:', error)
    ElMessage.error('系统异常，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  loadUserList()
}

// 搜索
const handleSearch = () => {
  pagination.value.pageNum = 1
  loadUserList()
}

// 重置筛选条件
const resetFilter = () => {
  filterRole.value = ''
  filterStatus.value = ''
  searchKeyword.value = ''
  pagination.value.pageNum = 1
  loadUserList()
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  loadUserList()
}

const handleCurrentChange = (page) => {
  pagination.value.pageNum = page
  loadUserList()
}

// 查看用户详情
const viewUserDetail = (user) => {
  currentUser.value = user
  userDetailDialogVisible.value = true
}

// 切换用户状态（启用/禁用）
const toggleUserStatus = (user) => {
  confirmDialogTitle.value = user.status === 1 ? '禁用用户' : '启用用户'
  confirmDialogMessage.value = user.status === 1
      ? `确定要禁用用户 "${user.nickname}" 吗？禁用后该用户将无法登录系统。`
      : `确定要启用用户 "${user.nickname}" 吗？`

  confirmCallback.value = async () => {
    try {
      await updateUserStatusService(user.id);
      const newStatus = user.status === 1 ? 0 : 1;
      ElMessage.success(`已${user.status === 1 ? '禁用' : '启用'}用户: ${user.nickname}`)
      user.status = newStatus;
      // 刷新用户列表
      await loadUserList();
    } finally {
      confirmDialogVisible.value = false
    }
  }

  confirmDialogVisible.value = true
}

// 设置为管理员
const setAsAdmin = (user) => {
  confirmDialogTitle.value = '设置管理员'
  confirmDialogMessage.value = `确定要将用户 "${user.nickname}" 设置为管理员吗？`

  confirmCallback.value = async () => {
    try {
      await updateUserRoleService(user.id);
      ElMessage.success(`已将用户 ${user.nickname} 设置为管理员`)
      user.role = 'admin'
    } catch (error) {
      console.error('更新用户角色出错:', error)
      ElMessage.error('系统异常，请稍后重试')
    } finally {
      confirmDialogVisible.value = false
    }
  }

  confirmDialogVisible.value = true
}

// 确认操作
const handleConfirmAction = () => {
  if (typeof confirmCallback.value === 'function') {
    confirmCallback.value()
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.user-content {
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.action-group {
  display: flex;
  gap: 10px;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.filter-container {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.empty-state {
  margin: 40px 0;
  text-align: center;
}

.empty-text {
  color: #909399;
  font-size: 14px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.user-detail {
  padding: 10px;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.user-basic-info {
  margin-left: 20px;
}

.user-basic-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.user-basic-info p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.user-info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
}

.label {
  width: 100px;
  color: #606266;
  font-weight: 500;
}

.value {
  flex: 1;
  color: #333;
}
</style> 