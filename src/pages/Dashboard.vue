<!--
  仪表盘页面 Dashboard
  - 展示关键指标、图表与实时交易表格
  - 支持通过 tagsView 的刷新标记进行局部刷新（不会整页重载）
  - 使用 echarts 渲染图表，提供 lifecycle 钩子进行初始化与销毁
-->
<template>
  <div ref="scrollContainerRef" class="min-h-[calc(100vh-84px)] p-0">
    <!-- 页面标题和快捷操作 -->
    <div :key="componentKey" class="mb-5 flex items-center justify-between">
      <h1 class="m-0 text-2xl font-semibold">{{ $t('dashboard.title') }}</h1>
      <div class="flex items-center gap-3">
        <el-button type="primary" @click="refreshData">
          <el-icon>
            <div class="i-ep-refresh" />
          </el-icon>
          {{ $t('dashboard.refreshData') }}
        </el-button>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="-"
          :start-placeholder="$t('dashboard.startDate')"
          :end-placeholder="$t('dashboard.endDate')"
          @change="handleDateChange"
        />
      </div>
    </div>

    <!-- 关键指标卡片 -->
    <el-row :gutter="16" class="mb-5">
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6" class="mb-4 lg:mb-0">
        <el-card shadow="hover" :body-style="{ padding: '20px' }">
          <div class="mb-3 flex items-center justify-between">
            <div>
              <div class="mb-2 text-3xl font-semibold leading-none">
                {{ dashboardData?.totalUsers }}
              </div>
              <div class="text-sm text-gray-400">{{ $t('dashboard.totalUsers') }}</div>
            </div>
            <div class="opacity-80">
              <el-icon color="#409EFF" :size="48">
                <div class="i-ep-user" />
              </el-icon>
            </div>
          </div>
          <div class="text-xs">
            <span class="text-green-500">↑ 12% {{ $t('dashboard.compareLastMonth') }}</span>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6" class="mb-4 lg:mb-0">
        <el-card shadow="hover" :body-style="{ padding: '20px' }">
          <div class="mb-3 flex items-center justify-between">
            <div>
              <div class="mb-2 text-3xl font-semibold leading-none">
                {{ dashboardData?.totalOrders }}
              </div>
              <div class="text-sm text-gray-400">{{ $t('dashboard.totalOrders') }}</div>
            </div>
            <div class="opacity-80">
              <el-icon color="#67C23A" :size="48">
                <div class="i-ep-shopping-cart" />
              </el-icon>
            </div>
          </div>
          <div class="text-xs">
            <span class="text-green-500">↑ 8% {{ $t('dashboard.compareLastMonth') }}</span>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6" class="mb-4 sm:mb-0">
        <el-card shadow="hover" :body-style="{ padding: '20px' }">
          <div class="mb-3 flex items-center justify-between">
            <div>
              <div class="mb-2 text-3xl font-semibold leading-none">
                ¥{{ dashboardData?.totalRevenue }}
              </div>
              <div class="text-sm text-gray-400">{{ $t('dashboard.totalRevenue') }}</div>
            </div>
            <div class="opacity-80">
              <el-icon color="#E6A23C" :size="48">
                <div class="i-ep-money" />
              </el-icon>
            </div>
          </div>
          <div class="text-xs">
            <span class="text-green-500">↑ 15% {{ $t('dashboard.compareLastMonth') }}</span>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-card shadow="hover" :body-style="{ padding: '20px' }">
          <div class="mb-3 flex items-center justify-between">
            <div>
              <div class="mb-2 text-3xl font-semibold leading-none">
                {{ dashboardData?.avgConversion }}%
              </div>
              <div class="text-sm text-gray-400">{{ $t('dashboard.conversionRate') }}</div>
            </div>
            <div class="opacity-80">
              <el-icon color="#F56C6C" :size="48">
                <div class="i-ep-trend-charts" />
              </el-icon>
            </div>
          </div>
          <div class="text-xs">
            <span class="text-red-400">↓ 2% {{ $t('dashboard.compareLastMonth') }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16">
      <!-- 左侧列 -->
      <el-col :xs="24" :lg="12">
        <!-- 访问量折线图 -->
        <el-card class="mb-4" shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-base font-semibold">{{ $t('dashboard.visitsTrend') }}</span>
              <el-radio-group v-model="visitChartType" size="small">
                <el-radio-button label="week" value="week">{{
                  $t('dashboard.week')
                }}</el-radio-button>
                <el-radio-button label="month" value="month">{{
                  $t('dashboard.month')
                }}</el-radio-button>
                <el-radio-button label="quarter" value="quarter">{{
                  $t('dashboard.quarter')
                }}</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="visitChart" class="h-[300px] w-full"></div>
        </el-card>

        <!-- 实时交易表格 -->
        <el-card class="mb-4 lg:mb-0" shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-base font-semibold">{{
                $t('dashboard.realTimeTransactions')
              }}</span>
              <el-button type="primary" link @click="loadRealTimeData">
                <el-icon>
                  <div class="i-ep-refresh" />
                </el-icon>
              </el-button>
            </div>
          </template>
          <el-table v-loading="tableLoading" :data="realtimeTransactions" height="300">
            <el-table-column prop="id" :label="$t('dashboard.orderNo')" width="120" />
            <el-table-column prop="user" :label="$t('dashboard.user')" width="100" />
            <el-table-column prop="amount" :label="$t('dashboard.amount')" width="100">
              <template #default="scope"> ¥{{ scope.row.amount }} </template>
            </el-table-column>
            <el-table-column prop="status" :label="$t('dashboard.status')" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" :label="$t('dashboard.time')" />
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧列 -->
      <el-col :xs="24" :lg="12">
        <!-- 用户分布环图 -->
        <el-card class="mb-4" shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-base font-semibold">{{ $t('dashboard.userDistribution') }}</span>
            </div>
          </template>
          <div ref="userChart" class="h-[300px] w-full"></div>
        </el-card>

        <!-- 性能指标仪表盘 -->
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-base font-semibold">{{ $t('dashboard.systemPerformance') }}</span>
            </div>
          </template>
          <div ref="gaugeChart" class="h-[300px] w-full"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

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
const { t } = useI18n()

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
    ElMessage.success(t('dashboard.dataFetchSuccess'))
  } catch (error) {
    ElMessage.error(t('dashboard.dataFetchFailed'))
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

    ElMessage.success(t('dashboard.dataRefreshSuccess'))
  } catch (error) {
    ElMessage.error(t('dashboard.dataRefreshFailed'))
  }
}

