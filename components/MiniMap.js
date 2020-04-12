import SurfaceTypes from './../constants/SurfaceTypes.js';

export default class MiniMap {
    constructor(context, imageId, collisionMaps) {
        this.context = context;
        this.imageId = imageId;
        this.collisionMaps = collisionMaps;

        // set some constants for the dimensions and position of the miniMap
        this.miniMapProjectionWidth = 160;
        this.miniMapProjectionHeight = 300;
        this.miniMapProjectionStartX = 665;
        this.miniMapProjectionStartY = 300;

        // now calculate how much smaller the miniMap is projected when compared to the original image (this keeps it dynamic)
        this.division = this.imageId.img.naturalWidth / this.miniMapProjectionWidth;
    }

    checkCollisions(player) {

        let surface = SurfaceTypes.FAIRWAY;

        Object.keys(this.collisionMaps).map(mapId => {

            // only check for configured surfaces in Surfaces (do not check for out-of-bounds here, since ball lie cant handle this and it should be done mid-flight anyway)
            if (Object.keys(SurfaceTypes).includes(mapId) ) {

                // draw white rectangle
                this.context.fillStyle = "#17411D";
                this.context.fillRect(this.miniMapProjectionStartX, this.miniMapProjectionStartY, this.miniMapProjectionWidth, this.miniMapProjectionHeight);

                // draw currently handled collision map
                this.collisionMaps[mapId].draw();

                // get colour values for player x, y
                const imageData = this.context.getImageData(this.miniMapProjectionStartX + (player.x / this.division), this.miniMapProjectionStartY + (player.y / this.division), 1, 1);
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

    draw(player) {

        // render a small rectangle representing the ball at the normalised coordinates starting from the offsets previously defined
        this.context.fillStyle = "#ffffff";
        this.context.fillRect(this.miniMapProjectionStartX + (player.x / this.division), this.miniMapProjectionStartY + (player.y / this.division), 5, 5);

        this.context.globalAlpha = .75;

        this.context.drawImage(
            this.imageId.img,
            this.miniMapProjectionStartX, this.miniMapProjectionStartY,
            this.miniMapProjectionWidth, this.miniMapProjectionHeight
        );

        // reset the alpha
        this.context.globalAlpha = 1;
    }
}
