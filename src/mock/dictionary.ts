import 'mockjs'

const dictTypes = [
  {
    id: 1,
    name: 'User Status',
    code: 'userStatus',
    status: 'active',
    description: 'User account status',
    createTime: '2024-01-01 10:00:00',
  },
  {
    id: 2,
    name: 'Gender',
    code: 'gender',
    status: 'active',
    description: 'User gender',
    createTime: '2024-01-01 10:00:00',
  },
  {
    id: 3,
    name: 'Order Status',
    code: 'orderStatus',
    status: 'active',
    description: 'Order processing status',
    createTime: '2024-01-01 10:00:00',
  },
]

const dictItems = {
  userStatus: [
    { id: 1, label: 'Enabled', value: 'active', sort: 1, status: 'active', tagType: 'success' },
    { id: 2, label: 'Disabled', value: 'inactive', sort: 2, status: 'active', tagType: 'danger' },
  ],
  gender: [
    { id: 3, label: 'Male', value: '1', sort: 1, status: 'active', tagType: '' },
    { id: 4, label: 'Female', value: '2', sort: 2, status: 'active', tagType: 'success' },
    { id: 5, label: 'Unknown', value: '0', sort: 3, status: 'active', tagType: 'info' },
  ],
  orderStatus: [
    { id: 6, label: 'Pending', value: 'pending', sort: 1, status: 'active', tagType: 'warning' },
    { id: 7, label: 'Paid', value: 'paid', sort: 2, status: 'active', tagType: 'success' },
    { id: 8, label: 'Shipped', value: 'shipped', sort: 3, status: 'active', tagType: 'primary' },
    {
      id: 9,
      label: 'Completed',
      value: 'completed',
      sort: 4,
      status: 'active',
      tagType: 'success',
    },
    { id: 10, label: 'Cancelled', value: 'cancelled', sort: 5, status: 'active', tagType: 'info' },
  ],
}

export const dictMocks = [
  // Get Dictionary Types
  {
    url: '/api/dict/type/list',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: {
          list: dictTypes,
          total: dictTypes.length,
        },
      }
    },
  },
  // Get Dictionary Items by Code
  {
    url: RegExp('/api/dict/item/list.*'),
    method: 'get',
    response: (options: any) => {
      // Parse query string manually or assume simpler structure if needed
      // Mockjs options.url contains the full url
      // Simple parsing:
      const typeCodeMatch = options.url.match(/typeCode=([^&]*)/)
      const typeCode = typeCodeMatch ? typeCodeMatch[1] : null

      if (typeCode && dictItems[typeCode as keyof typeof dictItems]) {
        return {
          code: 200,
          message: 'success',
          data: dictItems[typeCode as keyof typeof dictItems],
        }
      }
      return {
        code: 200,
        message: 'success',
        data: [],
      }
    },
  },
]
