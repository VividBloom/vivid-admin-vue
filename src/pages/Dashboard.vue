<!--
  仪表盘页面 Dashboard
  - 展示关键指标、图表与实时交易表格
  - 支持通过 tagsView 的刷新标记进行局部刷新（不会整页重载）
  - 使用 echarts 渲染图表，提供 lifecycle 钩子进行初始化与销毁
-->
<template>
  <div ref="scrollContainerRef" class="dashboard-container">
    <!-- 页面标题和快捷操作 -->
    <div :key="componentKey" class="dashboard-header">
      <h1>仪表盘</h1>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新数据
        </el-button>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateChange"
        />
      </div>
    </div>

    <!-- 关键指标卡片 -->
    <div class="metrics-grid">
      <el-card class="metric-card" shadow="hover">
        <div class="metric-content">
          <div class="metric-info">
            <div class="metric-value">{{ dashboardData?.totalUsers }}</div>
            <div class="metric-label">总用户数</div>
          </div>
          <div class="metric-icon">
            <el-icon color="#409EFF">
              <User />
            </el-icon>
          </div>
        </div>
        <div class="metric-trend">
          <span class="trend-up">↑ 12% 较上月</span>
        </div>
      </el-card>

      <el-card class="metric-card" shadow="hover">
        <div class="metric-content">
          <div class="metric-info">
            <div class="metric-value">{{ dashboardData?.totalOrders }}</div>
            <div class="metric-label">总订单数</div>
          </div>
          <div class="metric-icon">
            <el-icon color="#67C23A">
              <ShoppingCart />
            </el-icon>
          </div>
        </div>
        <div class="metric-trend">
          <span class="trend-up">↑ 8% 较上月</span>
        </div>
      </el-card>

      <el-card class="metric-card" shadow="hover">
        <div class="metric-content">
          <div class="metric-info">
            <div class="metric-value">¥{{ dashboardData?.totalRevenue }}</div>
            <div class="metric-label">总收入</div>
          </div>
          <div class="metric-icon">
            <el-icon color="#E6A23C">
              <Money />
            </el-icon>
          </div>
        </div>
        <div class="metric-trend">
          <span class="trend-up">↑ 15% 较上月</span>
        </div>
      </el-card>

      <el-card class="metric-card" shadow="hover">
        <div class="metric-content">
          <div class="metric-info">
            <div class="metric-value">{{ dashboardData?.avgConversion }}%</div>
            <div class="metric-label">转化率</div>
          </div>
          <div class="metric-icon">
            <el-icon color="#F56C6C">
              <TrendCharts />
            </el-icon>
          </div>
        </div>
        <div class="metric-trend">
          <span class="trend-down">↓ 2% 较上月</span>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 访问量折线图 -->
      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="chart-header">
            <span>访问量趋势</span>
            <el-radio-group v-model="visitChartType" size="small">
              <el-radio-button label="week" value="week">本周</el-radio-button>
              <el-radio-button label="month" value="month">本月</el-radio-button>
              <el-radio-button label="quarter" value="quarter">本季</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="visitChart" class="chart-container"></div>
      </el-card>

      <!-- 用户分布环图 -->
      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="chart-header">
            <span>用户分布</span>
          </div>
        </template>
        <div ref="userChart" class="chart-container"></div>
      </el-card>

      <!-- 实时交易表格 -->
      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="chart-header">
            <span>实时交易</span>
            <el-button type="primary" link @click="loadRealTimeData">
              <el-icon>
                <Refresh />
              </el-icon>
            </el-button>
          </div>
        </template>
        <el-table v-loading="tableLoading" :data="realtimeTransactions" height="300">
          <el-table-column prop="id" label="订单号" width="120" />
          <el-table-column prop="user" label="用户" width="100" />
          <el-table-column prop="amount" label="金额" width="100">
            <template #default="scope"> ¥{{ scope.row.amount }} </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="time" label="时间" />
        </el-table>
      </el-card>

      <!-- 性能指标仪表盘 -->
      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="chart-header">
            <span>系统性能</span>
          </div>
        </template>
        <div ref="gaugeChart" class="chart-container"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

import { systemApi } from '@/api'
import { useComponentRefresh } from '@/composables/useComponentRefresh'
import { useTagsViewsStore } from '@/stores/tagsView'

defineOptions({
  name: 'Dashboard',
})

// 类型定义
interface Transaction {
  id: string
  user: string
  amount: number
  status: 'success' | 'pending' | 'failed'
  time: string
}

const route = useRoute()

// 使用组件刷新 Hook：提供给父组件通过 expose 调用的本地刷新逻辑
const { refreshComponent } = useComponentRefresh()
const tagsViewStore = useTagsViewsStore()

// 计算组件 key：包含 tagsView 的刷新标记，标记变化时可触发局部重新加载
const componentKey = computed(() => {
  const refreshFlag = tagsViewStore.getRefreshFlag(route.fullPath)
  return `dashboard-${refreshFlag}`
})

watch(
  () => tagsViewStore.getRefreshFlag(route.fullPath),
  (newFlag, oldFlag) => {
    if (newFlag > oldFlag) {
      // 当刷新标记增加时，重新加载数据（实现局部刷新而不是整页重载）
      loadDashboardData()
    }
  }
)

const loading = ref(false)
// 数据状态
const dashboardData = ref<API.DashboardData>()

