# canvas-poster
canvas 画图辅助工具

### use

获取到 `canvas-poster.js` 插件

```html

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>canvas-poster demo</title>
    <style>
        body {
            margin: 0;
        }
        canvas {
            border: 1px solid #ddd;
            display: block;
            margin: 50px auto;
        }
    </style>
</head>

<body>
    <canvas id="canvas" width="375" height="600"></canvas>

    <script src="./canvas-poster.js"></script>
</body>

</html>

```

```javascript
    // 初始化canvas 画布
    let canvas = document.querySelector('#canvas')
    canvasPoster.init(canvas, {
        // 设置画布属性
        width: 300,
        height: 500,
        guidelineSpace: 20, // 辅助线间隔，默认20
        guidelines: true    // 开启辅助线，默认开启
    })
    // 你想画的内容
    canvasPoster.painting([
        {
            // 文本，图片，图形，线条。具体参数参考表格
            
            // 例如
            type: 'text',
            position: [60, 20],
            content: '人生得意须尽欢',
            font: '16px sans-serif',
            color: 'yellow',
            textAlign: 'center'
        }
    ])

```

### 初始化配置
|`init()`| 取值 | 初始化方法|
|---|---|---
|width| Number | 画布宽度
|height| Number | 画布高度
|guidelines| Boolean | 是否开启辅助线。默认`true`
|guidelineSpace| Number | 辅助线间隔，横线纵向一致，默认20 (单位px)

---

|`painting(options)` | - | 画图方法
|---|---|---
|options| Array | 画布元素（text, image, line, art）

### 文本

| type | 取值 |```text``` |
|---|---|---
|content| - | 文本内容
|position|[x, y] Number 类型|文本位置
|font|'16px sans-serif'|同css属性值
|color|yellow； #fff； rgb(0, 0, 0)；rgba(0, 0, 0, 0.5)|文本颜色
|textAlign|left center right|对齐方式
|textDecoration|overline line-through underline|文字划线
|maxWidth| Number | 文本宽度
|row| Number | 显示行数 
|overflow| clip 裁剪 ellipsis 文本溢出显示省略号|超出展示
|textIndent|Number|首行缩进
|background|yellow； #fff； rgb(0, 0, 0)；rgba(0, 0, 0, 0.5)|背景色

---

### 图片

|type| 取值 | ```image``` |
|---|---|---
|src| 本地图片；页面中的img标签节点；base64图片 | 图片地址
|position|[x, y]|图片位置
|width|Number|宽度
|height|Number|高度
|round| ```true``` or ```false```|是否剪切成圆形

> ```src``` 使用页面中的img标签节点；当然最好使用地址
```javascript
    let img = document.querySelector('img')[0]

    ...(省略)
    canvasPoster.painting([
        {
            type: 'image',
            src: img, // 获取到页面中的img节点，赋给src
            width: ...
            height: ...
        }
    ])
```
---

### 线条

|type| 取值 | ```line```|
|---|---|---
|lineWidth|Number|线条宽度
|start|[x, y]|起始坐标
|end|[x, y]|结束坐标
|color|yellow； #fff； rgb(0, 0, 0)；rgba(0, 0, 0, 0.5)|颜色
|lineCap| 默认```butt``` round square |线条两端样式
|lineType| dash 虚线 solid 实线 | 线条样式

---

### 圆
|type| 取值 | ```arc```|
|---|---|---
|position| [x, y] | 圆心位置
|radius| Number | 半径
|color| yellow； #fff； rgb(0, 0, 0)；rgba(0, 0, 0, 0.5) | 颜色
|style| fill, stroke| 填充 或 描边

---

### 矩形
|type| 取值 | ```rect```|
|---|---|---
|position| [x, y] | 矩形左上角位置
|width| Number | 宽
|height| Number | 高
|color| yellow； #fff； rgb(0, 0, 0)；rgba(0, 0, 0, 0.5) | 颜色
|style| fill, stroke | 填充 或 描边

----

