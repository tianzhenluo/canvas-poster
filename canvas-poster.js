const canvasPoster = {
    canvas: null,
    ctx: null,
    width: 300,
    height: 500,
    guidelineSpace: 20,
    guidelines: true,
    roundClipImage: [],
    loadImages: [],
    scale: 1,
    drawDone: false,
    canvasBackground: 'white', // 画布白色背景，none不设置背景就是透明
    count: 0,

    init: function (el, params) {
        this.canvas = document.querySelector(el)
        this.ctx = this.canvas.getContext('2d')
        this.width = params.width
        this.height = params.height
        this.canvas.width = this.width
        this.canvas.height = this.height
        this.guidelineSpace = params.guidelineSpace == undefined ? this.guidelineSpace : params.guidelineSpace
        this.guidelines = params.guidelines || this.guidelines
        let scale = params.scale || this.scale
        this.ctx.scale(scale, scale)

        return this
    },

    painting: function (paint) {
        if (paint instanceof Array) {
            if (this.canvasBackground != 'none') {
                paint.unshift({
                    type: 'rect',
                    position: [0, 0],
                    width: this.width,
                    height: this.height,
                    color: this.canvasBackground,
                    style: 'fill'
                })
            }
            paint.forEach(item => {
                switch (item.type) {
                    case 'text':
                        this.textPaint(item)
                        break
                    case 'image':
                        this.loadImages.push(item)
                        break
                    case 'line':
                        this.linePaint(item)
                        break
                    case 'rect':
                        this.rectPaint(item)
                        break
                    case 'arc':
                        this.arcPaint(item)
                        break
                }
            })

            this.awaitList()

        } else {
            new Error('painting must be Array')
        }

        this.guidelines && this.guideline()

        return this
    },

    awaitList() {
        if (this.loadImages.length != 0) {
            if (this.count < this.loadImages.length) {
                this.imagePaint(this.loadImages[this.count], () => {
                    this.count++
                    this.awaitList()
                })
            } else {
                this.drawDone = true
            }
        } else {
            this.drawDone = true
        }
    },

    // 文字 - 绘图
    textPaint: function (paint) {
        this.ctx.save()
        this.ctx.font = paint.font
        this.ctx.textAlign = paint.textAlign
        this.textWrap(paint)
        this.ctx.restore()
    },

    // 图片 - 绘图
    imagePaint: function (paint, fn) {
        let _this = this
        if (!paint.src) {
            new Error('image src cannot be empty')
            return
        }

        // 画图-边框
        _this.ctx.lineWidth = paint.border ? Number(paint.border) : 1

        // 圆形
        if (paint.round) {
            let img = new Image()
            let _this = this
            img.onload = function () {
                let radius = 0
                if (paint.width === paint.height) {
                    radius = paint.width / 2
                } else {
                    radius = paint.width > paint.height ? paint.height / 2 : paint.width / 2
                }

                _this.ctx.beginPath()
                _this.ctx.save()
                _this.ctx.arc(Number(paint.position[0]) + radius, Number(paint.position[1]) + radius, radius, 0, Math.PI * 2, false)
                paint.border && _this.ctx.stroke()
                _this.ctx.clip()
                _this.ctx.drawImage(img, paint.position[0], paint.position[1], radius * 2, radius * 2)
                _this.ctx.restore()

                if (_this.imageDrawDone) {
                    console.log('图片列表绘制完成，开始生成图片')
                    _this.toDataURL()
                }
                typeof fn == 'function' && fn()
            }
            img.src = paint.src
            return
        }

        if (typeof paint.src === 'string') {
            this.ctx.save()
            let img = new Image()
            img.onload = function () {
                _this.ctx.drawImage(img, paint.position[0], paint.position[1], Number(paint.width), Number(paint.height))
                if (_this.imageDrawDone) {
                    console.log('图片列表绘制完成，开始生成图片')
                    _this.toDataURL()
                }
                typeof fn == 'function' && fn()
            }
            img.src = paint.src
        } else {
            this.ctx.save()
            let img = paint.src
            this.ctx.drawImage(img, paint.position[0], paint.position[1], Number(paint.width), Number(paint.height))
            if (_this.imageDrawDone) {
                console.log('图片列表绘制完成，开始生成图片')
                _this.toDataURL()
            }
            typeof fn == 'function' && fn()
        }
    },

    // 线条
    linePaint(paint) {
        this.ctx.save()
        this.ctx.fillStyle = paint.color
        this.ctx.strokeStyle = paint.color
        this.ctx.lineWidth = Number(paint.lineWidth)
        this.ctx.lineCap = paint.lineCap
        if (paint.lineType === 'dash') {
            this.ctx.setLineDash([5, 5])
        }
        this.ctx.beginPath()
        this.ctx.moveTo(paint.start[0], paint.start[1])
        this.ctx.lineTo(paint.end[0], paint.end[1])
        this.ctx.stroke()
        this.ctx.restore()
    },

    // 矩形
    rectPaint(paint) {
        this.ctx.save()
        this.ctx.fillStyle = paint.color
        this.ctx.strokeStyle = paint.color
        if (!paint.style || paint.style === 'stroke') {
            this.ctx.strokeRect(paint.position[0], paint.position[1], paint.width, paint.height)
        } else {
            this.ctx.fillRect(paint.position[0], paint.position[1], paint.width, paint.height)
        }
        this.ctx.restore()
    },

    // 圆形
    arcPaint(paint) {
        this.ctx.save()
        this.ctx.beginPath()
        this.ctx.fillStyle = paint.color
        this.ctx.strokeStyle = paint.color
        this.ctx.arc(paint.position[0], paint.position[1], paint.radius, 0, Math.PI * 2, true)
        if (!paint.style || paint.style === 'stroke') {
            this.ctx.stroke()
        } else {
            this.ctx.fill()
        }
        this.ctx.restore()
    },

    // 计算文本画下划线删除线上划线，文本背景色，一行或多行文本
    // 目前只能根据textBaseline alphabetic 默认值来计算
    computedTextArea: function (paint, subscript) {
        this.ctx.save()
        let textSize = this.textMetries(paint)
        let offset = 3
        this.ctx.beginPath()
        let textAlign = paint.textAlign || 'left'
        let lineMoveTo = []
        let linePosition = []
        let backgroundPosition = []

        switch (textAlign) {
            case 'left':
                lineMoveTo[0] = paint.position[0]
                linePosition[0] = paint.position[0] + textSize.width
                break
            case 'center':
                linePosition[0] = paint.position[0] + textSize.width / 2
                lineMoveTo[0] = paint.position[0] - textSize.width / 2
                break
            case 'right':
                lineMoveTo[0] = paint.position[0] - textSize.width
                linePosition[0] = paint.position[0]
                break
        }

        switch (paint.textDecoration) {
            case 'line-through':
                lineMoveTo[1] = linePosition[1] = paint.position[1] - (textSize.height / 2) + offset
                break
            case 'underline':
                lineMoveTo[1] = linePosition[1] = paint.position[1]
                break
            case 'overline':
                lineMoveTo[1] = linePosition[1] = paint.position[1] - textSize.height + offset
                break
        }

        if (subscript != undefined && subscript === 0) {
            lineMoveTo[0] += Number(paint.textIndent ? paint.textIndent : 0)
            linePosition[0] += Number(paint.textIndent ? paint.textIndent : 0)
        }

        backgroundPosition[0] = lineMoveTo[0]
        backgroundPosition[1] = paint.position[1] - textSize.height + offset

        // 划线
        if (paint.textDecoration) {
            this.ctx.save()
            this.ctx.moveTo(lineMoveTo[0], lineMoveTo[1])
            this.ctx.lineTo(linePosition[0], linePosition[1])
            this.ctx.strokeStyle = paint.color
            this.ctx.stroke()
            this.ctx.restore()
        }

        // 背景色
        if (paint.background) {
            this.ctx.save()
            this.ctx.fillStyle = paint.background
            this.ctx.fillRect(backgroundPosition[0], backgroundPosition[1], textSize.width, textSize.height)
            this.ctx.restore()
        }
    },

    // canvas 辅助线
    guideline: function () {
        this.ctx.save()
        this.ctx.lineWidth = 1
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
        let row = this.guidelineSpace
        let col = this.guidelineSpace

        while (col < this.width) {
            this.ctx.beginPath()
            this.ctx.moveTo(col, 0)
            this.ctx.lineTo(col, this.height)
            this.ctx.stroke()
            this.rulerNum(col, [col, 10])
            col += this.guidelineSpace
        }

        while (row < this.height) {
            this.ctx.beginPath()
            this.ctx.moveTo(0, row)
            this.ctx.lineTo(this.width, row)
            this.ctx.stroke()
            this.rulerNum(row, [0, row])
            row += this.guidelineSpace
        }

        this.ctx.restore()
    },

    rulerNum: function (num, position) {
        this.ctx.font = '12px sans-serif'
        this.ctx.fillText(num, position[0], position[1])
    },

    // 文本 - 宽高计算
    textMetries(paint) {
        let tm = this.ctx.measureText(paint.content),
            w = tm.width,
            h, el
        if (typeof tm.fontBoundingBoxAscent == 'undefined') {
            el = document.createElement('div')
            el.style.cssText = `position: fixed;font: ${paint.font};padding: 0;margin: 0;left: -9999px;top: -9999px`
            el.innerHTML = paint.content
            document.body.appendChild(el)
            h = parseInt(window.getComputedStyle(el).getPropertyValue('height'))
        } else {
            h = tm.fontBoundingBoxAscent + tm.fontBoundingBoxDescent
        }
        document.body.removeChild(el)
        return {
            width: w,
            height: h
        }
    },

    // 文本 - 单行或多行
    textWrap(paint) {
        let textSize = this.textMetries(paint)
        let maxWidth = paint.maxWidth * 1
        let row = paint.row ? (paint.row * 1) : 1

        if (paint.textAlign === 'left' || paint.textAlign == 'undefined') {
            maxWidth = maxWidth ? maxWidth : this.width - paint.position[0]
        } else if (paint.textAlign === 'center') {
            maxWidth = maxWidth ? maxWidth : this.width
        } else if (paint.textAlign === 'right') {
            maxWidth = maxWidth ? maxWidth : paint.position[0]
        }

        this.ctx.save()
        this.ctx.fillStyle = paint.color

        // 一行显示完全
        if (row === 1 && textSize.width <= maxWidth) {
            this.computedTextArea(paint)
            this.ctx.fillText(paint.content, paint.position[0], paint.position[1], maxWidth)
        } else {
            // 换行或裁剪
            let length = paint.content.length
            let rowText = []
            let text = ''
            let sliceEndSub = 0

            for (let i = 0; i < length; i++) {
                text += paint.content[i]
                let tw = this.ctx.measureText(text).width
                if (rowText.length === 0 && paint.textIndent && Number(paint.textIndent) > 0) {
                    tw += Number(paint.textIndent)
                }

                if (tw >= maxWidth) {
                    rowText.push(text)
                    text = ''
                    sliceEndSub = i + 1
                }
            }

            if (sliceEndSub < length) {
                let surplus = paint.content.slice(-(length - sliceEndSub))
                rowText.push(surplus)
            }

            rowText.length = rowText.length < row ? rowText.length : row

            rowText.forEach((item, index) => {
                let formatText = item
                if (paint.overflow && paint.overflow === 'ellipsis' && index === rowText.length - 1) {
                    formatText = formatText.slice(0, formatText.length - 2) + '...'
                }
                if (paint.textIndent && Number(paint.textIndent) > 0 && index == 0) {
                    this.ctx.fillText(formatText, paint.position[0] + Number(paint.textIndent), paint.position[1] + index * textSize.height)
                } else {
                    this.ctx.fillText(formatText, paint.position[0], paint.position[1] + index * textSize.height)
                }

                // 多行文本画下划线
                let copyPaint = JSON.parse(JSON.stringify(paint))
                copyPaint.position[1] = paint.position[1] + index * textSize.height
                copyPaint.content = formatText
                this.computedTextArea(copyPaint, index)
            })
        }

        this.ctx.restore()
    },

    // 生成图片
    toDataURL() {
        if (this.canvas) {
            if (this.imageDrawDone) {
                console.log('画图完成，开始下载')
                let base64Img = this.canvas.toDataURL('image/png', 1.0)
                this.download(base64Img)
                return base64Img
            } else {
                console.log('画图中')
            }
        }
    },

    download(url) {
        let aEl = document.createElement('a')
        aEl.setAttribute('href', url)
        aEl.setAttribute('download', (new Date()).getTime())
        aEl.click()
        console.log('下载完成')
    }
}

Object.defineProperty(canvasPoster, 'imageDrawDone', {
    get() {
        return !(canvasPoster.loadImages.length > canvasPoster.count)
    },
    set(value) {
        canvasPoster.imageDrawDone = value
    }
})