# as-select

- 移动端下拉选择器
- 支持前端分页渲染
- 支持单选/多选模式
- 支持搜索

自 1.1.0 版本起，移除 localData 属性，替换为 options 属性

注意：本组件依赖npm模块loadsh，暂不清楚如何配置自动安装，请手动执行以下命令解决
```shell
npm install --save loadsh
```
bug反馈，请加群：61688259

# 示例

```js
<template>
	<view class="content">

		<uni-forms :modelValue="formData">
			<uni-forms-item label="类型" name="typeId">
				<as-select v-model="formData.typeId" title="类型选择" placeholder="请选择类型" :options="typeOptions" labelKey="label" valueKey="value"/>
			</uni-forms-item>
		</uni-forms>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				formData: {
					typeId: ''
				},
				typeOptions: [{
					label: '类型一',
					value: '1'
				},{
					label: '类型二',
					value: '2'
				},{
					label: '类型三',
					value: '3'
				}]
			}
		},
		methods: {

		}
	}
</script>

<style>
	.content{
		padding: 20rpx;
	}
</style>
```

#API

## Props

|        属性名        |                     说明                      |        类型         | 默认值 |
| :------------------: | :-------------------------------------------: | :-----------------: | :----: |
|    ~~localData~~     |           本地渲染数据，1.1.0 移除            |        array        |   -    |
|       options        |           本地渲染数据，1.1.0 新增            |        array        |   -    |
|        value         |             已选择数据的 value 值             | string/number/array |   -    |
|         name         |           select input 的 name 属性           |       string        |   -    |
|       disabled       |                   是否禁用                    |       boolean       | false  |
|       multiple       |                   是否多选                    |       boolean       | false  |
|    multipleLimit     | 多选时用户最多可以选择的项目数，为 0 则不限制 |       number        |   0    |
|      listHeight      |               弹窗选择器的高度                |       string        | 258px  |
|     placeholder      |                    占位符                     |       string        |   -    |
|       valueKey       |           渲染数据中中的 value 键名           |       string        | value  |
|       labelKey       |           渲染数据中中的 label 键名           |       string        | label  |
|        title         |                     标题                      |       string        |   -    |
|      showSearch      |                是否显示搜索框                 |       boolean       |  true  |
|  searchPlaceholder   |                搜索框的占位符                 |       string        |   -    |
|      titleColor      |                标题栏文字颜色                 |       string        |   -    |
| titleBackgroundColor |                 标题栏背景色                  |       string        |   -    |
|        border        |           是否显示边框，1.1.0 新增            |       string        |   -    |

### options

|  属性名  |               说明               |
| :------: | :------------------------------: |
|  label   |  显示文本，可通过 labelKey 更改  |
|  value   | 选中后的值，可通过 valueKey 更改 |
| disabled |             是否禁用             |

## Events

| 事件名 |         说明         |  回调参数  |
| :----: | :------------------: | :--------: |
| change | 选中值发生变化时触发 | 目前选中值 |

## Slot

|    名称     |                   说明                    |
| :---------: | :---------------------------------------: |
| suffix-icon |              下拉选择器图标               |
|    label    | 选项 label，参数为 options 中元素全部内容 |

## Methods

| 名称  |      说明      |
| :---: | :------------: |
| open  | 打开选择器窗口 |
| close | 关闭选择器窗口 |
