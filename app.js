// helpers
import helpers from './helpers/index.js';

// constants
import Scenes from './constants/Scenes.js';
import Skies from './constants/Skies.js';
import SwingStates from './constants/SwingStates.js';
import SurfaceTypes from './constants/SurfaceTypes.js';

// components
import Ball from './components/Ball.js';
import BitmapSlice from './components/BitmapSlice.js';
import MiniMap from './components/MiniMap.js';
import Sky from './components/Sky.js';
import Club from './components/Club.js';
import Title from './components/Title.js';
import Golfer from './components/Golfer.js';
import Panel from './components/Panel.js';
import Pointers from './components/Pointers.js';
import Surface from './components/Surface.js';
import Wind from './components/Wind.js';
import CollisionMap from './components/CollisionMap.js';
import Statistics from './components/Statistics.js';
import InGameText from './components/InGameText.js';

// gauges
import Power from './components/gauges/Power.js';
import Revert from './components/gauges/Revert.js';
import Spin from './components/gauges/Spin.js';

// physics
import { createBall, stepBall, simulate, calibrateLaunchSpeed, Phases, STEP } from './physics/BallFlight.js';

// globals
const context = document.getElementById('canvas').getContext('2d');

// init containers that hold the image instances as globals so they can be used everywhere
let ball, surface, wind, miniMap, sky, club, title, golfer, power, revert, spin, pointers, statistics, panel;
let collisionMaps = [];
let inGameTexts = [];

// init timers
let swingTimer, powerGaugeTimer, downSwingTimer;

// init specific vars that dont really belong to the runtime state
let titleStartGameFontSize = 30;
let titleOptionsFontSize = 30;
const pixelsPerMetre = 3.85; // scale of the hole bitmaps
const flightTimeScale = 1; // 1 is real time, lower this to slow the ball flight down
const windEffect = .35; // how much of the displayed wind speed actually acts on the ball
const cameraEyeHeight = 3; // height of the camera above the ball in metres. the lower, the more dramatic the lift-off
const powerCurve = .6; // maps the power gauge to ball speed in such a way that half a swing gives roughly half the distance
let flight = null; // holds the ball in flight and everything required to draw it
let lastFrameTime = performance.now();

// dynamic values are kept in local state
const state = {
    scene: Scenes.LOADING, // which scene is currently active
    musicPlaying: false, // whether music is playing
    audioEnabled: true,
    loadingAsset: '', // the currently preloading asset
    startScale: .5, // determines the height of the projection, the lower, the closer to the ground
    scaleAmplitude: .025, // the higher, the more zoomed-out the view appears
    pixelsPerSlice: 1, // determines the resolution of the projection. the lower, the better
    collision: null,
    inGameTextTimeOut: 50,
    player: {
        x: 0,
        y: 0,
        angle: 0,
        swing: 0,
        height: 0,
        power: 0,
        downSwing: 0,
        spin: 0,
        impactX: 0,
        impactY: 0,
        oldX: 0,
        oldY: 0,
        selectedClub: 'driver'
    },
    swingState: SwingStates.IDLE,
    statistics: {
        hole: 1,
        stroke: 1,
        par: 4,
        distanceToFlag: 0,
        wind: {
            direction: 0,
            speed: 0
        }
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
                startY: 0
            }
        }
    },
    miniMap: {
        x: 665,
        y: 300,
        startX: 665,
        startY: 300,
        width: 135,
        height: 300
    },
    baseCollisionMap: {
        x: 665,
        y: 300,
        width: 135,
        height: 300
    },
    holes: [
        {
            id: 1,
            startX: 0,
            startY: -1620,
            startAngle: 0,
            flagX: 33,
            flagY: 17,
            par: 4
        }

    ],
    clubTypes: [
        {
            id: 'driver',
            label: 'Driver',
            imageId: 'club-driver',
            launchAngle: 11, // degrees
            backspin: 2700, // rpm
            distance: 260,
            precision: 10 // the higher, the more the shot is likely to be inaccurate. trade-off between accuracy and distance.
        },
        {
            id: '3-wood',
            label: 'Wood 3',
            imageId: 'club-wood',
            launchAngle: 11.5, // degrees
            backspin: 3500, // rpm
            distance: 236,
            precision: 8
        },
        {
            id: '4-wood',
            label: 'Wood 4',
            imageId: 'club-wood',
            launchAngle: 12, // degrees
            backspin: 3900, // rpm
            distance: 224,
            precision: 7
        },
        {
            id: '2-iron',
            label: 'Iron 2',
            imageId: 'club-iron',
            launchAngle: 12, // degrees
            backspin: 4000, // rpm
            distance: 215,
            precision: 6.5
        },
        {
            id: '3-iron',
            label: 'Iron 3',
            imageId: 'club-iron',
            launchAngle: 13, // degrees
            backspin: 4400, // rpm
            distance: 203,
            precision: 6
        },
        {
            id: '4-iron',
            label: 'Iron 4',
            imageId: 'club-iron',
            launchAngle: 14, // degrees
            backspin: 4800, // rpm
            distance: 191,
            precision: 5.5
        },
        {
            id: '5-iron',
            label: 'Iron 5',
            imageId: 'club-iron',
            launchAngle: 15, // degrees
            backspin: 5300, // rpm
            distance: 179,
            precision: 5
        },
        {
            id: '6-iron',
            label: 'Iron 6',
            imageId: 'club-iron',
            launchAngle: 16.5, // degrees
            backspin: 6000, // rpm
            distance: 167,
            precision: 4.5
        },
        {
            id: '7-iron',
            label: 'Iron 7',
            imageId: 'club-iron',
            launchAngle: 18, // degrees
            backspin: 6800, // rpm
            distance: 155,
            precision: 4
        },
        {
            id: '8-iron',
            label: 'Iron 8',
            imageId: 'club-iron',
            launchAngle: 20, // degrees
            backspin: 7600, // rpm
            distance: 143,
            precision: 3.5
        },
        {
            id: '9-iron',
            label: 'Iron 9',
            imageId: 'club-iron',
            launchAngle: 22.5, // degrees
            backspin: 8400, // rpm
            distance: 131,
            precision: 3
        },
        {
            id: 'p-wedge',
            label: 'Pitch wedge',
            imageId: 'club-wedge',
            launchAngle: 30, // degrees
            backspin: 8000, // rpm
            distance: 75,
            precision: 2
        },
        {
            id: 's-wedge',
            label: 'Sand wedge',
            imageId: 'club-wedge',
            launchAngle: 34, // degrees
            backspin: 8500, // rpm
            distance: 60,
            precision: 2
        },


    ],
    mouseDown: false,
    mouseDownAction: null,
    showRasterLines: true,
    panels: {
        keepPanelsOpen: true,
        panelWidth: 135,
        left: {
            visible: true,
            x: -135,
            endX: 0
        },
        right: {
            visible: true,
            x: 800,
            endX: 665
        }
    }
};

