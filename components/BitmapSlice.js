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
            0, (this.y * .96 * 10) - offset + 300,
            960, 10,
            200 - (this.y * 5), 300 + (this.y * .96 * 10),
            200 + (this.y * 10), 10
        );
    }
}
