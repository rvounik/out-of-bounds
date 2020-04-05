export default class Title {
    constructor(context, imageId) {
        this.context = context;
        this.imageId = imageId;

        this.y = -800; // starting position
        this.endY = 0; // ending position

        this.state = {
            animating: true
        }
    }

    draw() {
        let diff = 0;

        if (this.state.animating) {
            diff = Math.abs(this.endY - this.y);
            this.y = this.y + diff / 5;
            if (diff < 1) {
                this.state.animating = false;
            }
        } else {
            this.y = this.endY
        }

        this.context.drawImage(
            this.imageId['img'],
            0 - (diff / 4), this.y, // image position
            800+(diff / 2), 200+(diff / 1.5) // image dimension
        );
    }
}