// derive the launch speed of each club from the distance it should cover with a full swing
state.clubTypes.forEach(club => {
    club.launchSpeed = calibrateLaunchSpeed(club);
});

/**
 * Set id and source for each of the images used in the game
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
        id: 'MID',
        src: 'assets/collision_map_mid_rough.png'
    },
    {
        id: 'ROUGH',
        src: 'assets/collision_map_rough.png'
    },
    {
        id: 'SAND',
        src: 'assets/collision_map_sand.png'
    },
    {
        id: 'OUT',
        src: 'assets/collision_map_out.png'
    },
    {
        id: 'spritesheet_golfer',
        src: 'assets/spritesheet_golfer.png' // arnold palmer tournament golf (sega megadrive)
    },
    {
        id: 'tee-off',
        src: 'assets/tee-off.png'
    },
    {
        id: 'good-shot',
        src: 'assets/goodshot.png'
    },
    {
        id: 'out-of-bounds',
        src: 'assets/out-of-bounds.png'
    },
    {
        id: 'club-driver',
        src: 'assets/club-driver.png'
    },
    {
        id: 'club-iron',
        src: 'assets/club-iron.png'
    },
    {
        id: 'club-putter',
        src: 'assets/club-putter.png'
    },
    {
        id: 'club-wedge',
        src: 'assets/club-wedge.png'
    },
    {
        id: 'club-wood',
        src: 'assets/club-wood.png'
    },
    {
        id: 'button-close-panel',
        src: 'assets/button-close-panel.png'
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
        src: 'assets/sound/title.mp3' // zapsplat.com
    },
    {
        id: 'game_music',
        src: 'assets/sound/game.mp3' // zapsplat.com
    },
    {
        id: 'info_screen',
        src: 'assets/sound/info_screen.mp3' // zapsplat.com
    },
    {
        id: 'end_hole',
        src: 'assets/sound/end_hole.mp3' // zapsplat.com
    },
    {
        id: 'hit',
        src: 'assets/sound/hit.mp3' // freesound.org
    },
    {
        id: 'good_shot',
        src: 'assets/sound/goodshot.mp3' // fromtexttospeech.com (john)
    },
    {
        id: 'nice_shot',
        src: 'assets/sound/niceshot.mp3' // fromtexttospeech.com (john)
    },
    {
        id: 'out_of_bounds',
        src: 'assets/sound/outofbounds.mp3' // fromtexttospeech.com (john)
    },
    {
        id: 'tee_off',
        src: 'assets/sound/teeoff.mp3' // fromtexttospeech.com (john)
    },
    {
        id: 'applause_1',
        src: 'assets/sound/applause1.mp3' // freesoundeffects.com
    },
    {
        id: 'applause_2',
        src: 'assets/sound/applause2.mp3' // freesoundeffects.com
    }
];

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

    for (let loadedBitmap = 0; loadedBitmap < images.length; loadedBitmap ++) {
        if (!images[loadedBitmap] || images[loadedBitmap].img.naturalWidth <= 0) {
            state.loadingAsset = images[loadedBitmap].src;
	        return false;
        }
    }

    return true;
};

/**
 * Attach Audio object to each sound and load its source
 */
const initialiseSounds = () => {
    sounds.map(sound => {
        sound.audio = new Audio();
        sound.audio.preload = "auto"; // note this is inconsistently interpreted across browsers and devices
        sound.audio.src = sound.src;
    });
};

/**
 * Initialise the images
 */
