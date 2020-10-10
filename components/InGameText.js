export default class InGameText {
    constructor(context, image, timeOut) {
        this.context = context;
        this.image = image;
        this.timeOut = timeOut;

        this.startTimer = 0;
    }

    draw() {
        const timeOut = this.timeOut;
        const image = this.image;

        if (this.startTimer < timeOut) {

            this.startTimer ++;

            this.context.save();
            this.context.translate(400, 220);

            let scaleFactor = .5 + (1 / (50 - this.startTimer));

            if (scaleFactor > 1) {
                scaleFactor = 1
            }

            this.context.scale(scaleFactor, scaleFactor);

            this.context.globalAlpha = 1 - (this.startTimer / 60);

            this.context.drawImage(
                image.img,
                0 - image.img.width / 2 , 0 - image.img.height / 2,
                image.img.width, image.img.height
            );
            this.context.restore();
        }
    }
}
