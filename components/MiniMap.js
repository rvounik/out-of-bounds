export default class MiniMap {
    constructor(context, imageId) {
        this.context = context;
        this.imageId = imageId;
    }

    draw(player, miniMap, x, y) {
        const context = this.context;

        // now calculate how much smaller the miniMap is projected when compared to the original image (this keeps it dynamic)
        const divisionW = this.imageId.img.width / miniMap.width;
        const divisionH = this.imageId.img.height / miniMap.height;

        // render a small rectangle representing the ball at the normalised coordinates starting from the offsets previously defined
        // todo: this should render a line instead, with angle utilised to set its rotation
        context.fillStyle = "#ffffff";
        context.fillRect(
            x - 2.5 - ((player.x - 400) / divisionW),
            y - 2.5 - ((player.y - 300) / divisionH),
            5,
            5
        );

        // miniMap is partially transparent
        context.globalAlpha = .75;

        // draw the bitmap
        context.drawImage(
            this.imageId.img,
            x, y,
            miniMap.width, miniMap.height
        );

        // reset the alpha
        context.globalAlpha = 1;
    }
}
