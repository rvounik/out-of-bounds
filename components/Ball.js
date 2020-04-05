export default class Ball {
    constructor(context, img) {
        this.context = context;
        this.img = img;
        this.offset = 0;
        this.startX = -100;
        this.startY = 475;
    }

    draw() {
        this.context.drawImage(
            this.img,
            this.startX + (60 * this.offset) % 1200, this.startY + (50 * Math.sin(this.offset += 0.35)),
            81, 81
        );
    }
}