const initialiseImages = () => {
    Object.keys(SurfaceTypes).forEach(surfaceType => {

        // each type that has a collision map loaded, add to collisionMaps collection
        if (surfaceType && images.filter(img => img.id === surfaceType).length) {
            collisionMaps.push(

                // these are used to do collision checks to see on what type of surface the ball lies
                new CollisionMap(context, images.filter(img => img.id === surfaceType)[0]),
            )
        }
    });

	// initialise static image containers used throughout the various scenes
	miniMap = new MiniMap(context, images.filter(img => img.id === 'hole1')[0]);
	title = new Title(context, images.filter(img => img.id === 'title')[0]);
	golfer = new Golfer(context, images.filter(img => img.id === 'spritesheet_golfer')[0], images.filter(img => img.id === 'dropshadow')[0]);
	panel = new Panel(context);
	power = new Power(context);
	revert = new Revert(context);
	spin = new Spin(context);
	pointers = new Pointers(context, images.filter(img => img.id === 'pointer')[0], images.filter(img => img.id === 'arrow')[0]);
	surface = new Surface(context, images.filter(img => img.id === 'ball_lie')[0]);
	wind = new Wind(context);
	statistics = new Statistics(context);
    sky = new Sky(context, {
        'blue': images.filter(img => img.id === 'sky_blue')[0],
        'evening': images.filter(img => img.id === 'sky')[0],
        'gradient': images.filter(img => img.id === 'sky_gradient')[0]
    });
    club = new Club(context, {
        'club-driver': images.filter(img => img.id === 'club-driver')[0],
        'club-iron': images.filter(img => img.id === 'club-iron')[0],
        'club-putter': images.filter(img => img.id === 'club-putter')[0],
        'club-wedge': images.filter(img => img.id === 'club-wedge')[0],
        'club-wood': images.filter(img => img.id === 'club-wood')[0]
    });

	// register global event listeners
    window.addEventListener('mousedown', event => mouseDownHandler(event) );
    window.addEventListener('mouseup', event => mouseUpHandler(event) );

    // copy localStorage state to local state (if key doesnt exist, set required default value)
    state.audioEnabled = getLocalStorage('audioEnabled') === null ? true : getLocalStorage('audioEnabled');
    state.showRasterLines = getLocalStorage('showRasterLines') === null ? true : getLocalStorage('showRasterLines');
    state.panels.keepPanelsOpen = getLocalStorage('keepPanelsOpen') === null ? true : getLocalStorage('keepPanelsOpen');

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
            images.filter(img => img.id === `hole${state.statistics.hole}`)[0]
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
        ball.animate();
    }

    // switch scene and call init (default: TITLE)
    if (assetsLoaded() && state.scene !== Scenes.TITLE) {
        // initialiseImages();
        // initialiseSounds();
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
    state.player.impactX = 0;
    state.player.impactY = 0;
    state.player.angle = state.projection.initialValues[scene].startAngle;

    // in case of game scene, take these properties from the hole variables
    if (scene === Scenes.GAME) {
        const currentHole = state.holes.filter(hole => hole.id === state.statistics.hole)[0];
        state.player.x = currentHole.startX;
        state.player.y = currentHole.startY;
        state.player.angle = currentHole.startAngle;
    }
};

const getLocalStorage = key => {
    return JSON.parse(localStorage.getItem(key));
};

const setLocalStorage = (key, value) => {
    localStorage.setItem(
        key, value
    );
};

/**
 * Clean up and switch state to the requested scene, add listeners and start audio if required
 */
