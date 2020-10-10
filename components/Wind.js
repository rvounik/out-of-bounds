import Type from './../helpers/Type.js';

export default class Wind {
    constructor(context) {
        this.context = context;
    }

    draw(startX) {
        const context = this.context;

        context.fillStyle = "#ffffff";
        context.fillRect(startX, 20, 62, 62);

        Type.positionedText({ context, font: '13.7px Teko', text: 'WIND: NW3', color: "#ffffff", x: startX, y: 97 });
    }
}
