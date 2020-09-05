import helpers from './../helpers/index.js';

export default class Statistics {
    constructor(context, statistics) {
        this.context = context;
        this.stroke = statistics.stroke;
        this.par = statistics.par;
    }

    draw() {
        helpers.Type.positionedText({ context: this.context, font: "18px Teko", text: "STROKE", color: "#aa0000", x: 15, y: 30 });
        helpers.Type.positionedText({ context: this.context, font: "70px Teko", text: this.stroke, color: "#ffffff", x: 15, y: 80 });
        helpers.Type.positionedText({ context: this.context, font: "18px Teko", text: "PAR", color: "#aa0000", x: 755, y: 30 });
        helpers.Type.positionedText({ context: this.context, font: "70px Teko", text: this.par, color: "#ffffff", x: 745, y: 80 });
    }
}
