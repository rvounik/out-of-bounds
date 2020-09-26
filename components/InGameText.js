export default class InGameText {
    constructor(context, images) {
        this.context = context;
        this.images = images;
        this.startTimer = 0;
    }

    draw(img, x, y, timeOut = null) {
        if (timeOut && this.startTimer < timeOut) {
            this.startTimer ++;

            this.context.drawImage(
                this.images[img].img,
                x, y,
                this.images[img].img.width, this.images[img].img.height
            );
        }
    }
}
