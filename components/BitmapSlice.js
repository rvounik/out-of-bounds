export default class BitmapSlice {
	constructor(x, y, w, h, context, imageId) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.context = context;
		this.imageId = imageId;
	}

	draw(offset, resolution) {
		const context = this.context;

        context.drawImage(
            this.imageId['img'],
            0, 0 - (1000 * (resolution / this.y)) - (offset % 300) + 600,
            800, resolution,
            400 - ((this.y * 10) * 3), 300 + (this.y * resolution),
            ((this.y * 10) * 3) * resolution, resolution
        );
    }
}
