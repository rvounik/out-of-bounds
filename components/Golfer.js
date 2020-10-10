export default class Golfer {
    constructor(context, golfer, dropShadow) {
        this.context = context;
        this.golfer = golfer;
        this.dropShadow = dropShadow;
    }

    draw(player) {
        const context = this.context;

        // by default this is the club-to-ground sprite
        let spriteOffset = 1000;

        if (player.swing > 0) {
            spriteOffset = player.swing * 200;
        }

        context.globalAlpha = .5;

        context.drawImage(
            this.dropShadow.img,
            235, 555,
            133, 33
        );

        context.globalAlpha = 1;

        context.translate(220, 260);

        context.save();

        // define path to be used as the clipping mask
        context.beginPath();

        context.lineTo(200, 0);
        context.lineTo(200, 320);
        context.lineTo(0, 320);
        context.lineTo(0, 0);
        context.clip();

        context.drawImage(
            this.golfer.img,
            0, 0,
            1300, 160,
            0-spriteOffset, 0,
            2600, 320 /* mind the doubling of resolution. this sprite is scaled */
        );

        context.restore();

        context.translate(-220, -260);
    }
}
