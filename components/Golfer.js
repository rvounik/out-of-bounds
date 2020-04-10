export default class Golfer {
    constructor(context, imageId, imageIdShadow) {
        this.context = context;
        this.imageId = imageId;
        this.imageIdShadow = imageIdShadow;
    }

    draw() {
        this.context.globalAlpha = .5;

        this.context.drawImage(
            this.imageIdShadow['img'],
            275, 555,
            133, 33
        );

        this.context.globalAlpha = 1;

        this.context.drawImage(
            this.imageId['img'],
            305, 400,
            109, 180
        );
    }
}
