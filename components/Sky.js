import Skies from './../constants/Skies.js';

export default class Sky {
    constructor(context, skies) {
        this.context = context;
        this.skies = skies;
    }

    draw(skyType) {

        // validate given skyType with constants
        const sky = Object.keys(this.skies).filter(sky => sky === skyType);

        this.context.drawImage(
            this.skies[sky].img,
            0, 0,
            800, 300
        );

        // draw gradient if required
        if (skyType === Skies.BLUE) {
            this.context.drawImage(
                this.skies[Skies.GRADIENT].img,
                0, 300,
                800, 20
            );
        }
    }
}
