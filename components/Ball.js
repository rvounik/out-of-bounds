export default class Ball {
    constructor(context, img) {
        this.context = context;
        this.img = img;
        this.offset = 0;
    }

    animate() {
        const startX = -100;
        const startY = 475;

        this.context.drawImage(
            this.img,
            startX + (60 * this.offset) % 1200, startY + (50 * Math.sin(this.offset += 0.35)),
            81, 81
        );
    }

    draw(x, y, w, h) {
        this.context.drawImage(
            this.img,
            x, y,
            w, h
        );
    }
}
