<template>
    <Modal v-if="props.visible" title="分类" :width="480" style="top: 20px" :maskClosable="false" v-model:visible="visComp" @ok="handleOk">
        <Form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
            <FormItem label="名称" v-bind="validateInfos.name">
                <Input v-model:value="modelRef.name" />
            </FormItem>
            <FormItem label="简称">
                <Input v-model:value="modelRef.short" />
            </FormItem>
        </Form>
    </Modal>
</template>

<script setup lang="ts">
import { Modal, Form, FormItem, Input } from 'ant-design-vue'
import { TreeChild, newCategory } from '@/typings/meta'
import { modalHooks } from '@/view/hooks'

const props = defineProps<{
    visible: boolean
    children?: TreeChild[]
    index?: number
}>()

const emit = defineEmits<{
    (e: 'update:visible', val: boolean): void
}>()
const { visComp, isAdd, validateInfos, modelRef, handleOk } = modalHooks(
    props,
    emit,
    newCategory,
    {
        name: [{ required: true, message: '名称必填' }],
    }
)
</script>