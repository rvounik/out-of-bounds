export default class Sky {
    constructor(context, imageId) {
        this.context = context;
        this.imageId = imageId;
    }

    draw() {
        this.context.drawImage(
            this.imageId['img'],
            0, 0,
            800, 300
        );
    }
}
