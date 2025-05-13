<template>
  <div class="category-content">
    <!-- 顶部操作区域 -->
    <div class="header-actions">
      <h2 class="section-title">分类管理</h2>
      <div class="action-group">
        <el-button type="primary" @click="refreshData" class="refresh-button">
          <el-icon>
            <Refresh/>
          </el-icon>
          刷新列表
        </el-button>
      </div>
    </div>

    <div class="category-container">
      <!-- 主分类区域 -->
      <div class="category-section">
        <div class="section-header">
          <h3>主分类</h3>
          <el-button type="success" size="small" @click="showAddMainCategoryDialog">
            <el-icon><Plus /></el-icon>
            添加主分类
          </el-button>
        </div>

        <!-- 主分类空状态 -->
        <div class="empty-state" v-if="mainCategoryList.length === 0 && !mainCategoryLoading">
          <el-empty description="暂无主分类数据">
            <template #description>
              <p class="empty-text">暂无主分类，请添加</p>
            </template>
          </el-empty>
        </div>

        <!-- 主分类表格 -->
        <el-table
          v-if="mainCategoryList.length > 0"
          :data="mainCategoryList"
          border
          style="width: 100%"
          v-loading="mainCategoryLoading"
        >
          <el-table-column type="index" width="50" label="序号"/>
          <el-table-column prop="categoryId" label="分类ID" width="100"/>
          <el-table-column prop="categoryName" label="分类名称"/>
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="showEditMainCategoryDialog(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="showDeleteMainCategoryConfirm(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 子分类区域 -->
      <div class="category-section">
        <div class="section-header">
          <h3>子分类</h3>
          <el-button type="success" size="small" @click="showAddSubCategoryDialog">
            <el-icon><Plus /></el-icon>
            添加子分类
          </el-button>
        </div>

        <!-- 子分类空状态 -->
        <div class="empty-state" v-if="subCategoryList.length === 0 && !subCategoryLoading">
          <el-empty description="暂无子分类数据">
            <template #description>
              <p class="empty-text">暂无子分类，请添加</p>
            </template>
          </el-empty>
        </div>

        <!-- 子分类表格 -->
        <el-table
          v-if="subCategoryList.length > 0"
          :data="subCategoryList"
          border
          style="width: 100%"
          v-loading="subCategoryLoading"
        >
          <el-table-column type="index" width="50" label="序号"/>
          <el-table-column prop="categoryId" label="分类ID" width="80"/>
          <el-table-column prop="categoryName" label="分类名称"/>
          <el-table-column label="所属主分类" width="150">
            <template #default="scope">
              <span>{{ getMainCategoryName(scope.row.mainCategoryId) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="showEditSubCategoryDialog(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="showDeleteSubCategoryConfirm(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 添加主分类对话框 -->
    <el-dialog v-model="addMainCategoryDialogVisible" title="添加主分类" width="30%">
      <el-form :model="mainCategoryForm" label-width="120px" ref="mainCategoryFormRef">
        <el-form-item label="分类名称" prop="categoryName" :rules="[{ required: true, message: '分类名称不能为空', trigger: 'blur' }]">
          <el-input v-model="mainCategoryForm.categoryName" placeholder="请输入分类名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addMainCategoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitMainCategory">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑主分类对话框 -->
    <el-dialog v-model="editMainCategoryDialogVisible" title="编辑主分类" width="30%">
      <el-form :model="mainCategoryForm" label-width="120px" ref="editMainCategoryFormRef">
        <el-form-item label="分类名称" prop="categoryName" :rules="[{ required: true, message: '分类名称不能为空', trigger: 'blur' }]">
          <el-input v-model="mainCategoryForm.categoryName" placeholder="请输入分类名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editMainCategoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditMainCategory">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加子分类对话框 -->
    <el-dialog v-model="addSubCategoryDialogVisible" title="添加子分类" width="30%">
      <el-form :model="subCategoryForm" label-width="120px" ref="subCategoryFormRef">
        <el-form-item label="所属主分类" prop="mainCategoryId" :rules="[{ required: true, message: '请选择所属主分类', trigger: 'change' }]">
          <el-select v-model="subCategoryForm.mainCategoryId" placeholder="请选择所属主分类">
            <el-option
              v-for="item in mainCategoryList"
              :key="item.categoryId"
              :label="item.categoryName"
              :value="item.categoryId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分类名称" prop="categoryName" :rules="[{ required: true, message: '分类名称不能为空', trigger: 'blur' }]">
          <el-input v-model="subCategoryForm.categoryName" placeholder="请输入分类名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addSubCategoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSubCategory">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑子分类对话框 -->
    <el-dialog v-model="editSubCategoryDialogVisible" title="编辑子分类" width="30%">
      <el-form :model="subCategoryForm" label-width="120px" ref="editSubCategoryFormRef">
        <el-form-item label="所属主分类" prop="mainCategoryId" :rules="[{ required: true, message: '请选择所属主分类', trigger: 'change' }]">
          <el-select v-model="subCategoryForm.mainCategoryId" placeholder="请选择所属主分类">
            <el-option
              v-for="item in mainCategoryList"
              :key="item.categoryId"
              :label="item.categoryName"
              :value="item.categoryId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分类名称" prop="categoryName" :rules="[{ required: true, message: '分类名称不能为空', trigger: 'blur' }]">
          <el-input v-model="subCategoryForm.categoryName" placeholder="请输入分类名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editSubCategoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditSubCategory">确认</el-button>
        </span>
      </template>
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
import { 
  getCategoryListService, 
  addMainCategoryService, 
  addSubCategoryService,
  updateMainCategoryService,
  updateSubCategoryService,
  deleteMainCategoryService,
  deleteSubCategoryService
} from '@/api/admin/category'
import { Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'

// 数据加载状态
const mainCategoryLoading = ref(false)
const subCategoryLoading = ref(false)

// 分类列表数据
const mainCategoryList = ref([])
const subCategoryList = ref([])

// 对话框显示状态
const addMainCategoryDialogVisible = ref(false)
const editMainCategoryDialogVisible = ref(false)
const addSubCategoryDialogVisible = ref(false)
const editSubCategoryDialogVisible = ref(false)

// 表单数据
const mainCategoryForm = ref({
  categoryId: null,
  categoryName: ''
})
const subCategoryForm = ref({
  categoryId: null,
  mainCategoryId: null,
  categoryName: ''
})

// 表单引用
const mainCategoryFormRef = ref(null)
const editMainCategoryFormRef = ref(null)
const subCategoryFormRef = ref(null)
const editSubCategoryFormRef = ref(null)

// 操作确认对话框
const confirmDialogVisible = ref(false)
const confirmDialogTitle = ref('')
const confirmDialogMessage = ref('')
const confirmCallback = ref(null)

// 加载分类列表
const loadCategoryList = async () => {
  mainCategoryLoading.value = true
  subCategoryLoading.value = true
  try {
    const res = await getCategoryListService()
    mainCategoryList.value = res.data.mainCategoryList || []
    subCategoryList.value = res.data.subCategoryList || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败，请稍后重试')
  } finally {
    mainCategoryLoading.value = false
    subCategoryLoading.value = false
  }
}

// 获取主分类名称
const getMainCategoryName = (mainCategoryId) => {
  const category = mainCategoryList.value.find(item => item.categoryId === mainCategoryId)
  return category ? category.categoryName : '未知主分类'
}

// 刷新数据
const refreshData = () => {
  loadCategoryList()
}

// 显示添加主分类对话框
const showAddMainCategoryDialog = () => {
  mainCategoryForm.value = { categoryId: null, categoryName: '' }
  addMainCategoryDialogVisible.value = true
}

// 显示编辑主分类对话框
const showEditMainCategoryDialog = (category) => {
  mainCategoryForm.value = { ...category }
  editMainCategoryDialogVisible.value = true
}

// 显示删除主分类确认框
const showDeleteMainCategoryConfirm = (category) => {
  // 检查是否有子分类依赖于这个主分类
  const hasSubCategories = subCategoryList.value.some(item => item.mainCategoryId === category.categoryId)
  
  if (hasSubCategories) {
    ElMessage.warning('该主分类下有子分类，请先删除子分类')
    return
  }
  
  confirmDialogTitle.value = '删除主分类'
  confirmDialogMessage.value = `确定要删除主分类 "${category.categoryName}" 吗？`
  
  confirmCallback.value = async () => {
    try {
      await deleteMainCategoryService(category.categoryId)
      ElMessage.success('主分类删除成功')
      // 刷新列表
      await loadCategoryList()
    } catch (error) {
      console.error('删除主分类失败:', error)
      ElMessage.error('删除主分类失败，请稍后重试')
    } finally {
      confirmDialogVisible.value = false
    }
  }
  
  confirmDialogVisible.value = true
}

// 提交添加主分类
const submitMainCategory = async () => {
  if (!mainCategoryFormRef.value) return
  
  await mainCategoryFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await addMainCategoryService(mainCategoryForm.value.categoryName)
        ElMessage.success('主分类添加成功')
        addMainCategoryDialogVisible.value = false
        // 刷新列表
        await loadCategoryList()
      } catch (error) {
        console.error('添加主分类失败:', error)
        ElMessage.error('添加主分类失败，请稍后重试')
      }
    }
  })
}

// 提交编辑主分类
const submitEditMainCategory = async () => {
  if (!editMainCategoryFormRef.value) return
  
  await editMainCategoryFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await updateMainCategoryService(
          mainCategoryForm.value.categoryId,
          mainCategoryForm.value.categoryName
        )
        ElMessage.success('主分类更新成功')
        editMainCategoryDialogVisible.value = false
        // 刷新列表
        await loadCategoryList()
      } catch (error) {
        console.error('更新主分类失败:', error)
        ElMessage.error('更新主分类失败，请稍后重试')
      }
    }
  })
}

