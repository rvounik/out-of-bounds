// helpers
import helpers from './helpers/index.js';

// constants
import Scenes from './constants/Scenes.js';
import Skies from './constants/Skies.js';

// components
import Ball from './components/Ball.js';
import BitmapSlice from './components/BitmapSlice.js';
import MiniMap from './components/MiniMap.js';
import Sky from './components/Sky.js';
import Title from './components/Title.js';
import Golfer from './components/Golfer.js';
import Pointers from './components/Pointers.js';
import Surface from './components/Surface.js';
import CollisionMap from './components/CollisionMap.js';
import Statistics from './components/Statistics.js';
import InGameText from './components/InGameText.js';

// globals
const context = document.getElementById('canvas').getContext('2d');

// init containers that hold the image instances as globals so they can be used everywhere
let ball, surface, miniMap, sky, title, golfer, pointers, statistics, inGameText;
let collisionMaps = {};

// init timers
let swingTimer;

// init specific vars that dont really belong to the runtime state
let titleStartGameFontSize = 30;
let titleOptionsFontSize = 30;
const flightSteps = 100; // amount of steps to take to reach end of ball flight (speed of animation)
let flightOffset = flightSteps;

// dynamic values are kept in local state
const state = {
    scene: Scenes.LOADING, // which scene is currently active
    musicPlaying: false, // whether music is playing
    loadingAsset: '', // the currently preloading asset
    startScale: .5, // determines the height of the projection, the lower, the closer to the ground
    scaleAmplitude: .025, // the higher, the more zoomed-out the view appears
    pixelsPerSlice: 1, // determines the resolution of the projection. the lower, the better
    player: {
        x: 0,
        y: 0,
        angle: 0,
        swing: 0,
        height: 0
    },
    statistics: {
        stroke: 12,
        par: 5
    },
    clickableContexts: [], // keeps track of clickable context areas
    mouseX : null,
    mouseY: null,
    projection: {
        width: 800, // note that despite my efforts a lot of the positioning logic is still dependant on this resolution
        height: 600,
        transitionOffset: 0,
        rotationSpeed: 2,
        initialValues: {
            title: {
                scaleAmplitude: .025,
                startScale: .2,
                startAngle: 0,
                startX: 0,
                startY: -1750
            },
            prelude: {
                scaleAmplitude: .0001, /* projects map in 2d */
                startScale: .2, /* zoom out a bit so it fits on screen */
                startAngle: 0,
                startX: 0,
                startY: -1220 // -1620
            },
            options: {
                scaleAmplitude: .025,
                startScale: .2,
                startAngle: 0,
                startX: 0,
                startY: -620
            },
            game: {
                scaleAmplitude: .1,
                startScale: .5,
                startAngle: 0,
                startX: 0,
                startY: -1620
            }
        }
    },
    miniMap: {
        x: 665,
        y: 300,
        w: 135,
        h: 300
    },
    clubTypes: [
        {
            label: 'wedge',
            height: 20,
            distance: 100
        },
        {
            label: 'wood-3',
            height: 100,
            distance: 200
        },
        {
            label: 'iron-2',
            height: 20,
            distance: 50
        },
        {
            label: 'iron-8',
            height: 80,
            distance: 220
        },
        {
            label: 'driver',
            height: 20,
            distance: 50
        }
    ],
    mouseDown: false,
    mouseDownAction: null,
    showRasterLines: true,
    sineTransformer: Math.PI / 2
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
        src: 'assets/sky_blue_wide.png'
    },
    {
        id: 'title',
        src: 'assets/title.png'
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
    },
    {
        id: 'spritesheet_golfer',
        src: 'assets/spritesheet_golfer.png'
    },
    {
        id: 'tee-off',
        src: 'assets/tee-off.png'
    }
];

/**
 * Attach Image object to each image and load its source
 */
images.map(image => {
    image.img = new Image();
    image['img'].src = image['src'];
});

/**
 * Holds all sounds used in the game
 * @param {string} id - id to refer to the sound asset
 * @param {string} src - path to the sound asset
 */
const sounds = [
    {
        id: 'title_music',
        src: 'assets/golf.mp3'
    }
];

/**
 * Attach Audio object to each sound and load its source
 */
sounds.map(sound => {
    sound.audio = new Audio();
    sound.audio.preload = "auto"; // note this is inconsistently interpreted across browsers and devices
    sound.audio.src = sound.src;
});

