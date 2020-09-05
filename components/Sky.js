import Skies from './../constants/Skies.js';

export default class Sky {
    constructor(context, skies) {
        this.context = context;
        this.skies = skies;
    }

    draw(skyType, state, gradient = false, connectToAngle = false) {

        // validate given skyType with constants
        const sky = Object.keys(this.skies).filter(sky => sky === skyType);

        const imageWidth = this.skies[sky].img.width;
        const imageHeight = this.skies[sky].img.height;
        const imageWidthWithoutProjectionWidth = imageWidth - state.projection.width;
        const shiftPixelsPerAngle = imageWidthWithoutProjectionWidth / 360;
        const angle = state.player.angle % 360;

        if (connectToAngle) {

            // draw image according to player rotation
            this.context.drawImage(
                this.skies[sky].img,
                angle <=0
                    ? (angle * shiftPixelsPerAngle)
                    : -imageWidthWithoutProjectionWidth + (angle * shiftPixelsPerAngle)
                , 0,
                imageWidth, imageHeight
            );
        } else {

            // draw image at 0, 0
            this.context.drawImage(
                this.skies[sky].img,
                0 ,0,
                imageWidth, 300
            );
        }

        // draw gradient at the horizon if requested
        if (gradient) {
            this.context.drawImage(
                this.skies[Skies.GRADIENT].img,
                0, imageHeight,
                imageWidthWithoutProjectionWidth, 20
            );
        }
    }
}
