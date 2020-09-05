import SurfaceTypes from './../constants/SurfaceTypes.js';

export default class MiniMap {
    constructor(context, imageId, collisionMaps) {
        this.context = context;
        this.imageId = imageId;
        this.collisionMaps = collisionMaps;
    }

    checkCollisions(player, miniMap) {
        let surface = SurfaceTypes.FAIRWAY;

        // now calculate how much smaller the miniMap is projected when compared to the original image (this keeps it dynamic)
        const divisionW = this.imageId.img.width / miniMap.w;
        const divisionH = this.imageId.img.height / miniMap.h;

        Object.keys(this.collisionMaps).map(mapId => {

            // only check for configured surfaces in Surfaces (do not check for out-of-bounds here, since ball lie cant handle this and it should be done mid-flight anyway)
            if (Object.keys(SurfaceTypes).includes(mapId) ) {

                // draw white rectangle
                this.context.fillStyle = "#17411D";
                this.context.fillRect(
                    miniMap.x,
                    miniMap.y,
                    miniMap.w,
                    miniMap.h
                );

                // draw currently handled collision map
                this.collisionMaps[mapId].draw();

                // get colour values for player x, y
                const imageData = this.context.getImageData(
                    miniMap.x - ((player.x - 400) / divisionW),
                    miniMap.y - ((player.y - 300) / divisionH),
                    1,
                    1);
                const r = imageData.data[0];
                const g = imageData.data[1];
                const b = imageData.data[2];

                // there is a positive hit test with this collision map (black colour detected)
                if (r === 0 && g === 0 && b === 0) {
                    surface = SurfaceTypes[mapId]
                }
            }
        });

        // return the detected surface or fall back to the default
        return surface;
    }

    draw(player, miniMap) {

        // now calculate how much smaller the miniMap is projected when compared to the original image (this keeps it dynamic)
        const divisionW = this.imageId.img.width / miniMap.w;
        const divisionH = this.imageId.img.height / miniMap.h;

        // render a small rectangle representing the ball at the normalised coordinates starting from the offsets previously defined
        // todo: ofcourse this should render a line instead, with angle utilised to set its rotation
        this.context.fillStyle = "#ffffff";
        this.context.fillRect(
            miniMap.x - 2.5 - ((player.x - 400) / divisionW),
            miniMap.y - 2.5 - ((player.y - 300) / divisionH),
            5,
            5
        );

        // miniMap is partially transparent
        this.context.globalAlpha = .75;

        // draw the bitmap
        this.context.drawImage(
            this.imageId.img,
            miniMap.x, miniMap.y,
            miniMap.w, miniMap.h
        );

        // reset the alpha
        this.context.globalAlpha = 1;
    }
}
