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
            0, (this.y * resolution) - offset + 300,
            800, resolution,
            400 - (this.y * 3 * 3), 300 + (this.y * resolution),
            this.y * 3 * 3 * resolution, resolution
        );
    }
}
