export default class CollisionMap {
    constructor(context, collisionMap) {
        this.context = context;
        this.collisionMap = collisionMap;
    }

    draw() {

        // set some constants for the dimensions and position of the collision map (these should be drawn at the same spot as the miniMap so should probably come in from app.js)
        const miniMapProjectionWidth = 160;
        const miniMapProjectionHeight = 300;
        const miniMapProjectionStartX = 665;
        const miniMapProjectionStartY = 300;

        this.context.drawImage(
            this.collisionMap.img,
            miniMapProjectionStartX, miniMapProjectionStartY,
            miniMapProjectionWidth, miniMapProjectionHeight
        );
    }
}
