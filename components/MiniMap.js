export default class MiniMap {
    constructor(context, imageId) {
        this.context = context;
        this.imageId = imageId;
    }

    draw() {
        this.context.globalAlpha = .5;
        this.context.drawImage(
            this.imageId['img'],
            640, 320,
            160, 312
        );
        this.context.globalAlpha = 1;
    }
}
