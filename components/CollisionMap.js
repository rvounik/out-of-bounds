export default class CollisionMap {
    constructor(context, imageId) {
        this.context = context;
        this.imageId = imageId;
    }

    draw() {

        // set some constants for the dimensions and position of the collision map (these should be drawn at the same spot as the miniMap)
        const miniMapProjectionWidth = 160;
        const miniMapProjectionHeight = 300;
        const miniMapProjectionStartX = 665;
        const miniMapProjectionStartY = 300;

        this.context.drawImage(
            this.imageId['img'],
            miniMapProjectionStartX, miniMapProjectionStartY,
            miniMapProjectionWidth, miniMapProjectionHeight
        );
    }
}
