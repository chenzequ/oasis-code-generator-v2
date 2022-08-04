<template>
  <div class="design-panel">
    <div class="design-panel-left">
      <Tabs tab-position="left" :style="{ minHeight: '300px' }">
        <TabPane key="property" tab="属性">
          <draggable :list="vm.props" :group="{ name: 'table', pull: 'clone', put: false }" :clone="propClone"
            item-key="name">
            <template #item="{ element }">
              <div class="select-list-group-item">
                <div>{{ element.title }}</div>
                <div>{{ element.name }}</div>
              </div>
            </template>
          </draggable>
          <Divider />
          <Space style="width: 100%" direction="vertical">
            <Button style="width: 100%" @click="allPropsClone" type="primary">添加全部</Button>
            <Button style="width: 100%" :disabled="vm.target.length === 0" @click="clearAll" danger>清空</Button>
          </Space>
        </TabPane>
        <TabPane key="feature" tab="功能">
          <draggable :list="vm.feature" :group="{ name: 'table', pull: 'clone', put: false }" :clone="featureClone"
            item-key="name">
            <template #item="{ element }">
              <div class="select-list-group-item">
                {{ element.desc || element.title }}
              </div>
            </template>
          </draggable>
        </TabPane>
      </Tabs>
    </div>
    <div class="design-panel-content flex flex-col">
      <div class="p-1">
        <Button type="primary" :disabled="vm.target.length === 0" @click="renderCodeRef = true">代码生成..</Button>
      </div>
      <div class="target-content flex-1">
        <draggable :list="vm.target" group="table" item-key="name">
          <template #item="{ index }">
            <div class="list-group-item" :class="{ active: vm.selectIndex === index }">
              <!-- <Checkbox class="pl-2"/> -->
              <div class="list-group-item-title flex flex-row" @click="vm.selectIndex = index">
                <div class="flex flex-col">
                  <div>{{ vm.target[index].key }}</div>
                  <div>{{ vm.target[index].title }}</div>
                </div>
                <div class="flex-1">
                  {{
                      JSON.stringify({
                        type: vm.target[index].type,
                        width: vm.target[index].width,
                        align: vm.target[index].align,
                        fixed: vm.target[index].fixed,
                        renderType: vm.target[index].renderType,
                        renderParams: vm.target[index].renderParams,
                        actions: vm.target[index].actions,
                      })
                  }}
                </div>
              </div>
              <Button danger @click="removeRenderItem(index)" type="text" shape="circle">
                <template #icon>
                  <DeleteOutlined />
                </template>
              </Button>
            </div>
          </template>
        </draggable>
      </div>
      <!-- <div>
              <Textarea v-model:value="tableCode" disabled></Textarea>
            </div> -->
    </div>
    <div class="design-panel-right">
      <div v-if="vm.current">
        <Descriptions size="small" bordered :column="1" title="基础属性">
          <DescriptionsItem label="key">
            <Input v-model:value="vm.current.key" :disabled="vm.current.type !== 'custom'" />
          </DescriptionsItem>
          <DescriptionsItem label="标题">
            <Input v-model:value="vm.current.title" />
          </DescriptionsItem>
          <DescriptionsItem label="宽度">
            <Space>
              <InputNumber v-model:value="vm.current.width" min="0" />
            </Space>
          </DescriptionsItem>
          <DescriptionsItem label="固定">
            <Select style="width: 100%" v-model:value="vm.current.fixed">
              <SelectOption value="none">无</SelectOption>
              <SelectOption value="left">左</SelectOption>
              <SelectOption value="right">右</SelectOption>
            </Select>
          </DescriptionsItem>
          <DescriptionsItem label="对齐">
            <Select style="width: 100%" v-model:value="vm.current.align">
              <SelectOption value="left">左对齐</SelectOption>
              <SelectOption value="center">居中对齐</SelectOption>
              <SelectOption value="right">右对齐</SelectOption>
            </Select>
          </DescriptionsItem>
          <DescriptionsItem label="类型" v-if="renderTypesComp && renderTypesComp.length > 0">
            <Select style="width: 100%" v-model:value="vm.current.renderType" @change="onRenderTypeChange">
              <SelectOption v-for="o in renderTypesComp" :key="o.key" :value="o.key">{{ o.title }}</SelectOption>
            </Select>
          </DescriptionsItem>
        </Descriptions>
        <Descriptions size="small" bordered :column="1" title="附加属性" v-if="renderTypeParamsComp">
          <DescriptionsItem v-for="(o, i) in renderTypeParamsComp" :key="i" :label="o.title">
            <Input v-if="o.type === 'text'" allowClear v-model:value="vm.current.renderParams[o.key]" />
            <InputNumber v-else-if="o.type === 'number'" allowClear v-model:value="vm.current.renderParams[o.key]" />
            <Textarea v-else-if="o.type === 'textarea'" :rows="8" allowClear
              v-model:value="vm.current.renderParams[o.key]" />
            <Checkbox v-else-if="o.type === 'boolean'" v-model:checked="vm.current.renderParams[o.key]" />
            <Select style="width: 100%" v-else-if="o.type === 'enum'" allowClear
              v-model:value="vm.current.renderParams[o.key]">
              <SelectOption v-for="opt in o.options.split('|')" :key="opt" :value="opt">
                {{ opt }}
              </SelectOption>
            </Select>
          </DescriptionsItem>
        </Descriptions>
        <Descriptions size="small" bordered :column="1" title="操作按钮" v-if="vm.current.type === 'action'">
          <template #extra>
            <Button @click="
              vm.current?.actions?.push({
                key: '',
                confirm: '',
                handle: '',
              })
            ">
              添加按钮
            </Button>
          </template>
          <DescriptionsItem v-for="(action, i) in vm.current.actions" :key="i">
            <template #label>
              <Button @click="
                () => {
                  vm.current.actions?.splice(i, 1)
                }
              " danger type="text" shape="circle">
                <template #icon>
                  <DeleteOutlined />
                </template>
              </Button>
            </template>
            <Row>
              <Col :span="14">
              <Input placeholder="图标" v-model:value="action.icon" allowClear />
              </Col>
              <Col :span="10">
              <Input placeholder="标题" v-model:value="action.title" allowClear />
              </Col>
            </Row>
            <Input placeholder="confirm" v-model:value="action.confirm" allowClear />
            <Textarea placeholder="handle" allowClear v-model:value="action.handle"></Textarea>
          </DescriptionsItem>
        </Descriptions>
      </div>
      <Empty v-else />
    </div>
    <RenderCodeModal v-model:visible="renderCodeRef" :tpl="table_tpl" :data="vm.target" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { DeleteOutlined } from '@ant-design/icons-vue'
