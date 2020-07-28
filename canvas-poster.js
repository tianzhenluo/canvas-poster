const canvasPoster = {
    canvas: null,
    ctx: null,
    width: 300,
    height: 500,
    guidelineSpace: 20,
    guidelines: true,

    init: function (el, params) {
        this.canvas = document.querySelector(el)
        this.ctx = this.canvas.getContext('2d')
        this.width = params.width
        this.height = params.height
        this.guidelineSpace = params.guidelinesSpace
        this.guidelines = params.guidelines

        this.guidelines && this.guideline()

        return this
    },

    painting: function (paint) {
        if (paint instanceof Array) {
            paint.forEach(item => {
                switch (item.type) {
                    case 'text':
                        this.textPaint(item)
                        break
                    case 'image':
                        this.imagePaint(item)
                        break
                    case 'line':
                        this.linePaint(item)
                        break
                }
            })
        } else {
            new Error('painting must be Array')
        }
    },

    // 文字 - 绘图
    textPaint: function (paint) {
        this.ctx.save()
        this.ctx.fillStyle = paint.color
        this.ctx.font = paint.font
        this.ctx.textAlign = paint.textAlign
        this.textWrap(paint)
        paint.textDecoration && this.underlinePaint(paint)
        this.ctx.restore()
    },

    // 图片 - 绘图
    imagePaint: function (paint) {
        let _this = this

        if (!paint.src) {
            new Error('image src cannot be empty')
            return
        }
        if (typeof paint.src === 'string') {
            let img = new Image()
            img.onload = function () {
                _this.ctx.drawImage(img, paint.position[0], paint.position[1], Number(paint.width), Number(paint.height))
            }
            img.src = paint.src
        } else {
            let img = paint.src
            console.log(img)
            this.ctx.drawImage(img, paint.position[0], paint.position[1], Number(paint.width), Number(paint.height))
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

    // 下划线
    underlinePaint: function (paint) {
        this.ctx.save()
        let textSize = this.textMetries(paint)
        let offset = 3
        this.ctx.beginPath()
        let textAlign = paint.textAlign || 'left'
        let lineMoveTo = []
        let linePosition = []

        switch (textAlign) {
            case 'left':
                lineMoveTo[0] = paint.position[0]
                linePosition[0] = paint.position[0] + textSize.width
                break
            case 'center':
                lineMoveTo[0] = paint.position[0] + textSize.width / 2
                linePosition[0] = paint.position[0] - textSize.width / 2
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

        }

        this.ctx.moveTo(lineMoveTo[0], lineMoveTo[1])
        this.ctx.lineTo(linePosition[0], linePosition[1])

        this.ctx.strokeStyle = paint.color
        this.ctx.stroke()
        this.ctx.restore()
    },

    guideline: function () {
        this.ctx.save()
        this.ctx.lineWidth = 1
        this.ctx.strokeStyle = 'rgba(11,11,11, 0.4)'
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
        this.ctx.font = '12px'
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

        // document.body.removeChild(el)

        return {
            width: w,
            height: h
        }
    },

    // 文本 - 换行
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

        console.log({
            '文本': paint.content,
            '文本宽': textSize.width,
            '最大宽度': maxWidth
        })

        // 一行显示完全
        if (row === 1 && textSize.width <= maxWidth) {
            this.ctx.fillText(paint.content, paint.position[0], paint.position[1], maxWidth)
            this.ctx.stroke()
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
                // && this.textMetries(rowText.length -1).width >= maxWidth
                if (paint.overflow && paint.overflow === 'ellipsis' && index === rowText.length - 1) {
                    formatText = formatText.slice(0, formatText.length - 1) + '...'
                }
                if (paint.textIndent && Number(paint.textIndent) > 0 && index == 0) {
                    this.ctx.fillText(formatText, paint.position[0] + Number(paint.textIndent), paint.position[1] + index * textSize.height)
                } else {
                    console.log(paint.position[0])
                    this.ctx.fillText(formatText, paint.position[0], paint.position[1] + index * textSize.height)
                }
            })
        }
    }
}
