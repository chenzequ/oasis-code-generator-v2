<template>
  <Modal title="代码生成" width="100%" wrap-class-name="full-modal" centered :maskClosable="false"
    v-model:visible="visComp">
    <template #footer>
      <Space>
        <Button type="primary" class="copy-btn" @click="doRender">生成并复制</Button>
      </Space>
    </template>
    <div class="flex">
      <div class="flex-1">
        <VueCodemirror v-model="tplRef" />
      </div>
      <div class="flex-1">
        <VueCodemirror v-model="codeRef" readonly />
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import ejs from 'ejs'
import ClipboardJS from 'clipboard'
import VueCodemirror from '@/components/vue-codemirror/VueCodemirror.vue'
import { message, Modal, Space, Button } from 'ant-design-vue'

const props = defineProps<{
  visible: boolean
  tpl: string
  data: any[]
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

const tplRef = ref('')
const codeRef = ref('')

const doRender = () => {
  nextTick(() => {
    codeRef.value = ejs.compile(tplRef.value)({
      data: props.data,
    })
    const clipboard = new ClipboardJS('.copy-btn', {
      text: () => {
        return codeRef.value
      },
    })
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

watch(
  () => props.visible,
  (vis) => {
    if (vis) {
      nextTick(() => {
        tplRef.value = props.tpl
        codeRef.value = ''
      })
    }
  }
)

</script>