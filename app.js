import helpers from './helpers/index.js';
import Scenes from './constants/Scenes.js';
import Skies from './constants/Skies.js';

import Ball from './components/Ball.js';
import BitmapSlice from './components/BitmapSlice.js';
import MiniMap from './components/MiniMap.js';
import Sky from './components/Sky.js';
import Title from './components/Title.js';
import Golfer from './components/Golfer.js';
import Pointer from './components/Pointer.js';
import Surface from './components/Surface.js';
import CollisionMap from './components/CollisionMap.js';

// set some globals and configuration parameters
const context = document.getElementById('canvas').getContext('2d');
const bitmapSlices = []; // will contain the bitmap slices that make up the image projection
const resolution = 1; // how many pixels high should each bitmap slice be? (the lower, the more detail)
const projectionHeight = 300; // half of vertical resolution

// init the containers that will hold the instances
let ball, surface, miniMap, sky, title, golfer, pointer;
let collisionMaps = {};

// define starting position relative to the 'hole1' map (this normally differs between maps, but there is only one here)
const holeOneStartX = 400;
const holeOneStartY = 550; // the bottom of the map is 1400;

// values that change are kept in a local state
const state = {
    scene: Scenes.LOADING, // which scene is currently active
    musicPlaying: false, // whether music is playing
    loadingAsset: '', // the currently preloading asset
    offset: 0, // image offset within each slice
    player: {
        x: holeOneStartX,
        y: holeOneStartY,
        rotation: 0
    },
    clickableContexts: [],
    mouseX : null,
    mouseY: null
};

/**
 * Holds all images used in the game
 * @param {string} id - id to refer to the image
 * @param {string} src - path to the image
 */
