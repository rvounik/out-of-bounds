export default class BitmapSlice {
	constructor(y, context, imageId) {
		this.y = y;
		this.context = context;
		this.imageId = imageId;
	}

    /**
     * Renders a slice of the projection
     * @param {object} cfg - the configuration object
     * @param {object} cfg.offset - the offset of the projection, used on the title screen
     * @param {object} cfg.resolution - the resolution used in the game, determines the height of each slice in pixels
     * @param {object} cfg.player - the player object containing location and dimensions
     * @param {object} cfg.player.x - the x value of the player
     * @param {object} cfg.player.y - the y value of the player
     * @param {object} cfg.player.rotation - the rotation of the player
     */
	draw(cfg) {
        const fieldOfVision = 7500 / cfg.resolution; // the higher this number, the less the 'banding' effect at the bottom of the screen, but the 'higher' the camera appears
        const narrowness = 2.5 / (cfg.resolution / 1.2); // this determines how narrow the view is. if set wider, the distancing effect becomes affected, so it needs balancing
        const projectionWidth = 800;
        const projectionHeight = 600;

        const context = this.context;

	    if (cfg.offset) {

	        // this is just for the title screen
            context.drawImage(
                this.imageId['img'],
                0, -400 + (fieldOfVision * (cfg.resolution / this.y)) - (0 - (cfg.offset / .75) % 2000),
                projectionWidth, cfg.resolution,
                cfg.player.x - ((this.y * (cfg.resolution * 5)) * narrowness), (((projectionHeight / 2) / cfg.resolution) * cfg.resolution) + (this.y * cfg.resolution),
                ((this.y * 10) * narrowness) * cfg.resolution, cfg.resolution
            );
        } else {
	        context.save();

            context.translate(cfg.player.x - ((this.y * 5) * narrowness), (((projectionHeight / 2) / cfg.resolution) * cfg.resolution) + (this.y * cfg.resolution))

            context.drawImage(
                this.imageId['img'],
                0, 0 - (fieldOfVision * (cfg.resolution / this.y)) - (-100 - (cfg.player.y / .75) % 2000),
                projectionWidth, cfg.resolution,
                0,0,
                ((this.y * 10) * narrowness) * cfg.resolution, cfg.resolution
            );

            context.restore();

        }
    }
}