/**
 * Check to see if all assets are loaded
 * @returns {boolean} assetsLoaded
 */
const assetsLoaded = () => {
    for (let loadedSound = 0; loadedSound < sounds.length; loadedSound ++) {
        if (!sounds[loadedSound].audio || !sounds[loadedSound].audio.duration) {
            state.loadingAsset = sounds[loadedSound].src;
            return false;
        }
    }

    // since sounds are often partially loaded depending on browser, check for images last to give it more time to load
    for (let loadedBitmap = 0; loadedBitmap < images.length; loadedBitmap ++) {
        if (!images[loadedBitmap] || images[loadedBitmap].img.naturalWidth <= 0) {
            state.loadingAsset = images[loadedBitmap].src;
	        return false;
        }
    }

    return true;
};

/**
 * Initialise the images
 */
const initialiseImages = () => {

	// these are used to do collision checks to see on what type of surface the ball lies
    collisionMaps = {
        MID: new CollisionMap(context, images.filter(img => img.id === 'collision_map_mid_rough')[0]),
        ROUGH: new CollisionMap(context, images.filter(img => img.id === 'collision_map_rough')[0]),
        SAND: new CollisionMap(context, images.filter(img => img.id === 'collision_map_sand')[0]),
        OUT: new CollisionMap(context, images.filter(img => img.id === 'collision_map_out')[0])
    };

	// initialise static image containers used throughout the various scenes
	miniMap = new MiniMap(context, images.filter(img => img.id === 'hole1')[0], collisionMaps);
	title = new Title(context, images.filter(img => img.id === 'title')[0]);
	golfer = new Golfer(context, images.filter(img => img.id === 'spritesheet_golfer')[0], images.filter(img => img.id === 'dropshadow')[0]);
	pointers = new Pointers(context, images.filter(img => img.id === 'pointer')[0], images.filter(img => img.id === 'arrow')[0]);
	surface = new Surface(context, images.filter(img => img.id === 'ball_lie')[0]);
	statistics = new Statistics(context, state.statistics);
    sky = new Sky(context, {
        'blue': images.filter(img => img.id === 'sky_blue')[0],
        'evening': images.filter(img => img.id === 'sky')[0],
        'gradient': images.filter(img => img.id === 'sky_gradient')[0]
    });

	// register global event listeners
    window.addEventListener('mousedown', event => mouseDownHandler(event) );
    window.addEventListener('mouseup', event => mouseUpHandler(event) );

    // from now on escape will return to the menu
    document.onkeydown = event => {
        if (event.keyCode === 27) {
            switchScene(Scenes.TITLE);
        }
    };
};

/**
 * Draw all instantiated bitmapSlices (this renders the pseudo-3d view)
 */
const drawBitmapSlices = (sliceCount) => {

    const cfg = {
        startScale: state.startScale,
        scaleAmplitude: state.scaleAmplitude,
        dimensions: {
            startX: 0,
            endX: state.projection.width,
            startY: state.projection.height / 2,
            endY: state.projection.height,
        },
        pixelsPerSlice: state.pixelsPerSlice,
        pivotPoint: { x: state.projection.width / 2, y: state.projection.height / 2 }
    };

    sliceCount = sliceCount || (cfg.dimensions.endY - cfg.dimensions.startY) / cfg.pixelsPerSlice;

    for (let index = 0; index < sliceCount; index++ ) {
        let slice = new BitmapSlice(
            context,
            images.filter(img => img.id === 'hole1')[0] // todo: should be set by state: holes: [ 1: { image: 'path' } ]
        );

        slice.draw(
            cfg,
            state.player,
            index
        );
    }
};

/**
 * Check if there is a context provided matching the clicked mouse coordinates, then execute its associated action
 */
const mouseDownHandler = event => {
    state.mouseDown = true;

    let mouseX = (event.clientX - document.getElementById("canvas").offsetLeft);
    let mouseY = (event.clientY - document.getElementById("canvas").offsetTop);

    if (mouseX < 0 || mouseX > 800 || mouseY < 0 || mouseY > 600) {
        return false;
    } else {
        state.mouseX = mouseX;
        state.mouseY = mouseY;
        state.clickableContexts.map(clickableContext => {
            if (mouseX > clickableContext.x
                && mouseX < clickableContext.x + clickableContext.width
                && mouseY > clickableContext.y
                && mouseY < clickableContext.y + clickableContext.height
            ) {

                // store action in state so it runs as long as mouseup event is not triggered
                if (clickableContext.repeat) {
                    state.mouseDownAction = () => { clickableContext.action(); };
                }

                clickableContext.action();
            }
        });
    }
};

