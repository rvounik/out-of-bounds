import BitmapSlice from './components/BitmapSlice.js';
import MiniMap from './components/MiniMap.js';

// todo: make this a generic image loader with x,y as props
import Sky from './components/Sky.js';
import Title from './components/Title.js';

// set some globals and configuration parameters
const context = document.getElementById('canvas').getContext('2d');
const bitmapSlices = []; // will contain the bitmap slices that make up the image projection
const resolution = 3; // how many pixels high should each bitmap slice be? (the lower, the more detail)
const projectionHeight = 300; // half of 800x600
let offset = 0; // initial value of image offset within each slice

// init the containers that will hold our instances
let miniMap, sky, title

/**
 * Holds all images used in the app
 * @param {string} id - id to refer to the image
 * @param {string} src - path to the image
 * @param {Object} img - the image object created after initialisation
 */
const images = [
    {
        id: 'texture',
        src: 'assets/hole1.jpg',
        img: new Image()
    },
    {
        id: 'sky',
        src: 'assets/sky2.jpg',
        img: new Image()
    },
    {
        id: 'title',
        src: 'assets/title.png',
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
	        y,
	    	context,
	    	images.filter(img => img.id === 'texture')[0])
	    );
	}

	miniMap = new MiniMap(context, images.filter(img => img.id === 'texture')[0]);
	sky = new Sky(context, images.filter(img => img.id === 'sky')[0]);
	title = new Title(context, images.filter(img => img.id === 'title')[0]);
}

function drawBitmapSlices() {

    // give it an interesting offset
    offset += 3;

	// draw all instantiated bitmapSlices
	bitmapSlices.forEach(bitmapSlice => {
        bitmapSlice.draw(offset, resolution);
	})
}

function clearCanvas() {
	context.fillStyle = '#17411D';
	context.fillRect(0, 0, 800, 600);
}

function update() {
	if (assetsLoaded()) {
		if (!bitmapSlices.length) {
			init();
		}

        clearCanvas();
		sky.draw();
		title.draw();
        context.font = "14px Arial";

        drawBitmapSlices();

        context.fillStyle='#ffffff';
        context.fillText("A game by rvo (c) 2020", 600, 180);
        context.font = "30px Arial";
        context.fillText("START GAME", 300, 380);
        context.fillText("OPTIONS", 330, 430);

        miniMap.draw();
	}

    requestAnimationFrame(() => { update(); });
}

update();
