# as-popup

解决移动端uni-popup的滚动穿透问题

# API

## Props

| 属性名               | 说明                                                        | 类型                | 默认值   |
| :------------------: | :-------------------------------------------:               | :-----------------: | :----:   |
| status(v-model)      | 开启状态                                                    | boolean             | false    |
| type                 | 弹出方式（'left','right','top','bottom','center','dialog'） | string              | 'bottom' |

## Functions

| 名称   | 说明                 | 参数       |
| :----: | :------------------: | :--------: |
| open   | 打开弹出层           | -          |
| close  | 关闭弹出层           | -          |

## Events

| 事件名 | 说明                 | 回调参数   |
| :----: | :------------------: | :--------: |
| change | 状态变化             | 状态       |


# as-popup-dialog 对话框
将 uni-popup 的type属性改为 dialog，并引入对应组件即可使用对话框 ，该组件不支持单独使用

## as-popup-dialog Props

| 属性名               | 说明                                                                                  | 类型                | 默认值 |
| :------------------: | :-------------------------------------------:                                         | :-----------------: | :----: |
| type                 | 对话框标题主题，可选值： success/warn/info/error                                      | string              | 'info' |
| mode                 | 对话框模式，可选值：base（提示对话框）/input（可输入对话框）                          | string              | 'base' |
| title                | 对话框标题                                                                            | string              | -      |
| content              | 对话框内容，base模式下生效                                                            | string              | -      |
| confirmText          | 定义确定按钮文本                                                                      | string              | -      |
| cancelText           | 定义取消按钮文本                                                                      | string              | -      |
| value                | 输入框默认值，input模式下生效                                                         | string/number       | -      |
| placeholder          | 输入框提示文字，input模式下生效                                                       | string              | -      |
| before-close         | 是否拦截按钮事件，如为true，则不会关闭对话框，关闭需要手动执行 as-popup 的 close 方法 | boolean             | false  |

## as-popup-dialog Functions

| 名称    | 说明                   | 参数                            |
| :----:  | :------------------:   | :--------:                      |
| confirm | 点击dialog确定按钮触发 | e={value:input模式下输入框的值} |
| close   | 点击dialog取消按钮触发 | -                               |

## as-popup-dialog Slots

| 名称    | 说明 |
| :-:     | :-:  |
| default | -    |