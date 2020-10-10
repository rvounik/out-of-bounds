export default class Power {
    constructor(context) {
        this.context = context;
    }

    draw(power) {
        const context = this.context;
        const startArc = 0.5;
        const endArc = 1.4;

        context.globalAlpha = .3;

        // outline power bar
        context.beginPath();
        context.arc(340, 438, 150, startArc * Math.PI, (startArc + (power * ((endArc - startArc) / 100))) * Math.PI);
        context.lineWidth = 17;
        context.strokeStyle = "#999999";
        context.stroke();

        // power bar
        context.beginPath();
        context.arc(340, 438, 150, startArc * Math.PI, (startArc + (power * ((endArc - startArc) / 100))) * Math.PI);
        context.lineWidth = 15;
        context.strokeStyle = "#ffffff";
        context.stroke();

        // outline spin bar
        context.fillStyle = '#999999';
        context.fillRect(340, 579, 104, 16);

        // spin bar
        context.fillStyle = '#ffffff';
        context.fillRect(340, 581, 102, 15);

        context.globalAlpha = 1;
    }
}
