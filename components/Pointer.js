export default class Pointer {
    constructor(context, pointer, arrow) {
        this.context = context;
        this.arrow = arrow;
        this.pointer = pointer;
    }

    draw() {
        this.context.globalAlpha = .5;

        this.context.drawImage(
            this.pointer['img'],
            390, 346,
            21, 230
        );

        this.context.save();
        this.context.translate(495, 520);

        this.context.drawImage(
            this.arrow['img'],
            0, 0,
            40, 40
        );

        this.context.scale(-1, 1);

        this.context.drawImage(
            this.arrow['img'],
            200, 0,
            40, 40
        );

        this.context.restore();
    }
}