import { message, Divider, InputNumber, Select, SelectOption, Button, Empty, DescriptionsItem, Descriptions, Input, Textarea, Row, Col } from 'ant-design-vue'
import { useTableDataHook } from './UIDesignDataHook'
import RenderCodeModal from './RenderCodeModal.vue'
import { Property } from '@/typings/meta'

const renderCodeRef = ref(false)

const props = defineProps<{
  data: Property[]
}>()

const {
  vm,
  removeRenderItem,
  allPropsClone,
  featureClone,
  propClone,
  clearAll,
  onRenderTypeChange,
  renderTypesComp,
  renderTypeParamsComp,
} = useTableDataHook(props.data)

const table_tpl = `<%
    const widthBy=(col)=>{
        if(col.width!==undefined&&col.width!==null){
            return col.width===0? " width:'auto'":' width:'+col.width
        }
    }
    const alignBy=(col)=>col.align?" align:'"+col.align+"'":''
    const fixedBy=(col)=>col.fixed && col.fixed!=='none'?" fixed:'"+col.fixed+"'":''
    const dataSourceBy=(dataSourceText)=> dataSourceText && !dataSourceText.startsWith('(')? "'"+dataSourceText+"'":dataSourceText
    const renderBy=(col)=>{
        switch(col.renderType){
            case 'customRender':
                return ' customRender: '+col.renderParams.render
            case 'keyRender':
                return ' customRender: '+col.renderParams.key
            case 'linkRender':
                return " customRender: (data)=> cR.createLink(data, { url: '"+ col.renderParams.url +"' })"
            case 'imageRender':
                return " customRender: (data)=> cR.createImage(data, { width: "+col.renderParams.width+" , height: "+col.renderParams.height+"})"
            case 'dateTimeRender':
                return " customRender: (data)=> cR.createDateTime(data, { format: '"+ col.renderParams.format +"'})"
            case 'numberRender':
                return " customRender: (data)=> cR.createNumber(data, { decimal: "+col.renderParams.decimal+" , prefix: '"+ col.renderParams.prefix +"',suffix: '"+ col.renderParams.suffix +"',positiveClass: '"+ col.renderParams.positiveClass +"',negativeClass: '"+ col.renderParams.negativeClass +"'})"
            case 'selectRender':
                return " customRender: (data)=> cR.createSelect(data, { type: '"+ col.renderParams.type + "',dataSource: "+ dataSourceBy(col.renderParams.dataSource)+ ",labelText: '"+ col.renderParams.labelText + "',valueText: '"+ col.renderParams.valueText +"'})"
            case 'booleanRender':
                return " customRender: (data)=> cR.createBoolean(data, { type: '"+ col.renderParams.type +"',trueText: '"+ col.renderParams.trueText +"',falseText: '"+ col.renderParams.falseText +"'})"
        }
     
        if(col.actions && col.actions.length>0){
            let actions='['
            col.actions.forEach(action=>{
                actions+='{'
                if(action.icon){
                    actions+=' icon = '+ action.icon +','
                }
                if(action.title){
                    actions+=" title = '"+ action.title +"',"
                }
                if(action.confirm){
                    actions+=" confirm = '"+ action.confirm +"',"
                }
                actions+=' handle='+action.handle
                actions+='},'
            })
            actions+=']'
            return ' customRender: (data)=> cR.createActions(data, {actions: '+actions+'})'
        }
    }
%>const columns=[<% for(var i=0;i<data.length;i++) { 
   var col= data[i] %>
   { dataIndex:'<%=col.key%>' title:'<%=col.title%>'<%-widthBy(col)%><%-alignBy(col)%><%-fixedBy(col)%><%-renderBy(col)%>},<%}%>
]
`
</script>

<style lang="less">
</style>