// 显示添加子分类对话框
const showAddSubCategoryDialog = () => {
  // 检查是否有主分类
  if (mainCategoryList.value.length === 0) {
    ElMessage.warning('请先添加主分类')
    return
  }
  
  subCategoryForm.value = { 
    categoryId: null, 
    mainCategoryId: null, 
    categoryName: '' 
  }
  addSubCategoryDialogVisible.value = true
}

// 显示编辑子分类对话框
const showEditSubCategoryDialog = (category) => {
  subCategoryForm.value = { ...category }
  editSubCategoryDialogVisible.value = true
}

// 显示删除子分类确认框
const showDeleteSubCategoryConfirm = (category) => {
  confirmDialogTitle.value = '删除子分类'
  confirmDialogMessage.value = `确定要删除子分类 "${category.categoryName}" 吗？`
  
  confirmCallback.value = async () => {
    try {
      await deleteSubCategoryService(category.categoryId)
      ElMessage.success('子分类删除成功')
      // 刷新列表
      await loadCategoryList()
    } catch (error) {
      console.error('删除子分类失败:', error)
      ElMessage.error('删除子分类失败，请稍后重试')
    } finally {
      confirmDialogVisible.value = false
    }
  }
  
  confirmDialogVisible.value = true
}

// 提交添加子分类
const submitSubCategory = async () => {
  if (!subCategoryFormRef.value) return
  
  await subCategoryFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await addSubCategoryService(
          subCategoryForm.value.mainCategoryId,
          subCategoryForm.value.categoryName
        )
        ElMessage.success('子分类添加成功')
        addSubCategoryDialogVisible.value = false
        // 刷新列表
        await loadCategoryList()
      } catch (error) {
        console.error('添加子分类失败:', error)
        ElMessage.error('添加子分类失败，请稍后重试')
      }
    }
  })
}

// 提交编辑子分类
const submitEditSubCategory = async () => {
  if (!editSubCategoryFormRef.value) return
  
  await editSubCategoryFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await updateSubCategoryService(
          subCategoryForm.value.categoryId,
          subCategoryForm.value.categoryName,
          subCategoryForm.value.mainCategoryId
        )
        ElMessage.success('子分类更新成功')
        editSubCategoryDialogVisible.value = false
        // 刷新列表
        await loadCategoryList()
      } catch (error) {
        console.error('更新子分类失败:', error)
        ElMessage.error('更新子分类失败，请稍后重试')
      }
    }
  })
}

// 确认操作
const handleConfirmAction = () => {
  if (typeof confirmCallback.value === 'function') {
    confirmCallback.value()
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadCategoryList()
})
</script>

<style scoped>
.category-content {
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

.category-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-section {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 16px;
  background-color: #f9f9f9;
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  color: #333;
}

.empty-state {
  margin: 30px 0;
  text-align: center;
}

.empty-text {
  color: #909399;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style> 