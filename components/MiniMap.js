export default class MiniMap {
    constructor(context, imageId) {
        this.context = context;
        this.imageId = imageId;
    }

    draw(player) {

        // set some constants for the dimensions and position of the miniMap
        const miniMapProjectionWidth = 160;
        const miniMapProjectionHeight = 300;
        const miniMapProjectionStartX = 665;
        const miniMapProjectionStartY = 300;

        // now calculate how much smaller the miniMap is projected when compared to the original image (this keeps it dynamic)
        const division = this.imageId['img'].naturalWidth / miniMapProjectionWidth;

        // render a small rectangle representing the player at the normalised coordinates starting from the offsets previously defined
        this.context.fillStyle = "#ff0000";
        this.context.fillRect(miniMapProjectionStartX + (player.x / division), miniMapProjectionStartY + (player.y / division), 5, 5);

        this.context.globalAlpha = .75;

        this.context.drawImage(
            this.imageId['img'],
            miniMapProjectionStartX, miniMapProjectionStartY,
            miniMapProjectionWidth, miniMapProjectionHeight
        );

        // reset the alpha
        this.context.globalAlpha = 1;
    }
}
