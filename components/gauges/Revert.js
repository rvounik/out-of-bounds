export default class Revert {
    constructor(context) {
        this.context = context;
    }

    draw(revert) {

        const startArc = 0.5;
        const endArc = 1.4;
        const context = this.context;

        context.globalAlpha = .6;
        context.beginPath();
        context.arc(340, 438, 150, startArc * Math.PI, (startArc + (revert * ((endArc - startArc) / 100))) * Math.PI);

 //       context.arc(340, 438, 150, startArc * Math.PI, downSwing * ((endArc-startArc)/power) * Math.PI);
        context.lineWidth = 10;
        context.strokeStyle = "#ffffff";
        context.stroke();
        context.globalAlpha = 1;


        /* todo: look into combining this with Power */

    }
}