const loadRealTimeData = async () => {
  tableLoading.value = true
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 800))

    realtimeTransactions.value = [
      {
        id: 'ORD001',
        user: `${t('dashboard.user')} A`,
        amount: 299,
        status: 'success',
        time: '2025-01-17 10:30:00',
      },
      {
        id: 'ORD002',
        user: `${t('dashboard.user')} B`,
        amount: 159,
        status: 'pending',
        time: '2025-01-17 10:25:00',
      },
      {
        id: 'ORD003',
        user: `${t('dashboard.user')} C`,
        amount: 899,
        status: 'success',
        time: '2025-01-17 10:20:00',
      },
      {
        id: 'ORD004',
        user: `${t('dashboard.user')} D`,
        amount: 199,
        status: 'failed',
        time: '2025-01-17 10:15:00',
      },
      {
        id: 'ORD005',
        user: `${t('dashboard.user')} E`,
        amount: 599,
        status: 'success',
        time: '2025-01-17 10:10:00',
      },
      {
        id: 'ORD002',
        user: `${t('dashboard.user')} B`,
        amount: 159,
        status: 'pending',
        time: '2025-01-17 10:25:00',
      },
      {
        id: 'ORD003',
        user: `${t('dashboard.user')} C`,
        amount: 899,
        status: 'success',
        time: '2025-01-17 10:20:00',
      },
      {
        id: 'ORD004',
        user: `${t('dashboard.user')} D`,
        amount: 199,
        status: 'failed',
        time: '2025-01-17 10:15:00',
      },
      {
        id: 'ORD005',
        user: `${t('dashboard.user')} E`,
        amount: 599,
        status: 'success',
        time: '2025-01-17 10:10:00',
      },
    ]
  } catch (error) {
    ElMessage.error(t('dashboard.realTimeDataLoadError'))
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

const getStatusText = (status: string): string => {
  const map: { [key: string]: string } = {
    success: 'dashboard.statusSuccess',
    pending: 'dashboard.statusPending',
    failed: 'dashboard.statusFailed',
  }
  return t(map[status] || 'dashboard.status')
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
        data: [
          t('dashboard.jan'),
          t('dashboard.feb'),
          t('dashboard.mar'),
          t('dashboard.apr'),
          t('dashboard.may'),
          t('dashboard.jun'),
          t('dashboard.jul'),
        ],
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
          name: t('dashboard.userDistribution'),
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
            { value: 1048, name: t('dashboard.mobile') },
            { value: 735, name: t('dashboard.pc') },
            { value: 580, name: t('dashboard.tablet') },
            { value: 300, name: t('dashboard.other') },
          ],
        },
      ],
    }
    userChartInstance.setOption(option)
  }

  // 性能指标仪表盘
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
          data: [{ value: 75, name: t('dashboard.performanceIndex') }],
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
    ElMessage.error(t('dashboard.dataLoadError'))
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
