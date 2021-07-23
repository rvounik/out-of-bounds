import Type from './../helpers/Type.js';

export default class Wind {
    constructor(context) {
        this.context = context;
    }

    draw(startX, angle, speed, playerAngle) {
        const context = this.context;

        context.globalAlpha = .75;

        context.translate(startX , 0);

        context.strokeStyle = "#ffffff";
        context.lineWidth = 2;
        context.strokeRect(0, 20, 62, 62);

        const grd = context.createLinearGradient(1,21,0,60);
        grd.addColorStop(0,"#58732C");
        grd.addColorStop(1,"#34471D");
        context.fillStyle = grd;
        context.fillRect(1, 21, 60, 60);

        context.beginPath();
        context.lineWidth = 2;
        context.arc(31, 51, 20, 0, 2 * Math.PI);
        context.stroke();

        context.fillStyle = "#aaa";
        context.fillRect(31, 32, 2, 5);

        context.fillStyle = "#aaa";
        context.fillRect(45, 50, 5, 2);

        context.fillStyle = "#aaa";
        context.fillRect(31, 66, 2, 5);

        context.fillStyle = "#aaa";
        context.fillRect(12, 50, 5, 2);

        context.save();
        context.translate(32, 52);

        angle += playerAngle;

        context.rotate(angle * Math.PI / 180);

        context.beginPath();
        context.moveTo(-4, -20);
        context.lineTo(4, -20);
        context.lineTo(0, -4);
        context.closePath();
        context.fillStyle = "#ffffff";
        context.fill();

        context.restore();

        context.globalAlpha = 1;

        // wind speed is usually between 0 and 30 m/s
        Type.positionedText({ context, font: '14.5px Teko', text: `WIND: ${parseInt(speed)}`, color: "#ffffff", x: 0, y: 97 });
        Type.positionedText({ context, font: '11px Teko', text: 'm/s', color: "#ffffff", x: speed > 9 ? 51 : 45, y: 97 });

        context.translate(-startX , 0);
    }
}
