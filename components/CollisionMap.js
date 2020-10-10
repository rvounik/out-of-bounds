export default class CollisionMap {
    constructor(context, collisionMap) {
        this.context = context;
        this.collisionMap = collisionMap;
        this.draw = this.draw.bind(this);
    }

    checkHit(baseCollisionMap, player, mapDimensions) {
        const divisionW = mapDimensions.img.width / baseCollisionMap.width;
        const divisionH = mapDimensions.img.height / baseCollisionMap.height;
        const context = this.context;

        // draw white rectangle (to overlay previously drawn collision map)
        context.fillStyle = "#17411D";
        context.fillRect(
            baseCollisionMap.x,
            baseCollisionMap.y,
            baseCollisionMap.width,
            baseCollisionMap.height
        );

        // draw self (black transparent mask)
        this.draw(baseCollisionMap);

        // get colour values for player x, y coordinates
        const imageData = context.getImageData(
            baseCollisionMap.x - ((player.x - 400) / divisionW),
            baseCollisionMap.y - ((player.y - 300) / divisionH),
            1,
            1
        );
        const r = imageData.data[0];
        const g = imageData.data[1];
        const b = imageData.data[2];

        // there is a positive hit test with this collision map (black colour detected)
        return (r === 0 && g === 0 && b === 0);
    }

    draw(collisionMap) {
        this.context.drawImage(
            this.collisionMap.img,
            collisionMap.x, collisionMap.y,
            collisionMap.width, collisionMap.height
        );
    }
}
