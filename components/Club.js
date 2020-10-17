export default class Club {
    constructor(context, clubs) {
        this.context = context;
        this.clubs = clubs;
    }

    draw(type, x, y) {

        // validate given skyType with constants
        const club = Object.keys(this.clubs).filter(club => club === type);

        const imageWidth = this.clubs[club].img.width;
        const imageHeight = this.clubs[club].img.height;

        // draw image at 0, 0
        this.context.drawImage(
            this.clubs[club].img,
            x ,y,
            110, 58
        );
    }
}
