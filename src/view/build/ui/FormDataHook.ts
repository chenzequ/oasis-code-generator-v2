import { reactive, computed } from 'vue'
import { FormItem, message } from 'ant-design-vue'
import { Property } from '@/typings/meta'

export type FormItemType = 'text' | 'int' | 'double' | 'boolean' | 'datetime' | 'template'

export interface FormItem {
    key: string
    title: string
    require: boolean
    colspan: number
    type: FormItemType
    control: string
    params?: Recordable
}

export interface VueFormItem {
    key: string
    type: 'text' | 'number' | 'textarea' | 'checkbox' | 'enum'
    title: string
    options?: string
    default?: any
}

export interface FormItemControl {
    name: string,
    params: VueFormItem[]
}

const CONTROL_INPUT = 'input'
const CONTROL_NUMBER = 'number'
const CONTROL_SELECT = 'select'
const CONTROL_TEXTAREA = 'textarea'
const CONTROL_CHECKBOX = 'checkbox'
const CONTROL_SWITCH = 'switch'
const CONTROL_DATETIME = 'datetime'
const CONTROL_UPLOAD = 'upload'
const CONTROL_TEMPLATE = 'template'

const FORM_ITEM_CONTROL_MAP = new Map<String, FormItemControl>(
    [
        [CONTROL_INPUT, {
            name: CONTROL_INPUT,
            params: [
                { key: 'placeholder', type: 'text', title: 'placeholder', default: '' },
                { key: 'maxLength', type: 'number', title: '最大长度', default: '' },
            ]
        }],
        [CONTROL_NUMBER, {
            name: CONTROL_NUMBER,
            params: [
                { key: 'placeholder', type: 'text', title: 'placeholder', default: '' },
                { key: 'min', type: 'number', title: '最小值' },
                { key: 'max', type: 'number', title: '最大值' },
            ]
        }
        ],
        [CONTROL_SELECT, {
            name: CONTROL_SELECT,
            params: [
                { key: 'placeholder', type: 'text', title: 'placeholder', default: '' },
                { key: 'datasource', type: 'text', title: '数据源' },
                { key: 'keyText', type: 'text', title: 'key' },
                { key: 'valueText', type: 'text', title: 'value' },
            ]
        }
        ],
        [CONTROL_TEXTAREA, {
            name: CONTROL_TEXTAREA,
            params: [
                { key: 'placeholder', type: 'text', title: 'placeholder', default: '' },
                { key: 'maxLength', type: 'number', title: '最大长度', default: '' },
            ]
        }
        ],
        [CONTROL_CHECKBOX, {
            name: CONTROL_CHECKBOX,
            params: [
                { key: 'text', type: 'text', title: '文本' }
            ]
        }
        ],
        [CONTROL_SWITCH, {
            name: CONTROL_SWITCH,
            params: [
                { key: 'text', type: 'text', title: '文本' }
            ]
        }
        ],
        [CONTROL_DATETIME, {
            name: CONTROL_DATETIME,
            params: [
                { key: 'placeholder', type: 'text', title: 'placeholder', default: '' },
                { key: 'format', type: 'text', title: '格式化', default: '' }
            ]
        }
        ],
        [CONTROL_UPLOAD, {
            name: CONTROL_UPLOAD,
            params: [
                { key: 'ext', type: 'text', title: '支持扩展名', default: '' },
                { key: 'size', type: 'number', title: '最大上传' },
            ]
        }
        ],
        [CONTROL_TEMPLATE, {
            name: CONTROL_TEMPLATE,
            params: [
                { key: 'content', type: 'textarea', title: '内容', default: '' },
            ]
        }
        ],
    ]
)