/**
 * Cancels the mousedown and removes the stored action
 */
const mouseUpHandler = () => {
    state.mouseDown = false;
    state.mouseDownAction = null;
};

/**
 * Ensure all assets are loaded (displaying which one is currently handled) before moving to the Title scene
 */
const loader = () => {
    helpers.Canvas.clearCanvas(context);
    helpers.Type.positionedText({ context, text: "LOADING", y: 250 });
    helpers.Type.positionedText({ context, text: state.loadingAsset, y: 280, font: "12px Arial" });

    // show bouncing ball animation when available
    if (ball) {
        ball.draw();
    }

    // switch scene and call init (default: TITLE)
    if (assetsLoaded() && state.scene !== Scenes.TITLE) {
        initialiseImages();
        switchScene(Scenes.TITLE);
    }
};

/**
 * Set starting values for rendering the projection
 * @param {string} scene - the scene for which to set values
 */
const initProjection = scene => {
    state.startScale = state.projection.initialValues[scene].startScale;
    state.scaleAmplitude = state.projection.initialValues[scene].scaleAmplitude;
    state.player.x = state.projection.initialValues[scene].startX;
    state.player.y = state.projection.initialValues[scene].startY;
    state.player.angle = state.projection.initialValues[scene].startAngle;
};

/**
 * Clean up and switch state to the requested scene, add listeners and start audio if required
 */
const switchScene = scene => {

    // remove all clickable context
    state.clickableContexts = [];

    switch (scene) {
        case Scenes.TITLE:

            initProjection(Scenes.TITLE);

            if (!state.musicPlaying) {
                helpers.Sound.playSound(sounds.filter(soundObj => soundObj.id === 'title_music'), true);
                state.musicPlaying = true;
            }

            window.addEventListener('mousemove', titleScreenHoverHandler, true);

            helpers.Canvas.clickableContext(state.clickableContexts, 'gotoHomepage',580,160,180, 30, () => { window.open('http://www.github.com/rvounik') });
            helpers.Canvas.clickableContext(state.clickableContexts, 'startGame', 270, 340, 240, 50, () => { switchScene(Scenes.PRELUDE); });
            helpers.Canvas.clickableContext(state.clickableContexts, 'options', 270, 410, 240, 50, () => { switchScene(Scenes.OPTIONS); });

            break;

        case Scenes.OPTIONS:

            initProjection(Scenes.OPTIONS);

            helpers.Canvas.clickableContext(state.clickableContexts, 'showRasterLines', 270, 40, 240, 50, () => { state.showRasterLines = !state.showRasterLines });
            helpers.Canvas.clickableContext(state.clickableContexts, 'backToTitle', 20, 540, 240, 50, () => { switchScene(Scenes.TITLE) });

            break;

        case Scenes.PRELUDE:

            // remove unused event handlers
            window.removeEventListener('mousemove', titleScreenHoverHandler, true);

            // stop all audio
            if (state.musicPlaying) {
                state.musicPlaying = false;
                helpers.Sound.stopSound(sounds.filter(soundObj => soundObj.id === 'title_music'));
            }

            initProjection(Scenes.PRELUDE);

            // set a projection offset so the map fits the screen and the sky is moved outside the view during the transition
            state.projection.projectionOffset = 300;

            helpers.Canvas.clickableContext(state.clickableContexts, 'startTransition', 0, 0, 800, 600, () => {
                switchScene(Scenes.TRANSITION);
            });

            break;

        case Scenes.TRANSITION:

            // note: initProjection is not used here since the sole purpose of this scene is to transition towards those values

            // player.y is the only exception, this is required for the map not to 'jump upwards'
            state.player.y += 600;

            break;

        case Scenes.GAME:

            // note: initProjection is not / should not be used here since the transition function ensures these values are eventually reached
            initProjection(Scenes.GAME);

            // initialise dynamic image containers
            inGameText = new InGameText(context, {
                'tee-off': images.filter(img => img.id === 'tee-off')[0]
            });

            // just to debug you can click anywhere on the miniMap to position the player at that point
            helpers.Canvas.clickableContext(
                state.clickableContexts,
                'setPlayerPosition',
                state.miniMap.x,
                state.miniMap.y,
                state.miniMap.w,
                state.miniMap.h,
                () => { convertMiniMapCoordinatesToBitmapCoordinates() }
            );

            // assign rotate action to the left arrow
            helpers.Canvas.clickableContext(state.clickableContexts, 'setPlayerRotationLeft',160,520,50, 50, () => {
                state.player.angle = normalisePlayerOrientation({
                    ...state.player,
                    angle: -state.projection.rotationSpeed
                });
            }, true);

            // assign rotate action to the right arrow
            helpers.Canvas.clickableContext(state.clickableContexts, 'setPlayerRotationRight',605,520,50, 50, () => {
                state.player.angle = normalisePlayerOrientation({
                    ...state.player,
                    angle: +state.projection.rotationSpeed
                });
            }, true);

            helpers.Canvas.clickableContext(state.clickableContexts, 'swing',300,380,140, 220, () => {

                // if it was not playing already, start the interval timeout for the swing animation frames
                if (state.player.swing === 0) {
                    swingTimer = setInterval(incrementSwingTimer, 225);
                }
            });

            break;

        default:
            break;
    }

    // switch the scene
    state.scene = scene;
};

