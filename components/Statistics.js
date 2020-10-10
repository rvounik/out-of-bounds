import helpers from './../helpers/index.js';

export default class Statistics {
    constructor(context) {
        this.context = context;
    }

    draw(stroke, par) {
        const context = this.context;
        const fontSize = stroke > 9 ? 60 : 120;
        const startY = stroke > 9 ? 93 : 110;

        // stroke
        context.globalAlpha = .5;
        context.fillStyle = "#333333";
        context.globalAlpha = 1;
        context.fillRect(295, 20, 80, 105);

        helpers.Type.positionedText({ context: this.context, font: `${fontSize}px Inconsolata`, text: stroke, color: "#ffffff", x: 305, y: startY });
        helpers.Type.positionedText({ context: this.context, font: "18px Teko", text: "STROKE", color: "#ffffff", x: 308, y: 145 });

        // glow line
        context.globalAlpha = .8;
        context.fillStyle = "#ffffff";
        context.fillRect(295, 20, 80, 2);
        context.globalAlpha = 1;

        // par
        context.globalAlpha = .5;
        context.fillStyle = "#333333";
        context.globalAlpha = 1;
        context.fillRect(430, 20, 80, 105);

        helpers.Type.positionedText({ context: this.context, font: "120px Inconsolata", text: par, color: "#ffffff", x: 440, y: 110 });
        helpers.Type.positionedText({ context: this.context, font: "18px Teko", text: "PAR", color: "#ffffff", x: 450, y: 145 });

        // glow line
        context.globalAlpha = .8;
        context.fillStyle = "#ffffff";
        context.fillRect(430, 20, 80, 2);
        context.globalAlpha = 1;
    }
}
