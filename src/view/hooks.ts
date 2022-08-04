import { UnwrapRef, ref, computed, unref, watch, nextTick,toRaw } from 'vue'
import { VM } from '@/typings/app'
import { Category, TreeChild, Project, newProject, newProperty, Model } from '@/typings/meta'
import { message, Modal, Form } from 'ant-design-vue'
import { JavaClass } from '@/typings/java'
import { javaClassStructToModel } from '@/utils/java-utils'

export const useProject = (vm: UnwrapRef<VM>) => {
    const visProject = ref(false)
    const visProjectTemplates = ref(false)
    const hasProject = computed(() => vm.project !== undefined)

    // 加载树节点
    const loadTreeNode = (children: Array<TreeChild>, pKey: string): any[] => {
        const data = [] as any[]
        for (const child of children) {
            const key = child.key
            const title = child.name
            const node = child

            if (child.isLeaf) {
                // 模型节点
                data.push({
                    key,
                    title,
                    node,
                    nodes: children,
                    isLeaf: true
                })
            } else {
                // 目录节点
                const category = child as Category
                data.push({
                    key,
                    title,
                    node,
                    nodes: children,
                    isLeaf: false,
                    children: loadTreeNode(category.children, key)
                })
            }
        }
        return data
    }

    const categoryTree = computed<any[] | undefined>(() => {
        if (vm.project?.children) {
            return loadTreeNode(vm.project.children, '')
        } else {
            return undefined
        }
    })
    const initVM = () => {
        vm.project = undefined
        vm.editRecord = undefined
        vm.editExts = undefined
        vm.treeData = undefined
        vm.editIndex = undefined
        vm.currentModel = undefined
        vm.visExt = false
    }
    return {
        visProject,
        visProjectTemplates,
        hasProject,
        categoryTree,
        doNewProject: () => {
            vm.editRecord = undefined
            visProject.value = true
        },
        doImportProject: (file: any) => {
            if (!file.name.endsWith('.json')) {
                message.error('只支持.json文件')
            } else {
                // 读取出文件
                const reader = new FileReader()
                reader.onload = () => {
                    if (reader.result) {
                        var obj = JSON.parse(reader.result.toString())
                        if (obj.name && obj.children) {
                            initVM()
                            vm.project = obj
                        } else {
                            message.error('json文件内容格式无效!')
                        }
                    }
                }
                reader.readAsText(file)
            }
            return false
        },
        handleProjectActions: ({ key }: any) => {
            switch (key) {
                case 'edit':
                    // 编辑项目
                    vm.editRecord = vm.project
                    visProject.value = true
                    break
                case 'ext':
                    // 编辑项目扩展
                    vm.visExt = true
                    vm.editExts = vm.project?.exts
                    break
                case 'template':
                    // 编辑项目模版
                    visProjectTemplates.value = true
                    break
                case 'save':
                    // 导出保存项目
                    let link = document.createElement('a')
                    link.download = vm.project?.name + '.json'
                    link.href = 'data:text/json,' + JSON.stringify(unref(vm.project))
                    link.click()
                    break
                case 'close':
                    // 关闭项目
                    Modal.confirm({
                        title: '确定要关闭[项目]吗?',
                        content: '请确保[项目]废弃或者项目已导出保存,项目一旦关闭不可恢复!',
                        okText: '确认',
                        cancelText: '取消',
                        onOk: () => {
                            initVM()
                        },
                    })
                    break
            }
        },
        onProjectSuccess: (project: Project) => {
            if (!vm.project) {
                vm.project = newProject()
            }
            vm.project.name = project.name
            vm.project.desc = project.desc
            vm.project.title = project.title
            vm.project.author = project.author
            vm.editRecord = undefined
        }
    }
}