/**
 * Convert coordinates from the miniMap to coordinates matching the bitmap (currently a static bitmap is used)
 */
const convertMiniMapCoordinatesToBitmapCoordinates = () => {
    const imageId = images.filter(img => img.id === 'hole1')[0]; // todo: should be set by state: holes: [ 1: { image: 'path' } ]
    const divisionW = imageId.img.width / state.miniMap.w;
    const divisionH = imageId.img.height / state.miniMap.h;

    state.player.x = normalisePlayerX(0 - ((state.mouseX - state.miniMap.x) * divisionW));
    state.player.y = normalisePlayerY(0 - ((state.mouseY - state.miniMap.y) * divisionH));
};

/**
 * Convert bitmap x coordinates (eg. 0-800) to coordinates that can be used by the renderer
 * @returns {number} x
 */
const normalisePlayerX = x => {

    // add half the projection width, because the image is centered
    return x + (state.projection.width / 2);
};

/**
 * Convert bitmap y coordinates (eg. 0-2080) to coordinates that can be used by the renderer
 * @returns {number} y
 */
const normalisePlayerY = y => {

    // add half the projection height, because the projection starts halfway down the screen
    return y + (state.projection.height / 2);
};

/**
 * Convert player rotation to the right angle that can be used by the renderer
 * @returns {number} angle
 */
const normalisePlayerOrientation = orientation => {

    // revert the rotation since the bitmap is inverted
    return (state.player.angle + (360 -orientation.angle)) % 360;
};

/**
 * Convert player height to the right scaleAmplitude that can be used by the renderer
 * @param {number} height - height (value between 0 - 100)
 * @returns {number} angle
 */
const normalisePlayerHeight = height => {

    // the static number here is a big magicky, determines how high the ball goes. should probably be stored in the club settings
    return (state.projection.initialValues.game.scaleAmplitude - ((100-height) / 500));
};

/**
 * Convert power of the swing to a number that can be used by the renderer
 * @param {number} power - power (value between 0 - 100)
 * @returns {number} power
 */
const normalisePower = power => {
    return power / 12.5;
};

/**
 * Convert player angle to a number in radians that can be used  by the renderer
 * @param {number} angle - angle (value between 0 - 360)
 * @returns {number} radians
 */
const angleToRadians = angle => {
    return angle / 180 * Math.PI
};

/**
 * Deals with showing the right frame of the sprite sheet, clearing the interval if it reaches the end
 */
const incrementSwingTimer = () => {
    state.player.swing ++;

    // number of frames in sprite sheet (skips the last frame, it looks wrong and is not needed in the final game anyway)
    if (state.player.swing > 11) {
        state.player.swing = 0;
        clearInterval(swingTimer);
        flightOffset = 0;
    }
};

/**
 * Check if mouse hovers over a certain option on the title screen, then slightly increment the font size of it
 */
