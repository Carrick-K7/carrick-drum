/**
 * 待办事项数据类型
 */
export interface Todo {
  /** 唯一标识 */
  id: string
  /** 标题 */
  title: string
  /** 描述 */
  description: string
  /** 状态 */
  status: 'active' | 'completed'
  /** 创建时间 ISO 格式 */
  createdAt: string
}

/**
 * 待办筛选类型
 */
export type TodoFilter = 'all' | 'active' | 'completed'
