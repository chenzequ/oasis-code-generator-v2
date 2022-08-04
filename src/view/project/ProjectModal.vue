<template>
    <Modal v-if="props.visible" title="项目" :width="360" style="top: 20px" :maskClosable="false" v-model:visible="visComp" @ok="handleOk">
        <Form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
            <FormItem label="名称" v-bind="validateInfos.name">
                <Input :readonly="!isAdd" v-model:value="modelRef.name" />
            </FormItem>
            <FormItem label="标题">
                <Input v-model:value="modelRef.title" />
            </FormItem>
            <FormItem label="开发者">
                <Input v-model:value="modelRef.author" />
            </FormItem>
            <FormItem label="描述">
                <Input v-model:value="modelRef.desc" @keyup.enter="handleOk" />
            </FormItem>
        </Form>
    </Modal>
</template>

<script setup lang="ts">
import { Form, FormItem, Input, Modal } from 'ant-design-vue'
import { modalHooks } from '@/view/hooks'
import { newProject } from '@/typings/meta'

const props = defineProps<{
    visible: boolean
    record: any
}>()

const emit = defineEmits<{
    (e: 'update:visible', val: boolean): void
    (e: 'success', val: ProjectMeta): void
}>()


const { visComp, isAdd, validateInfos, modelRef, handleOk } = modalHooks(
    props,
    emit,
    newProject,
    {
        name: [{ required: true, message: '项目名称必填' }],
    }
)
</script>