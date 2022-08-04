<template>
    <Modal v-if="props.visible" title="代码生成" width="100%" id="code-generator-modal" wrap-class-name="full-modal" :maskClosable="false"
        centered v-model:visible="visComp" :footer="null">
        <template #footer>
            <Space>
                <Button type="primary" @click="doRenderAll">全部生成</Button>
            </Space>
        </template>
        <Alert v-if="warnInfo" :message="warnInfo" type="warning" show-icon />
        <tabs type="card">
            <TabPane v-for="(o, i) in props.project?.templates" :key="i" :tab="o.name">
                <!-- <Space>
                    <div class="flex flex-wrap">
                        <template v-for="(set, j) in getSettingsBy(o)" :key="j">
                            <Space v-if="set.type === 'enum'">
                                <span>{{ set.title }}</span>
                                <Select style="width:160px" v-model:value="props.model.setting[set.key]">
                                    <SelectOption v-for="(item, k) in set.values.split('|')" :key="k" :value="item">
                                        {{ item }}
                                    </SelectOption>
                                </Select>
                            </Space>
                            <Checkbox v-else v-model:checked="props.model?.setting[set.key]">{{ set.title }}</Checkbox>
                        </template>
                    </div>
                    <Button type="primary" @click="doRender(i)" class="copy-btn">生成</Button>
                    <Button @click="doEditTpl(i)">修改模版..</Button>
                    <Button @click="doCopy(i)" class="copy-btn">复制代码</Button>
                </Space> -->
                <VueCodemirror :id="'codemirror_' + i" v-model="codeRef[i]" readonly />
            </TabPane>
        </tabs>
    </Modal>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import ejs from 'ejs'
import ClipboardJS from 'clipboard'
import { Modal, Space, Button, Tabs, TabPane, Checkbox, Select, SelectOption, Alert, message } from 'ant-design-vue'
import { Project, Category, Model, ExtItem, EJSTemplate, EJSTemplateSetting } from '@/typings/meta'
import VueCodemirror from '@/components/vue-codemirror/VueCodemirror.vue'

const props = defineProps<{
    visible: boolean
    project?: Project
    model?: Model
}>()
const emit = defineEmits<{
    (e: 'update:visible', val: boolean): void
}>()
const visComp = computed<boolean>({
    get() {
        return props.visible
    },
    set(v) {
        emit('update:visible', v)
    },
})
const warnInfo = ref<string>('')
const codeRef = ref<string[]>([])

// 获取当前模型的上级目录或没有
const getCategory = (): Category | undefined => {
    // 由于当前只有一级目录 ，所以不需要使用递归
    if (props.project && props.project.children) {
        for (let child of props.project.children) {
            if (child.isLeaf) {
                if (child === props.model) {
                    return undefined
                }
            } else {
                const category = child as Category
                if (category.children && category.children.length > 0) {
                    for (let model of category.children) {
                        if (model === props.model) {
                            return category
                        }
                    }
                }
            }
        }
    }
    return undefined
}
// 获取模版设置
const getSettingsBy = (tpl: EJSTemplate): EJSTemplateSetting[] => {
    const items = [] as EJSTemplateSetting[]
    // tpl.setting.split('|').forEach((o) => {
    //     props.project?.settings.forEach((set) => {
    //         if (set.key.startsWith(o + '.')) {
    //             items.push(set)
    //         }
    //     })
    // })
    return items
}

const renderCodeBy = (i: number): boolean => {
    const tpl = props.project?.templates[i]
    const category = getCategory()
    if (tpl) {
        try {
            codeRef.value[i] = ejs.compile(tpl.template)({
                // 所在项目
                project: props.project,
                // 所在目录
                category: category,
                // 对应模型
                model: props.model,
                // 生成附加工具
                utils: {
                    // 获取指定的扩展值
                    extBy: (exts: ExtItem[], key: string): string => {
                        if (exts) {
                            for (const ext of exts) {
                                if (ext.key === key) {
                                    return ext.value
                                }
                            }
                        }
                        return `[无效key:${key}]`
                    },
                    // 从模型->目录->项目 找寻扩展项
                    extByAll: (key: string): string => {
                        // 类扩展中查找
                        if (props.model?.exts) {
                            for (const ext of props.model?.exts) {
                                if (ext.key === key) {
                                    return ext.value
                                }
                            }
                        }
                        // 目录扩展中查找
                        if (category && category.exts) {
                            for (const ext of category.exts) {
                                if (ext.key === key) {
                                    return ext.value
                                }
                            }
                        }
                        // 项目扩展中查找
                        if (props.project?.exts) {
                            for (const ext of props.project?.exts) {
                                if (ext.key === key) {
                                    return ext.value
                                }
                            }
                        }
                        return ''
                    },
                    // 获取数据库字段类型
                    dbFieldTypeBy: (prop: Property, dbType: string): string =>
                        getDatabaseFieldTypeBy(prop, dbType),
                    // 获取类型对应的Java类型
                    javaTypeBy: (prop: Property): string => getJavaTypeBy(prop),
                    // 获取主键集合
                    pks: () => props.model?.properties.filter((o) => o.pk),
                    // 获取第一主键
                    firstPK: () => props.model?.properties.filter((o) => o.pk)?.[0],
                    // 将大写字母全部小写，使用指定的连接符串连
                    lowerCaseString: (str: string, join?: string): string => {
                        let result = ''
                        join = join ?? '_'
                        if (str) {
                            for (let i = 0; i < str.length; i++) {
                                var c = str[i]
                                if (i !== 0 && c >= 'A' && c <= 'Z') {
                                    result += join + c
                                } else {
                                    result += c
                                }
                            }
                        }
                        return result.toLowerCase()
                    },
                    firstLowerCaseString: (str: string): string => {
                        return str && str.length > 0
                            ? str[0].toLowerCase() + str.substring(1)
                            : str
                    },
                },
            })
            return true
        } catch (e) {
            console.error(e)
            message.error('代码生成失败!')
            return false
        }
    } else {
        return false
    }
}
// 复制代码
const doCopy = (i: number) => {
    if (codeRef.value[i]) {
        nextTick(() => {
            const clipboard = new ClipboardJS('.copy-btn', {
                text: () => {
                    return codeRef.value[i]
                },
            })
            console.log(clipboard)
            clipboard.on('success', (e) => {
                console.log('复制成功:')
                message.success('代码已复制', 1)
                // 释放内存
                clipboard.destroy()
            })
            clipboard.on('error', (e) => {
                console.log('复制失败:', e)
                // 不支持复制
                message.error('代码复制失败', 1)
                // 释放内存
                clipboard.destroy()
            })
        })
    }
}
// 生成
const doRender = (i: number) => {
    const result = renderCodeBy(i)
    if (result) {
        // 生成完成，复制到剪切板
        doCopy(i)
    }
}
// 全部生成
const doRenderAll = () => {
    // 全部生成。。。。
    for (let i = 0; i < codeRef.value.length; i++) {
        // 一个一个生成代码
    }
}
// 编辑指定模版
const editTplIndexRef = ref(-1)
const visTpl = ref(false)
const doEditTpl = (i: number) => {
    editTplIndexRef.value = i
    visTpl.value = true
}
const doEditTplSuccess = (tpl: EJSTemplate) => {
    if (props.project) {
        props.project.templates[editTplIndexRef.value].template = tpl.template
        renderCodeBy(editTplIndexRef.value)
    }
}
</script>