<template>
    <Modal v-if="props.visible" title="快速添加属性" :width="800" style="top: 20px" :maskClosable="false" v-model:visible="visComp" :footer="null"
        class="quick-add-modal">
        <div class="quick-add-panel">
            <Card size="small" v-for="(group, i) in QuickAddPropsOptions" :key="i" :title="group.type">
                <Button v-for="(item, j) in group.items" :key="j"
                    @click="() => emit('propsAdd', [Object.assign({}, item)])">
                    {{ item.key }} - {{ item.title }}
                </Button>
            </Card>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Modal, Card, Button } from 'ant-design-vue'
import { Model, Property } from '@/typings/meta'
import { QuickAddPropsOptions } from '@/values/options'

const props = defineProps<{
    visible: boolean
    current?: Model
}>()

const emit = defineEmits<{
    (e: 'update:visible', val: boolean): void
    (e: 'propsAdd', val: Property[]): void
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