const LAYOUT_MAX_ITEM = 4 // 容器最大支持的控件
export const useFormDataHook = (data: Array<Property>) => {
    const vm = reactive<{
        props: Property[],
        elements: any[],
        target: FormItem[],
        current?: FormItem
    }>({
        props: data,
        elements: [
            { name: '_grid', title: '容器', type: 'grid' },
            { name: '_template', title: '模版' }
        ],
        target: [],
        current: undefined  // 当前选中的项
    })

    const propClone = (item: Property): FormItem => {
        let type = '' as FormItemType
        let control = ''
        let params = {}
        switch (item.type) {
            case 'String':
                type = 'text'
                control = CONTROL_INPUT
                break
            case 'Int':
            case 'Long':
                type = 'int'
                control = CONTROL_NUMBER
                break
            case 'Float':
                type = 'double'
                control = CONTROL_NUMBER
                break
            case 'Boolean':
                type = 'boolean'
                control = CONTROL_CHECKBOX
                break
            case 'DateTime':
                type = 'datetime'
                control = CONTROL_DATETIME
                break
            default:
                throw new Error('不支持的类型:' + item.type)
        }

        return {
            title: item.title ?? '',
            key: item.name,
            require: item.require ?? true,
            colspan: 1,
            control,
            type,
            params
        }
    }

    const supportTypesComp = computed(() => {
        if (vm.current) {
            if (vm.current.type === 'text') {
                return [
                    FORM_ITEM_CONTROL_MAP.get(CONTROL_INPUT),
                    FORM_ITEM_CONTROL_MAP.get(CONTROL_TEXTAREA),
                    FORM_ITEM_CONTROL_MAP.get(CONTROL_SELECT),
                    FORM_ITEM_CONTROL_MAP.get(CONTROL_UPLOAD),
                ]
            } else if (vm.current.type === 'boolean') {
                return [
                    FORM_ITEM_CONTROL_MAP.get(CONTROL_CHECKBOX),
                    FORM_ITEM_CONTROL_MAP.get(CONTROL_SWITCH),
                    FORM_ITEM_CONTROL_MAP.get(CONTROL_SELECT),
                ]
            } else if (vm.current.type === 'int') {
                return [
                    FORM_ITEM_CONTROL_MAP.get(CONTROL_NUMBER),
                    FORM_ITEM_CONTROL_MAP.get(CONTROL_SELECT),
                ]
            } else if (vm.current.type === 'double') {
                return [
                    FORM_ITEM_CONTROL_MAP.get(CONTROL_NUMBER),
                ]
            } else if (vm.current.type === 'datetime') {
                return [
                    FORM_ITEM_CONTROL_MAP.get(CONTROL_DATETIME),
                ]
            } else if (vm.current.type === 'template') {
                return [
                    FORM_ITEM_CONTROL_MAP.get(CONTROL_TEMPLATE)
                    // FORM_ITEM_CONTROL_MAP.get(CONTROL_INPUT),
                    // FORM_ITEM_CONTROL_MAP.get(CONTROL_NUMBER),
                    // FORM_ITEM_CONTROL_MAP.get(CONTROL_TEXTAREA),
                    // FORM_ITEM_CONTROL_MAP.get(CONTROL_SELECT),
                    // FORM_ITEM_CONTROL_MAP.get(CONTROL_UPLOAD),
                    // FORM_ITEM_CONTROL_MAP.get(CONTROL_DATETIME),
                    // FORM_ITEM_CONTROL_MAP.get(CONTROL_CHECKBOX),
                    // FORM_ITEM_CONTROL_MAP.get(CONTROL_SWITCH)
                ]
            }
        }
        return []
    })
    const typeParamsComp = computed(() => {
        if (vm.current && vm.current.control) {
            return FORM_ITEM_CONTROL_MAP.get(vm.current.control)?.params
        }
        return undefined
    })

    return {
        vm,
        supportTypesComp,
        typeParamsComp,
        propsClone: (item: Property) => {
            // 根据类型 生成值
            return propClone(item)
        },
        propsAllClone: () => {
            vm.props.forEach(o => {
                vm.target.push(propClone(o))
            })
        },
        elementClone: (item: any) => {
            // 元素
            if (item.type === 'grid') {
                return { ...item, colspan: 1, children: [] }
            } else {
                if (item.name === '_template') {
                    return { ...item, colspan: 1, type: 'template', control: CONTROL_TEMPLATE, params: { content: '' } }
                }

                return { ...item, colspan: 1 }
            }
        },
        elementChange: (item, parent) => {
            if (item.added) {
                if (item.added.element.type === 'grid') {
                    message.warn('当前容器不支持嵌套容器')
                    parent.children.splice(item.added.newIndex, 1)
                    return
                }
                if (parent.children.length > LAYOUT_MAX_ITEM) {
                    message.warn(`容器最多支持${LAYOUT_MAX_ITEM}个子元素`)
                    parent.children.splice(item.added.newIndex, 1)
                    return
                }
            }
        },
        clearAll: () => {
            vm.target.splice(0, vm.target.length)
            vm.current = undefined
        },
        selectItem: (item: FormItem) => {
            if (vm.current === item) {
                vm.current = undefined
            } else {
                vm.current = item
            }
        },
        removeRenderItem: (items: FormItem[], i: number) => {
            const item = items[i]
            items.splice(i, 1)
            if (item === vm.current) {
                vm.current = undefined
            } else if (item.type === 'grid') {
                if (item.children.findIndex(o => o === vm.current) >= 0) {
                    vm.current = undefined
                }
            }
        },
        // 当选择的参数参数改变时
        onTypeChange: () => {
            // 清空参数
            if (vm.current) {
                vm.current.params = {}
                supportTypesComp.value?.forEach(o => {
                    vm.current.params[o.key] = o.default
                })
            }
        }
    }
}