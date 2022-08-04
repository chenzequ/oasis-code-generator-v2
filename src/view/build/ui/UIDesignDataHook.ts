import { reactive, watch, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { kill } from 'process'
import { Property } from '@/typings/meta'

export interface VueTableFeatureColumn {
    key: string
    title: string
    desc?: string // 功能描述(当描述为空时，使用title显示)
    params?: Recordable
}

export interface VueTableActionColumnItem {
    icon?: string // 图标
    title?: string // 标题
    confirm?: string // 操作询问
    handle: string // 操作语句
}

type RenderType = 'none' | 'custom' | 'action' | 'text' | 'int' | 'double' | 'boolean' | 'datetime'

export interface VueTableRenderColumn {
    key: string,
    title: string,
    align?: 'left' | 'center' | 'right',
    fixed?: 'none' | 'left' | 'right',
    width?: number, // 空代表不设置,0代表自动,>0则为对应相素值
    type: RenderType
    renderType?: string
    renderParams?: Recordable
    actions?: VueTableActionColumnItem[]
}

export interface VueTableRenderType {
    key: string,
    title: string,
    params?: VueTableRenderTypeParam[]
    buttons?: boolean // 用于按钮生成
}
export interface VueTableRenderTypeParam {
    key: string
    type: 'text' | 'textarea' | 'number' | 'boolean' | 'enum'
    options?: string
    title: string
    default?: any
}

const RENDER_TYPE_NONE = 'none'
const RENDER_TYPE_CUSTOMRENDER = 'customRender'
const RENDER_TYPE_KEY = 'keyRender'
const RENDER_TYPE_FEATURE_ACTION = 'actionRender'
const RENDER_TYPE_LINK = 'linkRender'
const RENDER_TYPE_IMAGE = 'imageRender'
const RENDER_TYPE_DATETIME = 'dataTimeRender'
const RENDER_TYPE_NUMBER = 'numberRender'
const RENDER_TYPE_SELECT = 'selectRender'
const RENDER_TYPE_BOOLEAN = 'booleanRender'

const RENDER_TYPE_MAP = new Map<String, VueTableRenderType>(
    [
        [RENDER_TYPE_NONE, { key: 'none', title: '-' }],
        [RENDER_TYPE_CUSTOMRENDER, {
            key: 'customRender',
            title: '自定义',
            params: [
                {
                    key: 'render',
                    type: 'textarea',
                    title: 'render',
                    default: '({text,record,index}) => {\n\n}',
                },
            ],
        }],
        [RENDER_TYPE_KEY, {
            key: 'keyRender',
            title: '特殊值生成',
            params: [
                {
                    key: 'key',
                    type: 'text',
                    title: 'key',
                    default: '',
                },
            ],
        }],
        [RENDER_TYPE_FEATURE_ACTION, {
            key: 'actionRender', title: '操作模版', buttons: true
        }],
        [RENDER_TYPE_LINK, {
            key: 'linkRender', title: '链接生成', params: [
                { key: 'url', type: 'text', title: '链接', default: '' }
            ]
        }],
        [RENDER_TYPE_IMAGE, {
            key: 'imageRender', title: '图片展示', params: [
                { key: 'width', type: 'number', title: '宽度', default: 80 },
                { key: 'height', type: 'number', title: '高度', default: 60 },
            ]
        }],
        [RENDER_TYPE_DATETIME, {
            key: 'dataTimeRender', title: '时间生成', params: [
                { key: 'format', type: 'text', title: '格式化', default: 'YYYY-MM-DD' },
            ]
        }],
        [RENDER_TYPE_NUMBER, {
            key: 'numberRender', title: '数值生成', params: [
                { key: 'decimal', type: 'number', title: '小数点', default: 0 },
                { key: 'prefix', type: 'text', title: '前缀', default: '' },
                { key: 'suffix', type: 'text', title: '后缀', default: '' },
                { key: 'positiveClass', type: 'text', title: '正数样式', default: '' },
                { key: 'negativeClass', type: 'text', title: '负数样式', default: '' },
            ]
        }],
        [RENDER_TYPE_SELECT, {
            key: 'selectRender', title: '选择生成', params: [
                { key: 'type', type: 'enum', title: '显示类型', options: 'text|tag|badge', default: 'text' },
                { key: 'dataSource', type: 'text', title: '数据源', default: '' },
                { key: 'labelText', type: 'text', title: '标签属性', options: 'name|title', default: '' },
                { key: 'valueText', type: 'text', title: '值属性', options: 'id|key|value', default: '' },
            ]
        }],
        [RENDER_TYPE_BOOLEAN, {
            key: 'booleanRender', title: '布尔生成', params: [
                { key: 'type', type: 'enum', title: '显示类型', options: 'text|tag|badge', default: 'text' },
                { key: 'trueText', type: 'text', title: 'true文本', options: '是|启用|真|对', default: '' },
                { key: 'falseText', type: 'text', title: 'false文本', options: '否|禁用|假|错', default: '' },
            ]
        }],
    ]
)


// 表 列生成
export const useTableDataHook = (data: Property[]) => {
    const vm = reactive<{
        target: VueTableRenderColumn[]
        props: Property[]
        feature: VueTableFeatureColumn[]
        current?: VueTableRenderColumn
        selectIndex: number
    }>({
        target: [], // 生成目录
        props: data, // 属性
        feature: [
            { key: '_index_', title: '序号' },
            { key: '_selection_', title: '选择' },
            {
                key: '_action_', title: '操作', desc: '更新&删除', params: {
                    actions: [
                        { icon: '<EditOutlined/>', title: '更新', handle: '({index}) => doEdit(index)' },
                        { icon: '<DeleteOutlined/>', title: '删除', handle: '({index}) => doRemove(index)', confirm: '确定要删除此数据吗?' },
                    ] as VueTableActionColumnItem[]
                }
            },
            { key: '_action_', title: '操作', params: { actions: [] as VueTableActionColumnItem[] } },
            { key: '_custom_', title: '自定义', params: { align: 'center' } }
        ], // 功能
        current: undefined,
        selectIndex: -1
    })

    // 监听 selectIndex 用于获取当前选中的项
    watch(
        () => vm.selectIndex,
        (i) => {
            if (i >= 0) {
                vm.current = vm.target[i]
            } else {
                vm.current = undefined
            }
        }
    )

    const convertProp = (item: Property): VueTableRenderColumn => {
        let type = 'none' as RenderType
        let width = undefined
        switch (item.type) {
            case 'String':
                type = 'text'
                width = 160
                break
            case 'Int':
            case 'Long':
                type = 'int'
                width = 100
                break
            case 'Float':
                type = 'double'
                width = 100
                break
            case 'Boolean':
                type = 'boolean'
                width = 80
                break
            case 'DateTime':
                type = 'datetime'
                width = 120
                break
            default:
                throw new Error('不支持的类型:' + item.type)
        }
        return {
            key: item.name ?? '',
            title: item.title ?? '',
            type,
            width,
            align: 'center',
            renderParams: {}
        }
    }

    const renderTypesComp = computed(() => {
        if (vm.current) {
            if (vm.current.type === 'text') {
                return [
                    RENDER_TYPE_MAP.get(RENDER_TYPE_NONE),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_KEY),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_CUSTOMRENDER),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_LINK),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_IMAGE),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_SELECT)
                ]
            } else if (vm.current.type === 'int') {
                return [
                    RENDER_TYPE_MAP.get(RENDER_TYPE_NONE),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_KEY),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_CUSTOMRENDER),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_NUMBER),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_SELECT)
                ]
            } else if (vm.current.type === 'double') {
                return [
                    RENDER_TYPE_MAP.get(RENDER_TYPE_NONE),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_KEY),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_CUSTOMRENDER),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_NUMBER)
                ]
            } else if (vm.current.type === 'boolean') {
                return [
                    RENDER_TYPE_MAP.get(RENDER_TYPE_NONE),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_CUSTOMRENDER),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_BOOLEAN)
                ]
            } else if (vm.current.type === 'datetime') {
                return [
                    RENDER_TYPE_MAP.get(RENDER_TYPE_NONE),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_KEY),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_CUSTOMRENDER),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_DATETIME)
                ]
            } else if (vm.current.type === 'custom') {
                return [
                    RENDER_TYPE_MAP.get(RENDER_TYPE_NONE),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_KEY),
                    RENDER_TYPE_MAP.get(RENDER_TYPE_CUSTOMRENDER)
                ]
            }
        }
        return []
    })
    const renderTypeParamsComp = computed(() => {
        if (vm.current && vm.current.renderType) {
            return RENDER_TYPE_MAP.get(vm.current.renderType)?.params
        }
        return undefined
    })

    return {
        vm,
        renderTypesComp,
        renderTypeParamsComp,
        // 功能克隆
        featureClone: (item: VueTableFeatureColumn): VueTableRenderColumn => {
            const index = vm.target.findIndex((o) => o.key === item.key)
            if (index >= 0) {
                message.warn('该功能列已存在:' + index)
            }

            const obj = {
                key: item.key,
                title: item.desc || item.title,
                align: 'center',
            } as VueTableRenderColumn

            let type = 'none' as RenderType

            if (item.key === '_action_') {
                type = 'action'
                obj.actions = []
                if (item.params?.actions) {
                    item.params?.actions.forEach(o => {
                        obj.actions?.push({
                            icon: o.icon,
                            title: o.title,
                            handle: o.handle,
                            confirm: o.confirm
                        })
                    })
                }
            } else if (item.key === '_custom_') {
                type = 'custom'
            }

            obj.type = type

            return obj
        },
        // 属性克隆
        propClone: (item: Property): VueTableRenderColumn => {
            const index = vm.target.findIndex((o) => o.key === item.name)
            if (index >= 0) {
                message.warn('该属性列已存在:' + index)
            }

            return convertProp(item)
        },
        // 复制全部属性
        allPropsClone: () => {
            vm.props.forEach(o => {
                vm.target.push(convertProp(o))
            })
        },
        clearAll: () => {
            Modal.confirm({
                title: '警告',
                content: '确定要清空全部的列吗?',
                onOk: () => { vm.target.splice(0, vm.target.length) }
            })
        },
        // 删除指定生成项
        removeRenderItem: (i: number) => {
            vm.target.splice(i, 1)
            if (i < vm.selectIndex) {
                vm.selectIndex -= 1
            } else if (vm.selectIndex === i) {
                vm.selectIndex = -1
            }
        },
        // 当选择的参数参数改变时
        onRenderTypeChange: () => {
            // 清空参数
            if (vm.current) {
                vm.current.renderParams = {}
                renderTypeParamsComp.value?.forEach(o => {
                    vm.current.renderParams[o.key] = o.default
                })
            }
        }
    }
}
