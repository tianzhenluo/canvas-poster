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
        console.log(paint)
        if (paint instanceof Array) {
            paint.forEach(item => {
                switch (item.type) {
                    case 'text':
                        this.textPaint(item)
                        break
                    case 'image':
                        this.imagePaint(item)
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
        this.ctx.fillStyle = paint.color ? paint.color : '#000'
        this.ctx.font = paint.font
        this.ctx.textAlign = paint.textAlign
        let position = paint.position ? paint.position : [0, 0]

        // this.ctx.fillText(paint.content, position[0], position[1], paint.maxWidth)
        this.textWrap(paint)
        paint.textDecoration && this.underlinePaint(paint)
        this.ctx.restore()
    },

    // 图片 - 绘图
    imagePaint: function (paint) {

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
            el.style.cssText = `position: fixed;font: ${paint.font};padding: 0;margin: 0;left: -9999px;top: -999px`
            el.innerHTML = paint.content
            document.body.appendChild(el)
            h = parseInt(window.getComputedStyle(el).getPropertyValue('height'))
        } else {
            h = tm.fontBoundingBoxAscent + tm.fontBoundingBoxDescent
        }
        return {
            width: w,
            height: h
        }
    },

    // 文本 - 换行
    textWrap(paint) {
        let textWidth = this.textMetries(paint.content).width
        let maxWidth = paint.maxWidth 
        if (paint.textAlign === 'left' || paint.textAlign == 'undefined') {
            maxWidth = maxWidth ? maxWidth : paint.position[0] + textWidth
        }
        console.log(textWidth)
    }
}