const switchScene = scene => {

    // remove all clickable context
    state.clickableContexts = [];

    switch (scene) {
        case Scenes.TITLE:

            // set per-scene defaults
            initProjection(Scenes.TITLE);

            // set game start defaults
            state.statistics.hole = 1;
            state.statistics.wind.direction = 90; // fixed sideways for testing (was: Math.random() * 360)
            state.statistics.wind.speed = 28; // max wind for testing (was: Math.random() * 18)

            const currentHole = state.holes.filter(hole => hole.id === state.statistics.hole)[0];

            state.statistics.stroke = 1;
            state.statistics.par = currentHole.par;
            state.player.selectedClub = 'driver'; // todo: redundant when auto-club-select is in place;
            state.collision = 'FAIRWAY';

            // clear all swing timers and such
            state.player.swing = 1;
            state.player.power = 0;
            clearInterval(downSwingTimer);
            clearInterval(swingTimer);
            clearInterval(powerGaugeTimer);
            state.swingState = SwingStates.IDLE;
            flight = null;
            state.player.spin = 0;

            state.panels.left.visible = state.panels.keepPanelsOpen;
            state.panels.right.visible = state.panels.keepPanelsOpen;

            // stop all audio
            if (state.musicPlaying || !state.audioEnabled) {
                state.musicPlaying = false;
                helpers.Sound.stopSound(sounds.filter(soundObj => soundObj.id === 'title_music'));
                helpers.Sound.stopSound(sounds.filter(soundObj => soundObj.id === 'game_music'));
            }

            sounds.map(sound => {
                sound.audio = new Audio();
                sound.audio.preload = "auto"; // note this is inconsistently interpreted across browsers and devices
                sound.audio.src = sound.src;
            });

            // play title music
            if (!state.musicPlaying && state.audioEnabled) {
                state.musicPlaying = true;
                helpers.Sound.playSound(sounds.filter(soundObj => soundObj.id === 'title_music'), true);
            }

            // hover handler
            window.addEventListener('mousemove', titleScreenHoverHandler, true);

            // click handler
            helpers.Canvas.addClickableContext(state.clickableContexts, 'gotoHomepage',580,160,180, 30, () => { window.open('http://www.github.com/rvounik') });
            helpers.Canvas.addClickableContext(state.clickableContexts, 'startGame', 270, 340, 240, 50, () => { switchScene(Scenes.PRELUDE); });
            helpers.Canvas.addClickableContext(state.clickableContexts, 'options', 270, 410, 240, 50, () => { switchScene(Scenes.OPTIONS); });

            break;

        case Scenes.OPTIONS:

            initProjection(Scenes.OPTIONS);

            helpers.Canvas.addClickableContext(state.clickableContexts, 'showRasterLines', 270, 40, 240, 60, () => {
                state.showRasterLines = !state.showRasterLines;
                setLocalStorage(
                    'showRasterLines', state.showRasterLines
                );
            });
            helpers.Canvas.addClickableContext(state.clickableContexts, 'enableAudio', 270, 100, 240, 60, () => {
                state.audioEnabled = !state.audioEnabled;

                // also save it to local storage
                setLocalStorage(
                    'audioEnabled', state.audioEnabled
                );
            });
            helpers.Canvas.addClickableContext(state.clickableContexts, 'keepPanelsOpen', 270, 160, 240, 60, () => {
                state.panels.keepPanelsOpen = !state.panels.keepPanelsOpen;

                // also save it to local storage
                setLocalStorage(
                    'keepPanelsOpen', state.panels.keepPanelsOpen
                );
            });
            helpers.Canvas.addClickableContext(state.clickableContexts, 'backToTitle', 20, 540, 240, 60, () => { switchScene(Scenes.TITLE) });

            break;

        case Scenes.PRELUDE:

            // remove unused event handlers
            window.removeEventListener('mousemove', titleScreenHoverHandler, true);

            // stop all audio
            if (state.musicPlaying) {
                state.musicPlaying = false;
                helpers.Sound.stopSound(sounds.filter(soundObj => soundObj.id === 'title_music'));
            }

            helpers.Sound.playSound(sounds.filter(soundObj => soundObj.id === 'info_screen'), false);

            initProjection(Scenes.PRELUDE);

            // set a projection offset so the map fits the screen and the sky is moved outside the view during the transition
            state.projection.projectionOffset = 300;

            window.setTimeout(() => {
                helpers.Canvas.addClickableContext(state.clickableContexts, 'startTransition', 670, 520, 90, 40, () => {
                    switchScene(Scenes.TRANSITION);
                });
            }, 1000);

            break;

        case Scenes.TRANSITION:

            // note: initProjection is not used here since the sole purpose of this scene is to transition towards those values

            // player.y is the only exception, this is required for the map not to 'jump upwards' (since projection height goes from 600 to 300)
            state.player.y += 600;


            break;

        case Scenes.GAME:

            // note: initProjection is not / should not be used here since the transition function ensures these values are eventually reached
            initProjection(Scenes.GAME);

            inGameTexts.push(new InGameText(context, images.filter(img => img.id === 'tee-off')[0], state.inGameTextTimeOut));
            helpers.Sound.playSound(sounds.filter(soundObj => soundObj.id === 'tee_off'), false);

            window.setTimeout(() => {
                if (!state.musicPlaying && state.audioEnabled) {
                    helpers.Sound.playSound(sounds.filter(soundObj => soundObj.id === 'game_music'), true);
                    state.musicPlaying = true;
                }
            }, 750);

            // assign rotate action to the left arrow
            helpers.Canvas.addClickableContext(state.clickableContexts, 'setPlayerRotationLeft',160,520,50, 50, () => {
                state.player.angle = normalisePlayerOrientation({
                    ...state.player,
                    angle: -state.projection.rotationSpeed
                });
            }, true);

            // assign rotate action to the right arrow
            helpers.Canvas.addClickableContext(state.clickableContexts, 'setPlayerRotationRight',605,520,50, 50, () => {
                state.player.angle = normalisePlayerOrientation({
                    ...state.player,
                    angle: +state.projection.rotationSpeed
                });
            }, true);

            helpers.Canvas.addClickableContext(state.clickableContexts, 'swing',270,380,140, 220, () => {

                // clicking the golfer sprite results in any of these defined 'swing states'
                switch(state.swingState) {
                    case SwingStates.IDLE:

                        // start timeout for sprite animation
                        swingTimer = setInterval(incrementSwingTimer, 225);

                        // start timeout for increasing the power gauge
                        powerGaugeTimer = setInterval(incrementPower, 10);

                        // move to next state
                        state.swingState = SwingStates.BACKSWING;

                        break;

                    case SwingStates.BACKSWING:

                        // stop increasing the power gauge
                        clearInterval(powerGaugeTimer);

                        startDownSwing();

                        // power is so low the down swing sprite sheet should jump ahead a bit
                        if (state.player.power < 80) {
                            state.player.swing = 4;
                        }

                        // power is so low the down swing sprite sheet should jump ahead a bit more
                        if (state.player.power < 40) {
                            state.player.swing = 5;
                        }

                        state.swingState = SwingStates.DOWNSWING;

                        break;

                    case SwingStates.SPIN:
                        setSpin(state.player.spin);

                        break;

                    case SwingStates.FLIGHT:
                    case SwingStates.DOWNSWING:
                    case SwingStates.IMPACT:

                    default:
                        break;
                }
            });

            break;

        default:
            break;
    }

    // switch the scene
    state.scene = scene;
};

// when player clicked after power gauge goes below 0, or when the spin gauge reaches the end
const setSpin = () => {
    if (state.swingState === SwingStates.SPIN) {

        // this ensures it is only possible to set spin once
        state.swingState = SwingStates.IMPACT;

        // play sound effect
        helpers.Sound.playSound(sounds.filter(soundObj => soundObj.id === 'hit'), false);


        // small pause before ball flight
        window.setTimeout(launchBall, 500);
    }
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
 * Convert height of the ball above the ground to the scaleAmplitude that can be used by the renderer. Perspective
 * makes the ground shrink in proportion to the height of the camera, so this is an inverse relation
 * @param {number} height - height in metres
 * @returns {number} scaleAmplitude
 */
const cameraAmplitudeForHeight = height => {
    return state.projection.initialValues.game.scaleAmplitude * (cameraEyeHeight / (cameraEyeHeight + Math.max(0, height)));
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
        state.player.swing = 11;
        clearInterval(swingTimer);
    }
};

/**
 * Draws an increasing arc representing the timing of the back swing
 */
const incrementPower = () => {
    state.player.power ++;

    if (state.player.power >= 100) {
        state.player.power = 100; // reset
        clearInterval(powerGaugeTimer); // remove self
        state.swingState = SwingStates.DOWNSWING; // switch swing state
        startDownSwing();
    }
};

/**
 * Draws a decreasing arc representing the timing of the down swing
 */
const startDownSwing = () => {

    // ensure the down swing starts from the point where the back swing ended
    state.player.downSwing = state.player.power;

    // start timeout for the down swing
    downSwingTimer = setInterval(decreaseDownSwing, 8); // slightly faster than back swing timer
};

