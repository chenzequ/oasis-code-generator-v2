<template>
    <div class="form-item-element flex flex-row items-center bg-gray-50 m-1 h-14 border-2 border-transparent rounded-md"
        @click="emit('activeItem', props.item)" :class="{ 'element-active': props.active }">
        <div class="items-center flex p-1">
            <span v-if="props.item.require" style="color:red">*</span>
        </div>
        <div class="form-item-element-control flex-1">
            <Input v-if="props.item.control === 'input'" disabled :placeholder="props.item.params.placeholder" />
            <Input v-else-if="props.item.control === 'template'" disabled />
            <InputNumber style="width: 100%" v-else-if="props.item.control === 'number'" disabled
                :placeholder="props.item.params.placeholder" />
            <Select style="width: 100%" disabled v-else-if="props.item.control === 'select'"
                :placeholder="props.item.params.placeholder" />
            <Textarea v-else-if="props.item.control === 'textarea'" disabled
                :placeholder="props.item.params.placeholder" />
            <Checkbox v-else-if="props.item.control === 'checkbox'" disabled>
                {{ props.item.params.text }}
            </Checkbox>
            <Switch v-else-if="props.item.control === 'switch'" disabled />
            <DatePicker style="width: 100%" v-else-if="props.item.control === 'datetime'" disabled
                :placeholder="props.item.params.placeholder" />
            <Button v-else-if="props.item.control === 'upload'" disabled>
                <UploadOutlined />
                图片上传
            </Button>
        </div>
        <a-button danger @click.stop="emit('removeItem')" type="text" shape="circle">
            <template #icon>
                <DeleteOutlined />
            </template>
        </a-button>
    </div>
</template>

<script setup lang="ts">
import { Button, Input, Switch, Checkbox, Select, DatePicker, Textarea, InputNumber } from 'ant-design-vue'
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { FormItem } from './FormDataHook'

const props = defineProps<{
    item: any
    active: boolean
}>()

const emit = defineEmits<{
    (e: 'activeItem', val: FormItem): void
    (e: 'removeItem'): void
}>()
</script>

<style lang="less">
.element-active {
    border-color: #1890ff;
}
</style>