// 获取数据
const fetchData = async () => {
  try {
    loading.value = true
    const response = await systemApi.getDashboard()
    dashboardData.value = response.data
    ElMessage.success('数据获取成功')
  } catch (error) {
    ElMessage.error('数据获取失败')
  } finally {
    loading.value = false
  }
}

const realtimeTransactions = ref<Transaction[]>([])
const dateRange = ref<[Date, Date]>([new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()])
const visitChartType = ref('week')
const tableLoading = ref(false)

// Chart 实例引用
const visitChart = ref<HTMLElement>()
const userChart = ref<HTMLElement>()
const gaugeChart = ref<HTMLElement>()

let visitChartInstance: echarts.ECharts | null = null
let userChartInstance: echarts.ECharts | null = null
let gaugeChartInstance: echarts.ECharts | null = null

// 方法
const refreshData = async () => {
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    dashboardData.value = {
      totalUsers: 12480,
      totalOrders: 8924,
      totalRevenue: 256890,
      avgConversion: 68.5,
    }

    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  }
}

const loadRealTimeData = async () => {
  tableLoading.value = true
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 800))

    realtimeTransactions.value = [
      { id: 'ORD001', user: '用户A', amount: 299, status: 'success', time: '2025-01-17 10:30:00' },
      { id: 'ORD002', user: '用户B', amount: 159, status: 'pending', time: '2025-01-17 10:25:00' },
      { id: 'ORD003', user: '用户C', amount: 899, status: 'success', time: '2025-01-17 10:20:00' },
      { id: 'ORD004', user: '用户D', amount: 199, status: 'failed', time: '2025-01-17 10:15:00' },
      { id: 'ORD005', user: '用户E', amount: 599, status: 'success', time: '2025-01-17 10:10:00' },
    ]
  } catch (error) {
    ElMessage.error('加载实时数据失败')
  } finally {
    tableLoading.value = false
  }
}

const getStatusType = (status: string): any => {
  const map: { [key: string]: string } = {
    success: 'success',
    pending: 'warning',
    failed: 'danger',
  }
  return map[status] || 'info'
}

const handleDateChange = () => {
  refreshData()
}

// 图表初始化
const initCharts = () => {
  // 访问量折线图
  if (visitChart.value) {
    visitChartInstance = echarts.init(visitChart.value)
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: 'line',
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' },
            ]),
          },
        },
      ],
    }
    visitChartInstance.setOption(option)
  }

  // 用户分布环图
  if (userChart.value) {
    userChartInstance = echarts.init(userChart.value)
    const option = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
      },
      series: [
        {
          name: '用户分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold',
            },
          },
          data: [
            { value: 1048, name: '移动端' },
            { value: 735, name: 'PC端' },
            { value: 580, name: '平板端' },
            { value: 300, name: '其他' },
          ],
        },
      ],
    }
    userChartInstance.setOption(option)
  }

  // 性能指标仪表盘[7](@ref)
  if (gaugeChart.value) {
    gaugeChartInstance = echarts.init(gaugeChart.value)
    const option = {
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          splitNumber: 10,
          axisLine: {
            lineStyle: {
              width: 10,
              color: [
                [0.3, '#67C23A'],
                [0.7, '#E6A23C'],
                [1, '#F56C6C'],
              ],
            },
          },
          pointer: {
            width: 5,
          },
          detail: {
            fontSize: 20,
            offsetCenter: [0, '-25%'],
            formatter: '{value}%',
          },
          data: [{ value: 75, name: '性能指标' }],
        },
      ],
    }
    gaugeChartInstance.setOption(option)
  }
}

// 响应式调整图表大小
const handleResize = () => {
  visitChartInstance?.resize()
  userChartInstance?.resize()
  gaugeChartInstance?.resize()
}

// 加载数据函数
const loadDashboardData = async () => {
  loading.value = true
  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 500))

    // 这里实际应该是 API 调用
    // const response = await fetchDashboardData()
    // dashboardData.value = response.data
    await fetchData()
    await refreshData()
    await loadRealTimeData()

    // console.log('仪表板数据加载完成')
  } catch (error) {
    console.error('加载仪表板数据失败:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

// 暴露刷新方法给父组件
defineExpose({
  reload: () => {
    // 父组件可调用此方法触发仪表盘内部的刷新逻辑
    return refreshComponent()
  },
})

// 生命周期
onMounted(async () => {
  loadDashboardData()

  await nextTick()
  initCharts()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  visitChartInstance?.dispose()
  userChartInstance?.dispose()
  gaugeChartInstance?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 0;
  // background: #f5f5f5;
  min-height: calc(100vh - 84px);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    margin: 0;
    // color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.metric-card {
  :deep(.el-card__body) {
    padding: 20px;
  }
}

.metric-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metric-info {
  .metric-value {
    font-size: 32px;
    font-weight: 600;
    // color: #303133;
    line-height: 1;
    margin-bottom: 8px;
  }

  .metric-label {
    font-size: 14px;
    color: #909399;
  }
}

.metric-icon {
  font-size: 48px;
  opacity: 0.8;
}

.metric-trend {
  font-size: 12px;

  .trend-up {
    color: #67c23a;
  }

  .trend-down {
    color: #f56c6c;
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  :deep(.el-card__header) {
    padding: 16px 20px 0;
    border-bottom: none;
  }

  :deep(.el-card__body) {
    padding: 0 20px 20px;
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px 20px;
}

hart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    font-size: 16px;
    font-weight: 600;
    // color: #303133;
  }
}

.chart-container {
  height: 300px;
  width: 100%;
}
</style>