/**
 * Decreases the value used for drawing the down swing until it reaches zero, then switches to the spin gauge
 */
const decreaseDownSwing = () => {
    state.player.downSwing --;

    if (state.player.downSwing < 0 ) {
        state.player.downSwing = 0; // reset
        clearInterval(downSwingTimer); // remove self
        state.swingState = SwingStates.SPIN; // switch swing state
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
    const multiplier = 1.5;

    const currentHole = state.holes.filter(hole => hole.id === state.statistics.hole)[0];

    // transition for 2d player y position
    if (state.player.y > currentHole.startY) {
        state.player.y-= (multiplier * 12);

        // dont outrun the target
        if (state.player.y < currentHole.startY) {
            state.player.y = currentHole.startY;
        }
    } else {
        state.player.y+= (multiplier * 12);

        // dont outrun the target
        if (state.player.y > currentHole.startY) {
            state.player.y = currentHole.startY;
        }
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
 * Convert actual distance on bitmap to distance converted to projection dimensions, more or less matching the real-life value
 * @param {number} distance - distance in bitmap pixels
 * @returns {number} distance in metres
 */
const normaliseDistanceToFlag = distance => {
    const magicNumber = 3.85;

    return distance / magicNumber;
};

/**
 * Returns the velocity of the air in m/s, in the same axes as the player position
 */
const getWindVector = () => {
    const direction = angleToRadians(state.statistics.wind.direction);
    const speed = state.statistics.wind.speed * windEffect;

    return { x: speed * Math.sin(direction), y: speed * Math.cos(direction) };
};

/**
 * Sends the ball on its way using the power and spin that were set with the gauges
 */
const launchBall = () => {

    // player may have left the game in the meantime
    if (state.scene !== Scenes.GAME || state.swingState !== SwingStates.IMPACT) {
        return;
    }

    const selectedClub = state.clubTypes.filter(club => club.id === state.player.selectedClub)[0];
    const power = Math.pow(state.player.power / 100, powerCurve);

    // the spin gauge is dead straight at 50: clicking early hooks the ball (left), late slices it (right).
    // the less precise the club, the more the spin axis tilts and the more the ball curves
    const spinTilt = angleToRadians(((state.player.spin - 50) / 50) * selectedClub.precision * 2);

    const ball = createBall({
        x: state.player.x / pixelsPerMetre,
        y: state.player.y / pixelsPerMetre,
        heading: angleToRadians(state.player.angle),
        club: selectedClub,
        power,
        spinTilt
    });

    // run a copy of the ball ahead of time to get the path to show in the side-on view
    const path = [];
    let pathApex = 0;
    let step = 0;
    const predicted = simulate({ ...ball }, getWindVector(), () => 'FAIRWAY', predictedBall => {
        pathApex = Math.max(pathApex, predictedBall.z);

        if (step++ % 12 === 0) {
            path.push({
                distance: Math.hypot(predictedBall.x - ball.x, predictedBall.y - ball.y),
                height: predictedBall.z
            });
        }
    });

    flight = {
        ball,
        startX: ball.x,
        startY: ball.y,
        path,
        pathApex,
        pathLength: Math.hypot(predicted.x - ball.x, predicted.y - ball.y),
        distanceToFlag: state.statistics.distanceToFlag,
        oldCollision: state.collision,
        cameraHeight: 0,
        accumulator: 0
    };

    // store the old position
    state.player.oldX = state.player.x;
    state.player.oldY = state.player.y;

    state.swingState = SwingStates.FLIGHT;
};

/**
 * Advances the ball in flight by the time that passed since the last frame and lets the camera follow it
 * @param {number} dt - elapsed time in seconds
 */
const updateBallFlight = dt => {
    const { ball } = flight;
    const wind = getWindVector();
    const surfaceAt = (x, y) => getSurfaceAt(x * pixelsPerMetre, y * pixelsPerMetre);

    // the physics run in fixed steps so the flight is identical regardless of the frame rate
    flight.accumulator += dt * flightTimeScale;

    while (flight.accumulator >= STEP && ball.phase !== Phases.REST) {
        stepBall(ball, wind, STEP, surfaceAt);
        flight.accumulator -= STEP;
    }

    // the camera travels with the ball
    state.player.x = ball.x * pixelsPerMetre;
    state.player.y = ball.y * pixelsPerMetre;

    // follow the height with a tiny bit of lag, this takes the harsh edge off the bounces
    flight.cameraHeight += (ball.z - flight.cameraHeight) * (1 - Math.exp(-dt / .05));
    state.scaleAmplitude = cameraAmplitudeForHeight(flight.cameraHeight);

    // first touch down
    if (ball.bounces > 0 && state.swingState === SwingStates.FLIGHT) {
        state.swingState = SwingStates.BOUNCE;
    }

    if (ball.phase === Phases.REST) {
        endBallFlight();
    }
};

/**
 * Gives feedback on the given shot
 * @param {number} power - power given to the swing
 * @param {number} spin - spin given to the shot
 * @param {string} collision - surface on which the ball ended
 */
const giveFeedBackOnShot = (power, spin, collision) => {

    // check for nice / good shot (ball should have landed on fairway, spin should be minimal and power above 30%)
    if (power > 25 && spin > 45 && spin < 55 && collision === 'FAIRWAY') {
        inGameTexts.push(new InGameText(context, images.filter(img => img.id === 'good-shot')[0], state.inGameTextTimeOut));

        // randomise the sample
        if (parseInt(Math.random() * 2) === 1){
            helpers.Sound.playSound(sounds.filter(soundObj => soundObj.id === 'good_shot'), false);
        } else {
            helpers.Sound.playSound(sounds.filter(soundObj => soundObj.id === 'nice_shot'), false);
        }

        // for exceptionally long shots, give applause
        if (power > 60) {
            helpers.Sound.playSound(sounds.filter(soundObj => soundObj.id === 'applause_1'), false);
        }
    }
};

/**
 * Resets all values associated with ball flight and deals with where the ball ended up
 */
const endBallFlight = () => {
    const surface = flight.ball.surface;

    if (surface === 'OUT') {
        inGameTexts.push(new InGameText(context, images.filter(img => img.id === 'out-of-bounds')[0], state.inGameTextTimeOut));

        helpers.Sound.playSound(sounds.filter(soundObj => soundObj.id === 'out_of_bounds'), false);

        // reset to old position
        state.player.x = state.player.oldX;
        state.player.y = state.player.oldY;
        state.collision = flight.oldCollision;

        // penalty stroke
        state.statistics.stroke++;
    } else {
        state.collision = SurfaceTypes[surface]; // update the surface indicator
        giveFeedBackOnShot(state.player.power, state.player.spin, state.collision); // check if the shot was good
    }

    flight = null;
    state.swingState = SwingStates.IDLE;
    state.player.power = 0;
    state.player.spin = 0;
    state.statistics.stroke++;
    state.scaleAmplitude = state.projection.initialValues.game.scaleAmplitude;
};

/**
 * Draws a side-on view of the trajectory in the right panel: the predicted path, and where the ball is right now
 */
const drawBallFlightFromSide = () => {
    const { ball, path } = flight;
    const width = 88; // pixels between the golfer and the flag in the panel
    const height = 26; // pixels of sky above the ground line in the panel
    const horizontalScale = width / Math.max(flight.distanceToFlag, flight.pathLength, 1);
    const verticalScale = height / Math.max(flight.pathApex, 40);

    context.save();

    // origin at the feet of the little golfer
    context.translate(state.panels.right.x + 23, 51);

    context.globalAlpha = .5;
    context.fillStyle = "#333333";
    path.forEach(point => {
        context.fillRect(point.distance * horizontalScale, -point.height * verticalScale - 2, 2, 2);
    });

    context.globalAlpha = 1;
    context.fillStyle = "#ffffff";
    context.fillRect(
        Math.hypot(ball.x - flight.startX, ball.y - flight.startY) * horizontalScale - 1, -ball.z * verticalScale - 3,
        3, 3
    );

    context.restore();
};

const drawGaugesForSwingState = swingState => {
    switch (swingState) {
        case SwingStates.IDLE:

            // go back to first frame of swing animation
            state.player.swing = 0;

            pointers.draw();
            break;

        case SwingStates.BACKSWING:
            power.draw(state.player.power);
            break;

        case SwingStates.DOWNSWING:
            power.draw(state.player.power);
            revert.draw(state.player.downSwing, state.player.power);
            break;

        case SwingStates.SPIN:

            state.player.spin += 2;

            if (state.player.spin > 100) {

                // spin gauge full, assume maximum slice
                setSpin();
            }

            power.draw(state.player.power);
            spin.draw(state.player.spin);
            break;

        case SwingStates.IMPACT:
            power.draw(state.player.power);
            spin.draw(state.player.spin);
            break;

        case SwingStates.FLIGHT:
        default:
            break;
    }
};

/**
 * Returns the key of the surface type found at the given position
 * @param {number} x - x position in bitmap pixels
 * @param {number} y - y position in bitmap pixels
 * @returns {string} key of SurfaceTypes
 */
const getSurfaceAt = (x, y) => {
    let surface = 'FAIRWAY';
    let outOfBounds = false;

    // check if the position didnt exceed the collision map boundaries
    if (x > 370 || y > 140) {
        return 'OUT';
    }

    // iterate over collision maps and see if there is a hit
    collisionMaps.forEach(collisionMap => {
        const mapId = collisionMap.collisionMap.id;

        if (collisionMap.checkHit(state.baseCollisionMap, { x, y }, images.filter(img => img.id === 'hole1')[0])) {
            if (mapId === 'OUT') {
                outOfBounds = true;
            } else {
                surface = mapId;
            }
        }
    });

    return outOfBounds ? 'OUT' : surface;
};

const drawPanels = () => {
    if (state.panels.left.visible) {
        if (state.panels.left.x < state.panels.left.endX) {
            state.panels.left.x += (state.panels.left.endX - state.panels.left.x) / 4;
        }

        // close gadget
        context.drawImage(
            images.filter(img => img.id === 'button-close-panel')[0].img,
            state.panels.left.x + state.panels.panelWidth - 5 ,275,
            11, 11
        );

        helpers.Canvas.addClickableContext(state.clickableContexts, 'close_panel_left', 130, 275, 10, 10, () => { state.panels.left.visible = false });

    } else {
        if (state.panels.left.x >= (state.panels.left.endX - state.panels.panelWidth)) {
            state.panels.left.x -= (state.panels.left.x - (state.panels.left.endX - state.panels.panelWidth)) / 4;
        }

        // open gadget
        context.save();
        context.translate(400,300);
        context.rotate(angleToRadians(180));
        context.drawImage(
            images.filter(img => img.id === 'button-close-panel')[0].img,
            260-state.panels.left.x - 5 ,10,
            11, 11
        );
        context.restore();

        // open gadget
        helpers.Canvas.addClickableContext(state.clickableContexts, 'open_panel_left', 0, 275, 10, 10, () => { state.panels.left.visible = true; });
    }

    if (state.panels.right.visible) {
        if (state.panels.right.x > state.panels.right.endX) {
            state.panels.right.x -= (state.panels.right.x - state.panels.right.endX) / 4;

            // unlike surface, miniMap keeps track of its own x,y so increment that here
            state.miniMap.x = state.panels.right.x;
        }

        // close gadget
        context.save();
        context.translate(400,300);
        context.rotate(angleToRadians(180));
        context.drawImage(
            images.filter(img => img.id === 'button-close-panel')[0].img,
            400-state.panels.right.x - 5 ,10,
            11, 11
        );
        context.restore();

        helpers.Canvas.addClickableContext(state.clickableContexts, 'close_panel_right', 660, 275, 10, 10, () => { state.panels.right.visible = false; });
    } else {
        if (state.panels.right.x < state.panels.right.endX + state.panels.panelWidth) {
            state.panels.right.x += ((state.panels.right.endX + state.panels.panelWidth) - state.panels.right.x) / 4;

            // unlike surface, miniMap keeps track of its own x,y so increment that here
            state.miniMap.x = state.panels.right.x;
        }

        // open gadget
        context.drawImage(
            images.filter(img => img.id === 'button-close-panel')[0].img,
            state.panels.right.x - 10 ,275,
            11, 11
        );

        helpers.Canvas.addClickableContext(state.clickableContexts, 'open_panel_right', 790, 275, 10, 10, () => { state.panels.right.visible = true; });
    }
};

const drawPanelContent = (panel, orientation) => {
    context.save();

    switch (orientation) {
        case 'left':

            context.translate(panel.x, 0);

            // selected club
            const selectedClub = state.clubTypes.filter(club => club.id === state.player.selectedClub)[0];
            context.fillRect(10, 20, 114, 62);
            club.draw(selectedClub.imageId, 12, 22);

            context.globalAlpha = .75;

            helpers.Type.positionedText({ context, color: '#ffffff', font: `bold 13.5px Arial`, text: `DISTANCE: ${selectedClub.distance}M`, x: 10, y: 98 });

            // club select
            helpers.Type.positionedText({ context, color: '#ffffff', font: `bold 16.8px Arial`, text: "SELECT CLUB", x: 10, y: 145 });

            state.clubTypes.forEach((club, index) => {
                context.fillStyle = club.id === state.player.selectedClub ? '#FFDF4D' : "#ff9c01";
                context.fillRect(10, 155 + (index * 34), 115, 30);
                context.fillStyle = "#ffffff";
                context.fillRect(10, 155 + (index * 34), 115, 2);
                helpers.Type.positionedText({ context, color: '#000000', font: `bold 20px Teko`, text: club.label, x: 18, y: 178 + (index * 34) });

                // todo: this shouldnt happen every tick
                helpers.Canvas.addClickableContext(state.clickableContexts, club.id, 0, 155 + (index * 34), 115, 30, () => {
                    state.player.selectedClub = club.id;
                });
            });

            break;
        case 'right':
            context.translate(panel.x, 0);

            context.globalAlpha = .75;

            // white
            context.fillRect(10, 20, 114, 62);

            // blue
            context.fillStyle = "#4186C4";
            context.fillRect(12, 22, 110, 29);

            // gradient green
            context.translate(12, 51);
            const grd = context.createLinearGradient(0,0,0,29);
            grd.addColorStop(0,"#538B54");
            grd.addColorStop(1,"#2D650C");
            context.fillStyle = grd;
            context.fillRect(0, 0, 110, 29);

            // golfer sprite
            context.fillStyle = "#eeeeee";
            context.fillRect(10, -9, 2, 1);
            context.fillStyle = "#cc0000";
            context.fillRect(10, -8, 2, 5);
            context.fillStyle = "#333399";
            context.fillRect(10, -5, 2, 5);

            // flag pole
            context.fillStyle = "#dddddd";
            context.fillRect(100, -10, 2, 10);
            context.fillStyle = "#cc0000";
            context.fillRect(102, -10, 5, 2);

            context.translate(-12, -51);

            // distance to flag
            helpers.Type.positionedText({ context, font: "13px Arial", text: `${parseInt(state.statistics.distanceToFlag)} METERS LEFT`, x: 10, y: 97 });

            // ball impact point
            helpers.Type.positionedText({ context, color: '#ffffff', font: `bold 14.7px Arial`, text: "BALL IMPACT", x: 10, y: 145 });

            ball.draw(10, 155, 115, 115);

            // todo: this shouldnt happen every tick
            const ballImpactStartX = panel.x;
            const ballImpactStartY = 210;

            helpers.Canvas.addClickableContext(state.clickableContexts, 'ballImpact', ballImpactStartX, ballImpactStartY, 135, 60, () => {
                state.player.impactX = (event.clientX - document.getElementById("canvas").offsetLeft) - ballImpactStartX;
                state.player.impactY = (event.clientY - document.getElementById("canvas").offsetTop) - ballImpactStartY;
                console.log('set impact at ', state.player.impactX, state.player.impactY)
            });

            break;
        default:
            break;
    }

    context.restore();
};

/**
 * Returns distance to flag in bitmap pixels
 */
const getDistanceToFlag = (x1, y1, x2, y2) => {
    let a = x1 - x2;
    let b = y1 - y2;

    return Math.sqrt( a*a + b*b );
};

/**
 * Perform all timely actions required for the current scene
 */
const update = () => {

    // time passed since the previous frame in seconds (capped, so a hiccup or inactive tab does not result in a jump)
    const now = performance.now();
    const dt = Math.min((now - lastFrameTime) / 1000, .05);
    lastFrameTime = now;

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
            helpers.Type.positionedText({ context, text: state.audioEnabled ? '[x] enable music ' : '[  ] enable music', y: 140 });
            helpers.Type.positionedText({ context, text: state.panels.keepPanelsOpen ? '[x] keep panels open ' : '[  ] keep panels open', y: 200 });
            helpers.Type.positionedText({ context, text: "< Back to title", x: 20, y: 580 });

            break;

        case Scenes.PRELUDE:

            // add an offset to the projection to be able to have the projection vertically centered
            context.translate(0, -150);

            // draw double the number of slices since the projection is full height here to show the map
            drawBitmapSlices(600);

            // reset the projection offset
            context.translate(0, 150);

            // title
            helpers.Type.positionedText({ context, font: "50px Arial", text: "HOLE 1", y: 100 });

            // line
            context.fillStyle = "#ffffff";
            context.fillRect(40,130,720,2);

            // left
            helpers.Type.positionedText({ context, font: "bold 20px Arial", text: "Statistics", x: 40, y: 200 });
            helpers.Type.positionedText({ context, font: "bold 16px Arial", text: "Par", x: 40, y: 250 });
            helpers.Type.positionedText({ context, font: "16px Arial", text: "4", x: 120, y: 250 });
            helpers.Type.positionedText({ context, font: "bold 16px Arial", text: "Distance", x: 40, y: 290 });
            helpers.Type.positionedText({ context, font: "16px Arial", text: "425 meters", x: 120, y: 290 });
            helpers.Type.positionedText({ context, font: "bold 16px Arial", text: "Time", x: 40, y: 330 });
            helpers.Type.positionedText({ context, font: "16px Arial", text: "14:22", x: 120, y: 330 });
            helpers.Type.positionedText({ context, font: "bold 16px Arial", text: "Weather", x: 40, y: 370 });
            helpers.Type.positionedText({ context, font: "16px Arial", text: "Sunny with mild winds", x: 120, y: 370 });

            // right
            helpers.Type.positionedText({ context, font: "bold 20px Arial", text: "Advice", x: 500, y: 200 });
            helpers.Type.positionedText({ context, font: "16px Arial", text: "Long par 4 slight dog leg to the left.", x: 500, y: 250 });
            helpers.Type.positionedText({ context, font: "16px Arial", text: "Tee shot positioned to the right half", x: 500, y: 280 });
            helpers.Type.positionedText({ context, font: "16px Arial", text: "of the fairway gives better angle and", x: 500, y: 310 });
            helpers.Type.positionedText({ context, font: "16px Arial", text: "flatter lie for the second shot, which ", x: 500, y: 340 });
            helpers.Type.positionedText({ context, font: "16px Arial", text: "plays again longer than it appears.", x: 500, y: 370 });

            // button
            context.fillStyle = "#ff9c01";
            context.fillRect(670,520,90,40);
            context.fillStyle = "#ffffff";
            context.globalAlpha = .8;
            context.fillRect(670,520,90,2);
            context.globalAlpha = .8;
            helpers.Type.positionedText({ context, color: '#000000', font: `bold 20px Arial`, text: "START", x: 684, y: 547 });

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

            // move the ball before anything is drawn (the surface look-ups use the canvas as a scratchpad)
            if (flight) {
                updateBallFlight(dt);
            }

            sky.draw(Skies.BLUE, state, true, true);

            // prevent visible projection corners
            context.fillColor = "#17411D";
            context.fillRect(-400,300,1600,300);

            drawBitmapSlices();

            panel.draw(state.panels.left, 'left');
            panel.draw(state.panels.right, 'right');

            drawPanels();

            surface.draw(state.collision, state.panels.panelWidth + state.panels.left.x + 20);// connected to left panel, plus some margin

            // change the wind direction every so often
            if (parseInt(30 * Math.random()) === 1) {
                state.statistics.wind.direction = state.statistics.wind.direction + (10 - (20 * Math.random()));
            }

            // change the wind speed every so often
            if (parseInt(10 * Math.random()) === 1) {
                state.statistics.wind.speed = state.statistics.wind.speed + (2 - (4 * Math.random()));

                if (state.statistics.wind.speed < 0) {
                    state.statistics.wind.speed = 0;
                }
            }

            // connected to right panel, minus its own width and some margin
            wind.draw(state.panels.right.x - 62 - 20, state.statistics.wind.direction, state.statistics.wind.speed, state.player.angle);

            statistics.draw(state.statistics.stroke, state.statistics.par);
            miniMap.draw(state.player, state.miniMap, state.panels.right.x, state.miniMap.y);

            drawPanelContent(state.panels.left, 'left');
            drawPanelContent(state.panels.right, 'right');

            // ball flight animation
            if (flight) {
                if (state.panels.right.visible) {
                    drawBallFlightFromSide();
                }
            } else {

                // when not in ball flight, update distance
                const currentHole = state.holes.filter(hole => hole.id = state.statistics.hole)[0];
                state.statistics.distanceToFlag = normaliseDistanceToFlag(getDistanceToFlag(state.player.x, state.player.y, currentHole.flagX, currentHole.flagY));
            }

            // gauges and their logic
            drawGaugesForSwingState(state.swingState);

            // draw golfer (except when in flight or bouncing)
            if (state.swingState !== SwingStates.FLIGHT && state.swingState !== SwingStates.BOUNCE) {
                golfer.draw(state.player);
            }

            // draw in game texts
            if (inGameTexts.length > 0) {
                inGameTexts.forEach((inGameText ,index) => {

                    // check if timeout exceeded
                    if (inGameText.startTimer >= state.inGameTextTimeOut) {
                        inGameTexts.splice(index, 1);
                    }

                    inGameText.draw();
                })
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
    if (state.showRasterLines) {
        helpers.Canvas.rasterLines(context);
    }

    requestAnimationFrame(() => {
        update();
    });
};

// init loading visuals outside of image creation loop so it doesnt need to wait for the whole library to be loaded
const ballImage = new Image();
ballImage.onload = () => { ball = new Ball(context, ballImage) };
ballImage.src = 'assets/ball.png';

initialiseImages();
initialiseSounds();

// call the updater
update();