const titleScreenHoverHandler = event => {
    event.preventDefault();

    let mouseX = (event.clientX - document.getElementById("canvas").offsetLeft);
    let mouseY = (event.clientY - document.getElementById("canvas").offsetTop);

    // start game
    if (mouseX > 270 && mouseX < 510 && mouseY > 340 && mouseY < 390) {
        titleStartGameFontSize+= titleStartGameFontSize < 40 ? 1 : 0;
    } else {
        titleStartGameFontSize-= titleStartGameFontSize > 30 ? 1 : 0;
    }

    // options
    if (mouseX > 270 && mouseX < 510 && mouseY > 390 && mouseY < 440) {
        titleOptionsFontSize+= titleOptionsFontSize < 40 ? 1 : 0;
    } else {
        titleOptionsFontSize-= titleOptionsFontSize > 30 ? 1 : 0;
    }
};

/**
 * Transitions the scene from a 2d overview to a 3d projection
 */
const transitionPreludeToGameProjection = () => {

    // this tweaks the speed of the transition
    const multiplier = 2;

    // transition for 2d player y position (move from center to bottom of the image because that is where the tee lies)
    if (state.player.y > state.projection.initialValues[Scenes.GAME].startY) {
        state.player.y-= (multiplier * 12);
    } else {
        state.player.y = state.projection.initialValues[Scenes.GAME].startY;
    }

    // transition for amplitude
    if (state.scaleAmplitude < state.projection.initialValues.game.scaleAmplitude) {
        state.scaleAmplitude += (multiplier * .0015);
    } else {
        state.scaleAmplitude = state.projection.initialValues.game.scaleAmplitude;
    }

    // transition for scaling
    if (state.startScale < state.projection.initialValues.game.startScale) {
        state.startScale += (multiplier * .025);
    } else {
        state.startScale = state.projection.initialValues.game.startScale;
    }

    // transition for camera tilt
    if (state.projection.projectionOffset > 0) {
        state.projection.projectionOffset -= (multiplier * 4);
    } else {
        state.projection.projectionOffset = 0;
    }
};

/**
 * Calculate point(s) along a quadratic bezier curve
 * @param {number} step - step offset of the path to return coordinates for
 * @param {Object} startPath - object with coordinates of path start
 * @param {Object} controlPoint - object with coordinates of control point
 * @param {Object} endPath - object with coordinates of path end
 * @returns {Object} object with coordinates
 */
const quadraticBezierCurve = (step, startPath, controlPoint, endPath) => {
    return {
        x: (1 - step) * (1 - step) * startPath.x + 2 * (1 - step) * step * controlPoint.x + step * step * endPath.x,
        y: (1 - step) * (1 - step) * startPath.y + 2 * (1 - step) * step * controlPoint.y + step * step * endPath.y
    };
};

/**
 * Draws a 2d curve representing the trajectory of the ball
 * @param {Object} startPath - object with coordinates of path start
 * @param {Object} controlPoint - object with coordinates of control point
 * @param {Object} endPath - object with coordinates of path end
 */
const drawFlightPathFromSide = (startPath, controlPoint, endPath) => {
    for (let pathStep = 0; pathStep < flightSteps; pathStep+= 1) {
        let curve = quadraticBezierCurve(
            pathStep / 100,
            startPath,
            controlPoint,
            endPath
        );
        context.fillStyle = pathStep === flightOffset ? "#ffffff" : "#ff0000"; // highlight current step position
        context.fillRect(
            370 + curve.x, 50 + curve.y,
            2, 2
        );
    }
};

/**
 * Perform all timely actions required for the current scene
 */
