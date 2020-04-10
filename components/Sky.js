export default class Sky {
    constructor(context, sky, gradient = null) {
        this.context = context;
        this.sky = sky;
        this.gradient = gradient;
    }

    draw() {
        this.context.drawImage(
            this.sky['img'],
            0, 0,
            800, 300
        );

        if (this.gradient) {
            this.context.drawImage(
                this.gradient['img'],
                0, 300,
                800, 20
            );
        }
    }
}
