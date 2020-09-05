export default class BitmapSlice {
	constructor(context, imageId) {
		this.context = context;
		this.imageId = imageId;
	}

    /**
     * Renders a slice of the pseudo-3d projection
     * @param {Object} cfg - the configuration object
     * @param {number} cfg.startScale - initial value of the scale, this affects how far away the view appears
     * @param {number} cfg.scaleAmplitude - the amplitude of the scale, as determined by index
     * @param {Object} cfg.dimensions - the dimensions object
     * @param {number} cfg.dimensions.startX - start x (usually zero)
     * @param {number} cfg.dimensions.endX - start x (usually the full width is used)
     * @param {number} cfg.dimensions.startY - start y (it starts halfway)
     * @param {number} cfg.dimensions.endY - end y (usually bottom of the screen)
     * @param {number} cfg.pixelsPerSlice - height of each slice in pixels. the lower ths number, the more defined the view is rendered
     * @param {Object} cfg.pivotPoint - the coordinates of the rotation point. this is canvas-based so usually the bottom middle of the screen,
     * @param {number} cfg.pivotPoint.x - the coordinates of the rotation point. this is canvas-based so usually the bottom middle of the screen,
     * @param {number} cfg.pivotPoint.y - the coordinates of the rotation point. this is canvas-based so usually the bottom middle of the screen,
     * @param {Object} player - the player object
     * @param {number} player.x - the x position of the player
     * @param {number} player.y - the y position of the player
     * @param {number} player.angle - the rotation of the player
     * @param {number} index - the index
     */
    draw(cfg, player, index) {
        const context = this.context;

        const { startScale, scaleAmplitude, pixelsPerSlice, pivotPoint } = cfg;
        const { startX, endX, startY, endY } = cfg.dimensions;

        context.save();

        // define path to be used as the clipping mask
        context.beginPath();
        context.translate(startX, startY + (index * pixelsPerSlice)); // the clipping rectangle needs to keep moving 'down', so index is utilised here
        context.lineTo(endX, 0);
        context.lineTo(endX, pixelsPerSlice);
        context.lineTo(startX, pixelsPerSlice);
        context.lineTo(startX, 0);
        context.clip();

        // reset translation used to draw clipping mask: the image rendered 'inside' should not be affected by it
        context.translate(-0, -pixelsPerSlice);

        context.translate(pivotPoint.x, pivotPoint.y - index); // by subtracting the index, the rotation point is visually fixed on screen

        // scale the canvas: the 'lower' the clip is positioned, the more it should zoom in to simulate depth (with scaleAmplitude to enhance the effect)
        // old: startScale + (scaleAmplitude * (index * player.height)),
        context.scale(
            startScale + (scaleAmplitude * index),
            startScale + (scaleAmplitude * index)
        );

        // rotate canvas to match player angle
        context.rotate(player.angle * Math.PI / 180);

        // move canvas to match player x, y
        context.translate(player.x, player.y);

        // reset center point translation (note that it retains the offset applied when setting the center point. this way the image is visually moved inside)
        context.translate(-pivotPoint.x, -pivotPoint.y);

        // note that not much is used of the drawing API since the canvas is manipulated instead
        context.drawImage(
            this.imageId['img'],
            0, 0
        );

        context.restore();
    }
}
