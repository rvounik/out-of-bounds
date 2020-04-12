export default class Golfer {
    constructor(context, golfer, dropShadow) {
        this.context = context;
        this.golfer = golfer;
        this.dropShadow = dropShadow;
    }

    draw() {
        this.context.globalAlpha = .5;

        this.context.drawImage(
            this.dropShadow.img,
            275, 555,
            133, 33
        );

        this.context.globalAlpha = 1;

        this.context.drawImage(
            this.golfer.img,
            305, 400,
            109, 180
        );
    }
}
