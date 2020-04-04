export default class BitmapSlice {
	constructor(y, context, imageId) {
		this.y = y;
		this.context = context;
		this.imageId = imageId;

		this.fieldOfVision = 2500; // the higher this number, the less the 'banding' effect at the bottom of the screen, but the 'higher' the camera appears
		this.narrowNess = 1;
	}

	draw(offset, resolution) {
        this.context.drawImage(
            this.imageId['img'],
            0, 0 - (this.fieldOfVision * (resolution / this.y)) - (offset % 2000) + 2200,
            800, resolution,
            400 - ((this.y * (resolution * 5)) * this.narrowNess), (100 * resolution) + (this.y * resolution),
            ((this.y * 10) * this.narrowNess) * resolution, resolution
        );
    }
}
