export default class BitmapSlice {
	constructor(y, context, imageId) {
		this.y = y;
		this.context = context;
		this.imageId = imageId;
	}

	draw(cfg) {

        // resolution 1: 7500, 1.5
        // resolution 3: 2500, 1.5

        this.fieldOfVision = 7500 / cfg.resolution; // the higher this number, the less the 'banding' effect at the bottom of the screen, but the 'higher' the camera appears
        this.narrowNess = 2.5 / (cfg.resolution / 1.2);

	    if (cfg.offset) {

	        // this is just for the title screen
            this.context.drawImage(
                this.imageId['img'],
                0, -400 + (this.fieldOfVision * (cfg.resolution / this.y)) - (0 - (cfg.offset / .75) % 2000),
                800, cfg.resolution,
                400 - ((this.y * (cfg.resolution * 5)) * this.narrowNess), ((300/cfg.resolution) * cfg.resolution) + (this.y * cfg.resolution),
                ((this.y * 10) * this.narrowNess) * cfg.resolution, cfg.resolution
            );
        } else {

            this.context.drawImage(
                this.imageId['img'],
                0, 0 - (this.fieldOfVision * (cfg.resolution / this.y)) - (-100 - (cfg.player.y / .75) % 2000),
                800, cfg.resolution,
                400 - ((this.y * (cfg.resolution * 5)) * this.narrowNess), ((300/cfg.resolution) * cfg.resolution) + (this.y * cfg.resolution),
                ((this.y * 10) * this.narrowNess) * cfg.resolution, cfg.resolution
            );
        }
    }
}
