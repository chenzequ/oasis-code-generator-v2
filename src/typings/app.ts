import { ExtItem, Model, Project, TreeChild } from './meta'

export interface VM {
    project?: Project // 当前项目
    editRecord: any // 当前编辑记录
    editExts?: Array<ExtItem> // 当前编辑的扩展
    treeData?: Array<TreeChild> // 当前目录树
    editIndex?: number // 当前编辑索引
    currentModel?: Model // 当前模型
    visExt: boolean // 是否显示扩展编辑
}