export const useModel = (vm: UnwrapRef<VM>) => {
    const visCategory = ref(false)
    const visModel = ref(false)
    const visJavaImport = ref(false)
    const fullClassImport = ref(false)
    const visQuickAddProp = ref(false)
    const visCopyAddProp = ref(false)
    const visUIBuild = ref(false)
    const visCodeBuild = ref(false)

    return {
        visCategory,
        visModel,
        visJavaImport,
        visQuickAddProp,
        visCopyAddProp,
        visUIBuild,
        visCodeBuild,
        doNewCategory: () => {
            vm.treeData = vm.project?.children
            vm.editIndex = undefined
            visCategory.value = true
        },
        doNewModel: () => {
            vm.treeData = vm.project?.children
            vm.editIndex = undefined
            visModel.value = true
        },
        handleNodeMenuClick: (key: string, node: TreeChild, nodes: Array<TreeChild>) => {
            const index = nodes.findIndex(o => o === node)
            switch (key) {
                case 'new':
                    vm.treeData = (node as Category).children
                    vm.editIndex = undefined
                    visModel.value = true
                    break
                case 'edit':
                    vm.treeData = nodes
                    vm.editIndex = index
                    if (node.isLeaf) {
                        visModel.value = true
                    } else {
                        visCategory.value = true
                    }
                    break
                case 'remove':
                    if (node.isLeaf) {
                        Modal.confirm({
                            title: '确定要删除[模型]吗?',
                            content: '模型一旦关闭不可恢复!',
                            okText: '确认',
                            cancelText: '取消',
                            onOk: () => {
                                nodes.splice(index, 1)
                            },
                        })
                    } else {
                        const children = (node as Category).children
                        if (children.length === 0) {
                            nodes.splice(index, 1)
                        } else {
                            Modal.confirm({
                                title: '确定要删除[目录]吗?',
                                content: '该目录下面有多个[模型],请确保这些[模型]可以废弃!',
                                okText: '确认',
                                cancelText: '取消',
                                onOk: () => {
                                    nodes.splice(index, 1)
                                },
                            })
                        }
                    }
                    break
                case 'import':
                    // Java导入新增
                    fullClassImport.value = true
                    visJavaImport.value = true
                    vm.treeData = nodes
                    break
                case 'ext':
                    // 扩展
                    // 编辑项目扩展
                    vm.visExt = true
                    vm.editExts = node.exts
                    break
                default:
                    throw new Error('未实现的操作:' + key)
            }
        },
        handleTreeSelect: (selectedKeys: any, { selectedNodes }: any) => {
            const { node, nodes } = selectedNodes[0]
            if (node.isLeaf) {
                // 模型节点
                vm.currentModel = node
            }
        },
        handleNodeClick: (node: TreeChild) => {
            if (node.isLeaf) {
                vm.currentModel = node as Model
            }
        },
        onJavaImportSuccess: (javaClass: JavaClass) => {
            const modelMeta = javaClassStructToModel(javaClass)
            if (fullClassImport.value) {
                // 导入新增类
                if (vm.treeData) {
                    vm.treeData.push(modelMeta)
                }
            } else {
                // 导入属性
                if (vm.currentModel) {
                    vm.currentModel.properties.push(...modelMeta.properties)
                }
            }
        },
        handleAddProp: () => {
            // 新增属性
            if (vm.currentModel) {
                vm.currentModel.properties.push(newProperty())
            }
        },
        handlePropsClear: () => {
            // 清空全部属性
            Modal.confirm({
                title: '确定要清空属性吗?',
                content: '操作不可恢复!',
                okText: '确认',
                cancelText: '取消',
                onOk: () => {
                    if (vm.currentModel) {
                        vm.currentModel.properties.length = 0
                    }
                },
            })
        },
        handlePropMenuClick: ({ key }: any) => {
            // 处理属性菜单点击
            switch (key) {
                case 'copy':
                    visCopyAddProp.value = true
                    break
                case 'quick':
                    visQuickAddProp.value = true
                    break
                case 'import':
                    fullClassImport.value = false
                    visJavaImport.value = true
                    break
                default:
                    throw new Error('unkonwn key:' + key)
            }
        },
        handleUIBuild: () => {
            // 处理 ui界面生成
            visUIBuild.value = true
        },
        handleCodeBuild: () => {
            // 处理代码生成
            visCodeBuild.value = true
        },
        handlePropsCopy: (props: Property[]) => {
            props.forEach(prop => prop.key = new Date().valueOf().toString())
            vm.currentModel?.properties.push(...props)
        }
    }
}

export const modalHooks = (
    props: any,
    emit: any,
    newModel: () => any,
    rules: any,
    saveBefore?: (model: any) => boolean
) => {

    const modelRef = ref(newModel())
    const rulesRef = ref(rules)
    const isAdd = computed(() => !props.record)
    const { resetFields, validate, validateInfos } = Form.useForm(
        modelRef,
        rulesRef
    )

    const visComp = computed<boolean>({
        get() {
            return props.visible
        },
        set(v) {
            emit('update:visible', v)
        }
    })

    watch(
        () => props.visible,
        (v) => {
            resetFields()
            if (v) {
                if (isAdd.value) {
                    modelRef.value = newModel()
                } else {
                    nextTick(() => {
                        modelRef.value = Object.assign({}, toRaw(props.record))
                    })
                }
            }
        }
    )

    return {
        modelRef,
        rulesRef,
        isAdd,
        visComp,
        validateInfos,
        handleOk: () => {
            validate().then(() => {
                if (saveBefore && !saveBefore(modelRef.value)) {
                    // 保存前验证
                    return
                }

                emit('success', modelRef.value)
                visComp.value = false
            })
        }
    }
}