const update = () => {

    helpers.Canvas.clearCanvas(context, '#17411D');

    switch (state.scene) {
        case Scenes.LOADING:
            loader();
            break;

        case Scenes.TITLE:
            sky.draw(Skies.EVENING, state, false, false);
            title.draw();

            // draw the projection semi-transparent
            context.globalAlpha = .25;
            drawBitmapSlices();
            context.globalAlpha = 1;

            // projection movement
            state.player.y += 2;
            if (state.player.y > 200 ) { state.player.y = -2000 } // the '2000' is a  magic number bound to the image of hole 1

            // add texts and options
            helpers.Type.positionedText({ context, font: "14px Arial", text: "A game by rvo (c) 2020", x: 600, y: 180 });
            helpers.Type.positionedText({ context, font: `${titleStartGameFontSize}px Arial`, text: "START GAME", y: 380 });
            helpers.Type.positionedText({ context, font: `${titleOptionsFontSize}px Arial`, text: "OPTIONS", y: 440 });

            break;

        case Scenes.OPTIONS:

            // draw the projection semi-transparent
            context.globalAlpha = .25;
            drawBitmapSlices();
            context.globalAlpha = 1;
            state.player.angle -= 1;

            // add options
            helpers.Type.positionedText({ context, text: state.showRasterLines ? '[x] show raster lines ' : '[  ] show raster lines', y: 80 });
            helpers.Type.positionedText({ context, text: "< Back to title", x: 20, y: 580 });

            break;

        case Scenes.PRELUDE:

            // add an offset to the projection to be able to have the projection vertically centered
            context.translate(0, -150);

            // draw double the number of slices since the projection is full height here to show the map
            drawBitmapSlices(600);

            // reset the projection offset
            context.translate(0, 150);

            // add some information about the hole
            helpers.Type.positionedText({ context, font: "50px Arial", text: "HOLE 1", y: 100 });
            helpers.Type.positionedText({ context, font: "16px Arial", text: "bla bla", x: 40, y: 200 });

            break;

        case Scenes.TRANSITION:

            // instead of changing projection variables straight to the game values, transition between prelude and game scenes
            if (state.player.y > state.projection.initialValues[Scenes.GAME].startY ||
                state.projection.projectionOffset > 0 ||
                state.scaleAmplitude < state.projection.initialValues.game.scaleAmplitude ||
                state.startScale < state.projection.initialValues.game.startScale) {

                // transition the projection configuration from prelude to game state
                transitionPreludeToGameProjection();

                // move the canvas in such a way it appears the camera is slowly tilting towards the horizon
                context.translate(0, -state.projection.projectionOffset);

                // draw sky with the offset set above
                sky.draw(Skies.BLUE, state, true, true);

                // draw double the number of slices since the projection is full height at the start of the transition
                drawBitmapSlices(state.projection.height);

                // reset offset
                context.translate(0, state.projection.projectionOffset);

            } else {

                // draw projection one frame in the right state before switching scenes (this is a lot smoother)
                sky.draw(Skies.BLUE, state, true, true);
                drawBitmapSlices(300);
                switchScene(Scenes.GAME);
            }

            break;

        case Scenes.GAME:
            sky.draw(Skies.BLUE, state, true, true);
            drawBitmapSlices();
            surface.draw(miniMap.checkCollisions(state.player, state.miniMap));
            miniMap.draw(state.player, state.miniMap);
            statistics.draw();
            inGameText.draw('tee-off', 150, 120, 50);

            if (flightOffset < flightSteps) {

                // temp while working on power meter
                const power = 100;

                // curve path should be 0-100 on x axis, 100-0 on y axis
                let startPath = { x: 0, y: 100 };
                let controlPoint = { x: 80, y: 20 }; // todo: should be determined by club type
                let endPath = { x: flightSteps, y: 100 };

                // increment offset
                flightOffset += 1;

                // get height on bezier curve
                const pointsOnCurve = quadraticBezierCurve(
                    flightOffset / 100,
                    startPath,
                    controlPoint,
                    endPath
                );

                // zoom level
                state.scaleAmplitude = normalisePlayerHeight(pointsOnCurve.y);

                // x, y translation
                state.player.x+= normalisePower(power) * Math.sin(angleToRadians(state.player.angle));
                state.player.y+= normalisePower(power) * Math.cos(angleToRadians(state.player.angle));

                // todo: perhaps it should also affect state.startScale ?

                drawFlightPathFromSide(startPath, controlPoint, endPath)
            } else {
                pointers.draw();
                golfer.draw(state.player);
            }

            break;

        default:
            break;
    }

    // on mouseDown, execute the stored action if it exists
    if (state.mouseDown && state.mouseDownAction) {
        state.mouseDownAction();
    }

    // these raster lines give the game a nice retro look
    if (state.showRasterLines) { helpers.Canvas.rasterLines(context) }

    requestAnimationFrame(() => {
        update();
    });
};

// init loading visuals outside of image creation loop so it doesnt need to wait for the whole library to be loaded
const ballImage = new Image();
ballImage.onload = () => { ball = new Ball(context, ballImage) };
ballImage.src = 'assets/ball.png';

// call the updater
update();
