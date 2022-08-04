<template>
    <Modal v-if="props.visible" title="代码选择" width="100%" wrap-class-name="full-modal" :maskClosable="false" centered
        v-model:visible="visComp">
        <template #footer>
            <div class="flex justify-between">
                <Space>
                    <Upload :multiple="false" :show-upload-list="false" :before-upload="beforeSuperUpload">
                        <Button :disabled="isEmptyComp">选择父Java文件..</Button>
                    </Upload>
                    <Button :disabled="isEmptyComp" @click="valueRef = ''">清空</Button>
                    <Button :disabled="isEmptyComp" @click="doDebug">debug</Button>
                </Space>
                <Space>
                    <Upload :multiple="false" :show-upload-list="false" :before-upload="beforeUpload">
                        <Button>选择Java文件..</Button>
                    </Upload>
                    <Button type="primary" :disabled="isEmptyComp" @click="handleOk">
                        代码生成
                    </Button>
                </Space>
            </div>
        </template>
        <VueCodemirror v-model="valueRef" />
    </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Modal, Space, Upload, Button, message } from 'ant-design-vue'
import VueCodemirror from '@/components/vue-codemirror/VueCodemirror.vue'
import { JavaClass } from '@/typings/java'
import { resolverJava } from '@/utils/java-utils.js'

const valueRef = ref('')
const props = defineProps<{
    visible: boolean
}>()

const emit = defineEmits<{
    (e: 'update:visible', val: boolean): void
    (e: 'success', val: JavaClass): void
}>()
const visComp = computed<boolean>({
    get() {
        return props.visible
    },
    set(v) {
        emit('update:visible', v)
    },
})

watch(
    () => props.visible,
    (v) => {
        valueRef.value = ''
    }
)

const isEmptyComp = computed<boolean>(() => {
    return valueRef.value.trim().length === 0
})

const handleOk = () => {
    let text = valueRef.value.trim()
    if (text.length === 0) {
        message.error('代码不能为空')
    } else {
        try {
            emit('success', resolverJava(text))
            visComp.value = false
        } catch (e) {
            throw e
        }
    }
}

const doDebug = () => {
    let text = valueRef.value.trim()
    if (text.length === 0) {
        message.error('代码不能为空')
    } else {
        console.log(resolverJava(text))
    }
}

// 代码文件上传处理
const beforeUpload = (file: any) => {
    if (!file.name.endsWith('.java')) {
        message.error('只支持.java文件')
    } else {
        // 读取出文件
        const reader = new FileReader()
        reader.onload = () => {
            if (reader.result) {
                valueRef.value = reader.result.toString()
            }
        }
        reader.readAsText(file)
    }
    return false
}

const beforeSuperUpload = (file: any) => {
    if (!file.name.endsWith('.java')) {
        message.error('只支持.java文件')
    } else {
        // 读取出文件
        const reader = new FileReader()
        reader.onload = () => {
            if (reader.result) {
                // 将类中间的全部内容插入到现有的内容中
                const content = reader.result.toString().trim()
                const addLines = []
                const lines = content.split('\n')
                let add = false
                // 拼装 类内部内容
                for (let i = 0; i < lines.length; i++) {
                    if (i != lines.length - 1) {
                        if (add) {
                            addLines.push(lines[i])
                        } else {
                            if (lines[i].startsWith('public class ')) {
                                add = true
                            }
                        }
                    }
                }
                // 插入内容到当前类文本中
                const valueLines = valueRef.value.split('\n')
                const index = valueLines.findIndex((o) => o.startsWith('public class '))
                if (index !== -1) {
                    // 将内容插入到指定行
                    valueLines.splice(index + 1, 0, ...addLines)
                } else {
                    valueLines.push(...addLines)
                }
                valueRef.value = valueLines.join('\n')
            }
        }
        reader.readAsText(file)
    }
    return false
}
</script>