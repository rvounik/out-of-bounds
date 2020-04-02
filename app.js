import BitmapSlice from './components/BitmapSlice.js';

// set some globals and configuration parameters
const context = document.getElementById('canvas').getContext('2d');
const bitmapSlices = []; // will contain the bitmap slices that make up the image projection
const resolution = 10; // how many pixels high should each bitmap slice be? (the lower, the more detail)
const projectionHeight = 300; // half of 800x600
let offset = 0; // initial value of image offset within each slice

/**
 * Holds all images used in the app
 * @param {string} id - id to refer to the image
 * @param {string} src - path to the image
 * @param {Object} img - the image object created after initialisation
 */
const images = [
    {
        id: 'texture',
        src: 'assets/texture.jpg',
        img: new Image()
    }
];

/**
 * Loads image asset to each image object inside images
 */
images.map(image => {
   image['img'].src = image['src']
});

/**
 * Checks to see if all image assets are loading by checking the dimensions of the loaded bitmap
 * @returns {boolean} assetsLoaded
 */
function assetsLoaded() {
    for (let loadedBitmap = 0; loadedBitmap < images.length; loadedBitmap ++) {
        if (!images[loadedBitmap] || images[loadedBitmap].img.naturalWidth < 0) {
	        return false;
        }
    }

    return true;
}

/**
 * instantiate instances from the BitmapSlice class, handing over position, dimension, resolution drawing context
 * and the Image object with the id 'texture'
 */
function init() {
	for (let y = 0; y <= (projectionHeight / resolution); y ++) {
	    bitmapSlices.push(new BitmapSlice(
	    	0, y,
	    	800, resolution,
	    	context,
	    	images.filter(img => img.id === 'texture')[0])
	    );
	}
}

function drawBitmapSlices() {

    // give it an interesting offset
    offset += 0.5;

	// draw all instantiated bitmapSlices
	bitmapSlices.forEach(bitmapSlice => {
        bitmapSlice.draw(offset, resolution);
	})
}

function clearCanvas() {
	context.fillStyle = '#8888dd';
	context.fillRect(0, 0, 800, 600);
}

function update() {
	if (assetsLoaded()) {
		if (!bitmapSlices.length) {
			init();
		}

        clearCanvas();
        drawBitmapSlices();
	}

    requestAnimationFrame(() => { update(); });
}

update();
