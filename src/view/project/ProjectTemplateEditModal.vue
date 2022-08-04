<template>
  <Modal v-if="props.visible" title="编辑模板" width="100%" wrap-class-name="full-modal" :maskClosable="false" centered
    v-model:visible="visComp">
    <template #footer>
      <Space>
        <Button type="primary" @click="handleOk">保存</Button>
      </Space>
    </template>
    <Form :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
      <FormItem label="名称" v-bind="validateInfos.name">
        <Input v-model:value="modelRef.name" :readonly="props.onlyCode" />
      </FormItem>
      <FormItem label="配置" v-if="!props.onlyCode">
        <table class="sim-table">
          <thead>
            <th class="table-drag-cell">
              <DragOutlined />
            </th>
            <th>key</th>
            <th>标题</th>
            <th>类型</th>
            <th>默认值</th>
            <th>可选值(|)</th>
            <th>删除 </th>
          </thead>
          <draggable v-model="modelRef.setting" tag="tbody" item-key="id" handle=".drag-handle">
            <template #item="{ index }">
              <tr>
                <td>
                  <div class="drag-handle">
                    <DragOutlined />
                  </div>
                </td>
                <td>
                  <Input v-model:value="modelRef.setting[index].key" />
                </td>
                <td>
                  <Input v-model:value="modelRef.setting[index].title" />
                </td>
                <td>
                  <Select v-model:value="modelRef.setting[index].type" @select="() => {
                    if (modelRef.setting[index].type === 'boolean') {
                      modelRef.setting[index].default = true
                      modelRef.setting[index].enumValues = ''
                    } else {
                      modelRef.setting[index].default = ''
                      modelRef.setting[index].enumValues = ''
                    }
                  }">
                    <SelectOption value="boolean">bool</SelectOption>
                    <SelectOption value="enum">Enum</SelectOption>
                  </Select>
                </td>
                <td>
                  <Checkbox v-if="modelRef.setting[index].type === 'boolean'"
                    v-model:checked="modelRef.setting[index].default" />
                  <Input v-else-if="modelRef.setting[index].type === 'enum'"
                    v-model:value="modelRef.setting[index].default" />
                </td>
                <td>
                  <Input v-if="modelRef.setting[index].type === 'enum'"
                    v-model:value="modelRef.setting[index].enumValues" />
                </td>
                <td>
                  <Popconfirm title="确定要删除吗?" placement="topRight" @confirm="() => modelRef.setting.splice(index, 1)">
                    <Button danger size="small">
                      <template #icon>
                        <DeleteOutlined />
                      </template>
                    </Button>
                  </Popconfirm>
                </td>
              </tr>
            </template>
          </draggable>
          <tfoot>
            <tr>
              <td colspan="7" style="text-align:left">
                <Button type="dashed" style="width:120px;"
                  @click="modelRef.setting.push(newEJSTemplateSetting())">新增</Button>
              </td>
            </tr>
          </tfoot>
        </table>
      </FormItem>
      <FormItem label="模版">
        <Upload :multiple="false" :show-upload-list="false" :before-upload="beforeUpload">
          <Button>从文件中导入模版..</Button>
        </Upload>
        <VueCodemirror v-model="modelRef.template" />
      </FormItem>
    </Form>
  </Modal>
</template>

<script setup lang="ts">
import { Modal, Popconfirm, Form, FormItem, Checkbox, Select, SelectOption, Upload, Button, Input, Space } from 'ant-design-vue'
import VueCodemirror from '@/components/vue-codemirror/VueCodemirror.vue'
import { EJSTemplate, newEJSTemplate, newEJSTemplateSetting } from '@/typings/meta'
import { modalHooks } from '@/view/hooks'
import { DragOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import draggable from 'vuedraggable'

const props = defineProps<{
  visible: boolean
  onlyCode?: boolean
  record: any
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success', val: EJSTemplate): void
}>()

const { visComp, isAdd, validateInfos, modelRef, handleOk } = modalHooks(
  props,
  emit,
  newEJSTemplate,
  {
    name: [{ required: true, message: '模版名称必填' }],
  }
)

// 代码文件上传处理
const beforeUpload = (file: any) => {
  // 读取出文件
  const reader = new FileReader()
  reader.onload = () => {
    if (reader.result) {
      modelRef.value.template = reader.result.toString()
    }
  }
  reader.readAsText(file)
  return false
}
</script>
