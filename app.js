import BitmapSlice from './components/BitmapSlice.js';
import MiniMap from './components/MiniMap.js';
import Scenes from './constants/Scenes.js';

import Sky from './components/Sky.js';
import Title from './components/Title.js';
import Ball from './components/Ball.js';

// set some globals and configuration parameters
const context = document.getElementById('canvas').getContext('2d');
const bitmapSlices = []; // will contain the bitmap slices that make up the image projection
const resolution = 3; // how many pixels high should each bitmap slice be? (the lower, the more detail)
const projectionHeight = 300; // half of 800x600
let offset = 0; // initial value of image offset within each slice

// init the containers that will hold our instances
let miniMap, sky, title, ball;

const state = {
    scene: Scenes.LOADING
};

/**
 * Holds all images used in the app
 * @param {string} id - id to refer to the image
 * @param {string} src - path to the image
 * @param {Object} img - the image object created after initialisation
 */
const images = [
    {
        id: 'ball',
        src: 'assets/ball.png',
        img: new Image()
    },
    {
        id: 'hole1',
        src: 'assets/hole1.jpg',
        img: new Image()
    },
    {
        id: 'sky',
        src: 'assets/sky.jpg',
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
        if (!images[loadedBitmap] || images[loadedBitmap].img.naturalWidth <= 0) {
	        return false;
        }
    }

    return true;
}

/**
 * instantiate instances from the BitmapSlice class, handing over position, dimension, resolution drawing context
 * and the Image object with the right id
 */
function init() {
	for (let y = 0; y <= (projectionHeight / resolution); y ++) {
	    bitmapSlices.push(new BitmapSlice(
	        y,
	    	context,
	    	images.filter(img => img.id === 'hole1')[0])
	    );
	}

	miniMap = new MiniMap(context, images.filter(img => img.id === 'hole1')[0]);
	sky = new Sky(context, images.filter(img => img.id === 'sky')[0]);
	title = new Title(context, images.filter(img => img.id === 'title')[0]);
}

function drawBitmapSlices() {

    const cfg = {
        offset: offset+=3,
        resolution
    };

	// draw all instantiated bitmapSlices
	bitmapSlices.forEach(bitmapSlice => {
        bitmapSlice.draw(cfg);
	})
}

function loader() {

    clearCanvas('#000000');
    context.font = "30px Arial";
    context.fillStyle='#ffffff';
    context.fillText("LOADING", (800 / 2) - (context.measureText("LOADING").width / 2), 250);

    // show bouncing ball when image is loaded
    if (ball) {
        ball.draw();
    }

    if (assetsLoaded()) {
        if (!bitmapSlices.length) {
            init(); // fill array with slices once
        } else {
            state.scene = Scenes.TITLE; // switch to title
        }
    }
}

function clearCanvas(color = '#17411D') {
	context.fillStyle = color;
	context.fillRect(0, 0, 800, 600);
}

function update() {
    clearCanvas();

    drawBitmapSlices();

    switch (state.scene) {
        case Scenes.LOADING:
            loader();
            break;
        case Scenes.TITLE:
            clearCanvas();
            sky.draw(); // this may be dropped from final version
            title.draw();
            context.font = "14px Arial";
            context.globalAlpha = .3;
            drawBitmapSlices(); // this may be dropped from final version
            context.globalAlpha = 1;
            context.fillStyle='#ffffff';
            context.fillText("A game by rvo (c) 2020", 600, 180);
            context.font = "30px Arial";
            context.fillText("START GAME", (800 / 2) - (context.measureText("START GAME").width / 2), 440);
            context.fillText("OPTIONS", (800 / 2) - (context.measureText("OPTIONS").width / 2), 490);
            break;
        case Scenes.GAME:
            drawBitmapSlices();
            miniMap.draw();
            break;
        default:
            break;
    }

    requestAnimationFrame(() => { update(); });
}

// init ball graphic outside of image creation loop so it shows in the loader
let ballImage = new Image();
ballImage.onload = () => { ball = new Ball(context, ballImage) };
ballImage.src = 'assets/ball.png';

update();
