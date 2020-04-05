export default class BitmapSlice {
	constructor(y, context, imageId) {
		this.y = y;
		this.context = context;
		this.imageId = imageId;

		this.fieldOfVision = 2500; // the higher this number, the less the 'banding' effect at the bottom of the screen, but the 'higher' the camera appears
		this.narrowNess = 1;
	}

	draw(cfg) {
        this.context.drawImage(
            this.imageId['img'],
            0, 0 - (this.fieldOfVision * (cfg.resolution / this.y)) - (cfg.offset % 2000) + 2200,
            800, cfg.resolution,
            400 - ((this.y * (cfg.resolution * 5)) * this.narrowNess), (100 * cfg.resolution) + (this.y * cfg.resolution),
            ((this.y * 10) * this.narrowNess) * cfg.resolution, cfg.resolution
        );
    }
}
