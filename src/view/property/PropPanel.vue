<template>
    <div class="properties-panel">
        <table class="properties-table">
            <thead>
                <th class="table-drag-cell">
                    <DragOutlined />
                </th>
                <th style="width: 140px">属性</th>
                <th style="width: 120px">标题</th>
                <th style="width: 80px">类型</th>
                <th style="width: 40px">必填</th>
                <th style="width: 40px">主键</th>
                <th style="width: 80px">最小值</th>
                <th style="width: 80px">最大值</th>
                <th style="width: 100px">默认值</th>
                <th style="width: auto">备注</th>
                <th style="width: 80px">操作</th>
            </thead>
            <draggable v-model="data" tag="tbody" item-key="ts" handle=".drag-handle">
                <template #item="{ index }">
                    <tr>
                        <!-- 拖动 -->
                        <td>
                            <div class="drag-handle">
                                <DragOutlined />
                            </div>
                        </td>
                        <!-- 属性 -->
                        <td>
                            <Input v-model:value="data[index].name" allowClear />
                        </td>

                        <!-- 标题 -->
                        <td>
                            <Input v-model:value="data[index].title" allowClear />
                        </td>
                        <!-- 类型 -->
                        <td>
                            <Select style="width: 100%" v-model:value="data[index].type">
                                <SelectOption v-for="(item, i) in PropertyTypeOptions" :key="i" :value="item">
                                    {{ item }}
                                </SelectOption>
                            </Select>
                        </td>
                        <!-- 是否必填 -->
                        <td>
                            <Checkbox v-model:checked="data[index].require" />
                        </td>
                        <!-- 主键 -->
                        <td>
                            <Checkbox v-model:checked="data[index].pk" />
                        </td>
                        <!-- 最小值 -->
                        <td>
                            <InputNumber v-model:value="data[index].min" allowClear />
                        </td>
                        <!-- 最大值 -->
                        <td>
                            <InputNumber v-model:value="data[index].max" allowClear />
                        </td>
                        <!-- 默认值 -->
                        <td>
                            <Input v-model:value="data[index].default" allowClear />
                        </td>
                        <!-- 备注 -->
                        <td>
                            <Textarea v-model:value="data[index].desc" :rows="1" allowClear />
                        </td>
                        <!-- 操作 -->
                        <td>
                            <Space>
                                <Popover placement="bottomRight">
                                    <template #content>
                                        <table>
                                            <tr v-for="(o, i) in data[index].exts" :key="i">
                                                <td style="width: 120px" class="py-1">
                                                    <Input v-model:value="o.key" placeholder="key" />
                                                </td>
                                                <td style="width: 240px" class="py-1">
                                                    <Input v-model:value="o.value" placeholder="value" />
                                                </td>
                                                <td class="py-1">
                                                    <Button danger @click="doRemoveExt(data[index], i)">
                                                        <template #icon>
                                                            <DeleteOutlined />
                                                        </template>
                                                    </Button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan="3">
                                                    <Button type="dashed" size="small" @click="doNewExt(data[index])">
                                                        <template #icon>
                                                            <PlusOutlined />
                                                        </template>
                                                    </Button>
                                                </td>
                                            </tr>
                                        </table>
                                    </template>
                                    <Button size="small">
                                        <template #icon>
                                            <TagsOutlined />
                                        </template>
                                    </Button>
                                </Popover>
                                <Popconfirm title="确定要删除吗?" placement="topRight" @confirm="() => data.splice(index, 1)">
                                    <Button danger size="small">
                                        <template #icon>
                                            <DeleteOutlined />
                                        </template>
                                    </Button>
                                </Popconfirm>
                            </Space>
                        </td>
                    </tr>
                </template>
            </draggable>
        </table>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Input, Button, Popconfirm, Space, Popover, InputNumber, Textarea, Checkbox, Select, SelectOption } from 'ant-design-vue'
import { DragOutlined, DeleteOutlined, TagsOutlined, PlusOutlined } from '@ant-design/icons-vue'
import draggable from 'vuedraggable'
import { Property, newProperty, PropertyTypeOptions } from '@/typings/meta'

const props = defineProps<{
    modelValue: Property[]
}>()
const emit = defineEmits<{
    (e: 'update:modelValue', val: Property[]): void
}>()

const data = computed<Property[]>({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
})

const getNewModel = (obj?: {}): Property => {
    const prop = newProperty()
    return {
        ...prop,
        ...obj,
    }
}

const doNewExt = (prop: Property) => {
    prop.exts.push({ key: '', value: '' })
}

const doRemoveExt = (prop: Property, index: number) => {
    prop.exts?.splice(index, 1)
}
</script>