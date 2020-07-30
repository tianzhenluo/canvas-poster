# canvas-poster
canvas 画图辅助工具

``` javascript

    canvasPoster.init(el, {
        width: 300,
        height: 500
    }).painting([
        {
            type: 'text',
            content: '中文是最屌的',
            position: [160, 40],
            font: '16px sans-serif',
            textAlign: 'center',
            color: '#333'
        }, {
            type: 'image',
            src: './dog.png',
            position: [140, 160],
            width: 250,
            height: 130
        }
    ])

```

### 文本

| type | - |```text``` |
|---|---|---
|content| - | 文本内容
|position|[x, y]|文本位置
|font|'16px sans-serif'|同css属性值
|color|yellow #fff rgb(0, 0, 0)|文本颜色
|textAlign|left center right|对齐方式
|textDecoration|overline line-through underline|文字划线
|maxWidth| Number | 文本宽度
|row| Number | 显示行数 
|overflow| clip 裁剪 ellipsis 文本溢出显示省略号|超出展示
|textIndent|Number|首行缩进

### 图片

|type| - | ```image``` |
|---|---|---
|src| - | 图片地址
|position|[x, y]|图片位置
|width|Number|宽度
|height|Number|高度
|round| ```true``` or ```false```|是否剪切成圆形；头像之类

### 线条

|type| - | ```line```|
|---|---|---
|lineWidth|Number|线条宽度
|start|[x, y]|起始坐标
|end|[x, y]|结束坐标
|color| yellow #fff rgb(0, 0, 0)|颜色
|lineCap| 默认```butt``` round square |线条两端样式
|lineType| dash 虚线 solid 实线 | 线条样式

### 圆
|type| - | ```arc```|
|---|---|---
|position| [x, y] | 圆心位置
|radius| Number | 半径
|color| yellow #fff rgb(0, 0, 0) | 颜色
|style| fill, stroke| 填充或描边

### 矩形
|type| - | ```rect```|
|---|---|---
|position| [x, y] | 矩形左上角位置
|width| Number | 宽
|height| Number | 高
|color| yellow #fff rgb(0, 0, 0) | 颜色
|style| fill, stroke | 填充或描边

----

#### 计划

- [ ] 多行文本划线
- [ ] 单行文本及多行文本背景色
- [x] 画圆
- [x] 画矩形
- [ ] 多个圆图，切割出现内分泌紊乱

----