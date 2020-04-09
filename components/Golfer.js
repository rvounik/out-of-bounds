export default class Golfer {
    constructor(context, imageId) {
        this.context = context;
        this.imageId = imageId;
    }

    draw() {
        this.context.globalAlpha = .75;

        this.context.drawImage(
            this.imageId['img'],
            355, 400,
            109, 180
        );

        this.context.globalAlpha = 1;
    }
}
