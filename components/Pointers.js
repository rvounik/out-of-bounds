export default class Pointers {
    constructor(context, pointer, arrow) {
        this.context = context;
        this.arrow = arrow;
        this.pointer = pointer;
    }

    draw() {
        this.context.globalAlpha = .5;

        // middle
        this.context.drawImage(
            this.pointer.img,
            417, 318,
            21, 230
        );

        this.context.save();

        this.context.translate(600, 520);

        // left
        this.context.drawImage(
            this.arrow.img,
            0, 0,
            40, 40
        );

        this.context.scale(-1, 1);

        // right
        this.context.drawImage(
            this.arrow.img,
            400, 0,
            40, 40
        );

        this.context.restore();
    }
}
