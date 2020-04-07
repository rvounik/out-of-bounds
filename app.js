// this allows access to context from imported modules, but its not exactly best practice. unsure if this should be used
// window.context = document.getElementById('canvas').getContext('2d');

import helpers from './helpers/index.js';
import Scenes from './constants/Scenes.js';
import BitmapSlice from './components/BitmapSlice.js';
import MiniMap from './components/MiniMap.js';
import Sky from './components/Sky.js';
import Title from './components/Title.js';
import Ball from './components/Ball.js';

// set some globals and configuration parameters
const context = document.getElementById('canvas').getContext('2d');

const bitmapSlices = []; // will contain the bitmap slices that make up the image projection
const resolution = 3; // how many pixels high should each bitmap slice be? (the lower, the more detail)
const projectionHeight = 300; // half of vertical resolution

// init the containers that will hold our instances
let miniMap, sky, title, ball;

// values that change should be kept in a local state
const state = {
    scene: Scenes.LOADING, // which scene is currently active
    musicPlaying: false, // whether music is playing
    loadingAsset: '', // the currently loading asset
    offset: 0 // image offset within each slice
};

/**
 * Holds all images used in the app
 * @param {string} id - id to refer to the image
 * @param {string} src - path to the image
 */
const images = [
    {
        id: 'ball',
        src: 'assets/ball.png'
    },
    {
        id: 'hole1',
        src: 'assets/hole1.jpg'
    },
    {
        id: 'sky',
        src: 'assets/sky.jpg'
    },
    {
        id: 'title',
        src: 'assets/title.png'
    }
];

/**
 * Attaches Image object to each image and sets its source
 */
images.map(image => {
    image.img = new Image();
    image['img'].src = image['src'];
});

/**
 * Holds all sounds used in the app
 * @param {string} id - id to refer to the image
 * @param {string} src - path to the image
 */
const sounds = [
    {
        id: 'title_music',
        src: 'assets/golf_short.wav'
    }
];

/**
 * Attaches Audio object to each sound and sets its source
 */
sounds.map(sound => {
    sound.audio = new Audio();
    sound.audio.preload = "auto"; // note this is inconsistently interpreted across browsers and devices
    sound.audio.src = sound.src;
});

/**
 * Checks to see if all assets are loaded
 * @returns {boolean} assetsLoaded
 */
function assetsLoaded() {
    for (let loadedSound = 0; loadedSound < sounds.length; loadedSound ++) {
        if (!sounds[loadedSound].audio || !sounds[loadedSound].audio.duration) {
            state.loadingAsset = sounds[loadedSound].src;
            return false;
        }
    }

    // since sounds are often partially loaded depending on browser, check for images last
    for (let loadedBitmap = 0; loadedBitmap < images.length; loadedBitmap ++) {
        if (!images[loadedBitmap] || images[loadedBitmap].img.naturalWidth <= 0) {
            state.loadingAsset = images[loadedBitmap].src;
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

/**
 * draw all instantiated bitmapSlices (this basically draws the 3d view)
 */
function drawBitmapSlices() {
    bitmapSlices.forEach(bitmapSlice => {
        bitmapSlice.draw({
            offset: state.offset,
            resolution
        });
	})
}

function loader() {
    helpers.Canvas.clearCanvas(context, '#000000');
    helpers.Type.positionedText({ context, text: "LOADING", y: 250 });
    helpers.Type.positionedText({ context, text: state.loadingAsset, y: 280, font: "12px Arial" });

    // show bouncing ball when image is loaded
    if (ball) { ball.draw() }

    // switch scene and call init
    if (assetsLoaded() && state.scene !== Scenes.TITLE) {
        init();
        state.scene = Scenes.TITLE;
    }
}

function update() {
    helpers.Canvas.clearCanvas(context);

    switch (state.scene) {
        case Scenes.LOADING:
            loader();
            break;
        case Scenes.TITLE:
            if (!state.musicPlaying) {
                state.musicPlaying = true;
                helpers.Sound.playSound(sounds.filter(soundObj => soundObj.id === 'title_music'), true);
            }
            sky.draw(); // this may be dropped from final version
            title.draw();
            context.globalAlpha = .25;
            state.offset+=3;
            drawBitmapSlices(); // this may be dropped from final version
            context.globalAlpha = 1;
            helpers.Type.positionedText({ context, text: "A game by rvo (c) 2020", x: 600, y: 180, font: "14px Arial" });
            helpers.Type.positionedText({ context, text: "START GAME", y: 380 });
            helpers.Type.positionedText({ context, text: "OPTIONS", y: 440 });
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

// init ball graphic outside of image creation loop so it can be used in the loader
const ballImage = new Image();
ballImage.onload = () => { ball = new Ball(context, ballImage) };
ballImage.src = 'assets/ball.png';

update();