const images = [
    {
        id: 'ball',
        src: 'assets/ball.png'
    },
    {
        id: 'ball_lie',
        src: 'assets/ball_lie.png'
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
        id: 'sky_gradient',
        src: 'assets/sky_gradient.png'
    },
    {
        id: 'sky_blue',
        src: 'assets/sky_blue.png'
    },
    {
        id: 'title',
        src: 'assets/title.png'
    },
    {
        id: 'golfer',
        src: 'assets/golfer.png'
    },
    {
        id: 'dropshadow',
        src: 'assets/dropshadow.png'
    },
    {
        id: 'pointer',
        src: 'assets/pointer.png'
    },
    {
        id: 'arrow',
        src: 'assets/arrow.png'
    },
    {
        id: 'collision_map_mid_rough',
        src: 'assets/collision_map_mid_rough.png'
    },
    {
        id: 'collision_map_rough',
        src: 'assets/collision_map_rough.png'
    },
    {
        id: 'collision_map_sand',
        src: 'assets/collision_map_sand.png'
    },
    {
        id: 'collision_map_out',
        src: 'assets/collision_map_out.png'
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
const assetsLoaded = () => {
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
};

/**
 * Initialises the engine
 */
const init = () => {

    // fill up bitmapSlices with BitmapSlice instances providing position, dimension, resolution, context and Image
	for (let y = 0; y <= (projectionHeight / resolution); y ++) {
	    bitmapSlices.push(new BitmapSlice(
	        y,
	    	context,
	    	images.filter(img => img.id === 'hole1')[0])
	    );
	}

    collisionMaps = {
        MID: new CollisionMap(context, images.filter(img => img.id === 'collision_map_mid_rough')[0]),
        ROUGH: new CollisionMap(context, images.filter(img => img.id === 'collision_map_rough')[0]),
        SAND: new CollisionMap(context, images.filter(img => img.id === 'collision_map_sand')[0]),
        OUT: new CollisionMap(context, images.filter(img => img.id === 'collision_map_out')[0])
    };

	// construct class objects used throughout the various scenes
	miniMap = new MiniMap(context, images.filter(img => img.id === 'hole1')[0], collisionMaps);
	sky = new Sky(context, {
        'blue': images.filter(img => img.id === 'sky_blue')[0],
        'evening': images.filter(img => img.id === 'sky')[0],
        'gradient': images.filter(img => img.id === 'sky_gradient')[0]
    });
	title = new Title(context, images.filter(img => img.id === 'title')[0]);
	golfer = new Golfer(context, images.filter(img => img.id === 'golfer')[0], images.filter(img => img.id === 'dropshadow')[0]);
	pointer = new Pointer(context, images.filter(img => img.id === 'pointer')[0], images.filter(img => img.id === 'arrow')[0]);
	surface = new Surface(context, images.filter(img => img.id === 'ball_lie')[0]);


	// register global event listeners
    window.addEventListener('click', clickHandler);
};

/**
 * Draw all instantiated bitmapSlices (this basically draws the 3d view)
 *  * @param {number} offset - offset for the image in the slices (optional, will simulate animation)
 */
const drawBitmapSlices = (offset = 0) => {
    bitmapSlices.forEach(bitmapSlice => {
        bitmapSlice.draw({
            offset,
            resolution,
            player: state.player,
            holeOneStartX,
            holeOneStartY
        });
	})
};

/**
 * Checks if there is a context provided matching the clicked mouse coordinates, then executes its action
 */
const clickHandler = () => {
    let mouseX = (event.clientX - document.getElementById("canvas").offsetLeft);
    let mouseY = (event.clientY - document.getElementById("canvas").offsetTop);

    if (mouseX < 0 || mouseX > 800 || mouseY < 0 || mouseY > 600) {
        return false;
    } else {
        state.mouseX = mouseX;
        state.mouseY = mouseY;
        state.clickableContexts.map((clickableContext) => {
            if (mouseX > clickableContext.x
                && mouseX < clickableContext.x + clickableContext.width
                && mouseY > clickableContext.y
                && mouseY < clickableContext.y + clickableContext.height
            ) { clickableContext.action() }
        });
    }
};

/**
 * Ensure all assets are loaded (displaying which one is currently handled) before moving to the Title scene
 */
function loader() {
    helpers.Canvas.clearCanvas(context);
    helpers.Type.positionedText({ context, text: "LOADING", y: 250 });
    helpers.Type.positionedText({ context, text: state.loadingAsset, y: 280, font: "12px Arial" });

    // show bouncing ball animation if available
    if (ball) { ball.draw() }

    // switch scene and call init
    if (assetsLoaded() && state.scene !== Scenes.TITLE) {
        init();
        switchScene(Scenes.TITLE);
    }
}

/**
 * Clean up and switch state to the requested scene
 */
const switchScene = scene => {
    state.clickableContexts = [];
    state.scene = scene;
};

// todo: temp function with static values, just to simplify the current maths. REMOVE FROM FINAL
const setPlayerPosition = () => {
    const division = 5;
    state.player.x = ((state.mouseX - 685) * division);
    state.player.y = ((state.mouseY - 320) * division);
};

/**
 * Perform all timely actions required for the current scene
 */
const update = () => {
    helpers.Canvas.clearCanvas(context, "#17411D");

    switch (state.scene) {
        case Scenes.LOADING:
            loader();
            break;
        case Scenes.TITLE:
            if (!state.musicPlaying) {
                state.musicPlaying = true;
                helpers.Sound.playSound(sounds.filter(soundObj => soundObj.id === 'title_music'), true);
            }
            sky.draw(Skies.EVENING);
            title.draw();
            context.globalAlpha = .25;
            drawBitmapSlices(state.offset+=3);
            context.globalAlpha = 1;
            helpers.Type.positionedText({ context, font: "14px Arial", text: "A game by rvo (c) 2020", x: 600, y: 180 });
            helpers.Canvas.clickableContext(state.clickableContexts, 'gotoHomepage',580,160,180, 30, () => { window.open('http://www.github.com/rvounik') });
            helpers.Type.positionedText({ context, text: "START GAME", y: 380 });
            helpers.Canvas.clickableContext(state.clickableContexts, 'startGame',300,365,240, 40, () => { switchScene(Scenes.GAME) });
            helpers.Type.positionedText({ context, text: "OPTIONS", y: 440 });
            break;
        case Scenes.GAME:
            sky.draw(Skies.BLUE);
            drawBitmapSlices();
            pointer.draw();
            golfer.draw();

            // these 2 method calls should only be done once after taking a shot
            surface.draw(miniMap.checkCollisions(state.player));
            miniMap.draw(state.player);

            // debug: be able to click a point on the minimap to see its projection (without rotation for now)
            helpers.Canvas.clickableContext(state.clickableContexts, 'setPlayerPosition',665,300,160, 300, () => { setPlayerPosition() });

            // todo: move to helper function
            helpers.Type.positionedText({ context, font: "18px Teko", text: "STROKE", color: "#aa0000", x: 15, y: 30 });
            helpers.Type.positionedText({ context, font: "70px Teko", text: "12", color: "#ffffff", x: 15, y: 80 });
            helpers.Type.positionedText({ context, font: "18px Teko", text: "PAR", color: "#aa0000", x: 755, y: 30 });
            helpers.Type.positionedText({ context, font: "70px Teko", text: "4", color: "#ffffff", x: 745, y: 80 });

            state.player.rotation += 1;
            if (state.player.rotation > 360) { state.player.rotation = 0 }

            // for now move the player on the miniMap so we can align the projection todo: remove from final
            // state.player.y -= 2;
            if (state.player.y < 0) { state.player.y = 1400 }
            break;
        default:
            break;
    }

    helpers.Canvas.rasterLines(context);

    requestAnimationFrame(() => { update(); });
};

// init ball graphic outside of image creation loop so it can be used in the loader
const ballImage = new Image();
ballImage.onload = () => { ball = new Ball(context, ballImage) };
ballImage.src = 'assets/ball.png';

// call the updater
update();
