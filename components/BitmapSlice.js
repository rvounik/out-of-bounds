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
            0, (this.y * .95 * resolution) - offset + 300,
            960, 10,
            300 - (this.y * 5), 300 + (this.y * .95 * resolution),
            200 + (this.y * resolution), resolution
        );
    }
}
