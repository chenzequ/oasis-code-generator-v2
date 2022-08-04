<template>
    <Modal v-if="props.visible" title="扩展" :width="640" style="top: 20px" :maskClosable="false" v-model:visible="visComp" :footer="null">
        <table class="sim-table">
            <thead>
                <th style="width:160px">key</th>
                <th>value</th>
                <th style="width:40px">删除</th>
            </thead>
            <tbody>
                <tr v-for="(item, i) in props.exts" :key="i">
                    <td><Input v-model:value="item.key" /></td>
                    <td><Input v-model:value="item.value" /></td>
                    <td>
                        <Button size="small" danger @click="props.exts?.splice(i, 1)">
                            <template #icon>
                                <DeleteOutlined />
                            </template>
                        </Button>
                    </td>
                </tr>
                <tr>
                    <td colspan="3">
                        <Button type="dashed" style="width:200px"
                            @click="() => props.exts?.push({ key: '', value: '' })">
                            <template #icon>
                                <PlusOutlined />
                            </template>
                            添加
                        </Button>
                    </td>
                </tr>
            </tbody>
        </table>
    </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Modal, Button, Input } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { ExtItem } from '@/typings/meta'

const props = defineProps<{
    visible: boolean
    exts?: Array<ExtItem>
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
</script>