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

        this.ctx.fillText(paint.content, position[0], position[1], paint.maxWidth)
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
        console.log(textSize)

        this.ctx.beginPath()

        switch (paint.textDecoration) {
            case 'line-through':
                this.ctx.moveTo(paint.position[0], paint.position[1] - (textSize.height / 2) + offset)
                this.ctx.lineTo(paint.position[0] + textSize.width, paint.position[1] - (textSize.height / 2) + offset)
                break
        }

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
    }
}
