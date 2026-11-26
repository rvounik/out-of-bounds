/**
 * Golf ball flight model: gravity, aerodynamic drag, spin lift (Magnus effect), wind, bounce and roll.
 *
 * Units are SI (metres, seconds, radians). The horizontal plane uses the same axes as the player position in the
 * game: a heading of angle a points along (sin a, cos a), and 'right of travel' is (-cos a, sin a). z points up.
 *
 * This module has no dependency on the canvas or the game state so it can be tuned / tested in isolation.
 */

// physical constants
const GRAVITY = 9.81; // m/s2
const AIR_DENSITY = 1.225; // kg/m3
const BALL_MASS = 0.04593; // kg
const BALL_RADIUS = 0.02135; // m
const BALL_AREA = Math.PI * BALL_RADIUS * BALL_RADIUS;

// drag and lift acceleration are both (K * coefficient * airspeed squared)
const K = (AIR_DENSITY * BALL_AREA) / (2 * BALL_MASS);

// tuning
export const STEP = 1 / 240; // integration step in seconds
const SPIN_DECAY = 0.04; // fraction of spin lost per second in the air
const MIN_BOUNCE_SPEED = 1; // m/s, below this vertical speed the ball stops bouncing and starts rolling
const REST_SPEED = 0.15; // m/s, below this rolling speed the ball is considered at rest
const SURFACE_SAMPLE_INTERVAL = 0.2; // seconds between surface look-ups while rolling
const MAX_SIMULATION_TIME = 40; // seconds, safety net for simulate()

export const Phases = {
    AIR: 'air',
    ROLL: 'roll',
    REST: 'rest'
};

/**
 * How each surface treats a ball that lands or rolls on it
 * restitution: fraction of vertical speed kept on a bounce
 * retain: fraction of horizontal speed kept on a bounce
 * rollDeceleration: m/s2 lost while rolling
 */
export const Surfaces = {
    FAIRWAY: { restitution: .4, retain: .7, rollDeceleration: 2.5 },
    MID: { restitution: .3, retain: .55, rollDeceleration: 5 },
    ROUGH: { restitution: .2, retain: .4, rollDeceleration: 9 },
    SAND: { restitution: .05, retain: .15, rollDeceleration: 20 },
    OUT: { restitution: .2, retain: .4, rollDeceleration: 9 }
};

/**
 * Drag coefficient of a dimpled ball, rising with spin ratio (surface speed / airspeed)
 */
const dragCoefficient = spinRatio => Math.min(.5, .21 + .3 * spinRatio);

/**
 * Lift coefficient of a spinning dimpled ball. Grows quickly at low spin ratios, then saturates
 */
const liftCoefficient = spinRatio => Math.min(.3, .45 * Math.pow(spinRatio, .4));

/**
 * Create a ball that just left the club face
 * @param {Object} cfg - the configuration object
 * @param {number} cfg.x - start x in metres
 * @param {number} cfg.y - start y in metres
 * @param {number} cfg.heading - aim direction in radians
 * @param {Object} cfg.club - club with launchSpeed (m/s), launchAngle (degrees) and backspin (rpm)
 * @param {number} cfg.power - swing power (value between 0 - 1)
 * @param {number} [cfg.spinTilt = 0] - tilt of the spin axis in radians. positive curves right (slice), negative left (hook)
 * @returns {Object} ball
 */
export const createBall = ({ x, y, heading, club, power, spinTilt = 0 }) => {
    const speed = club.launchSpeed * power;
    const elevation = club.launchAngle * Math.PI / 180;
    const horizontalSpeed = speed * Math.cos(elevation);

    return {
        x,
        y,
        z: 0,
        vx: horizontalSpeed * Math.sin(heading),
        vy: horizontalSpeed * Math.cos(heading),
        vz: speed * Math.sin(elevation),
        spin: club.backspin * (2 * Math.PI / 60) * power, // rad/s
        tilt: spinTilt,
        phase: Phases.AIR,
        surface: 'FAIRWAY',
        bounces: 0,
        time: 0,
        surfaceTimer: 0
    };
};

/**
 * Advance the ball by one time step
 * @param {Object} ball - ball as returned by createBall (mutated)
 * @param {Object} wind - velocity of the air in m/s ({ x, y })
 * @param {number} dt - time step in seconds
 * @param {Function} surfaceAt - (x, y) => key of Surfaces for that position
 */
export const stepBall = (ball, wind, dt, surfaceAt) => {
    if (ball.phase === Phases.REST) {
        return;
    }

    ball.time += dt;

    if (ball.phase === Phases.AIR) {

        // velocity relative to the air: this is what drag and lift act on, and how wind enters the model
        const rx = ball.vx - wind.x;
        const ry = ball.vy - wind.y;
        const rz = ball.vz;
        const airSpeed = Math.sqrt(rx * rx + ry * ry + rz * rz);

        let ax = 0;
        let ay = 0;
        let az = -GRAVITY;

        if (airSpeed > .01) {
            const spinRatio = ball.spin * BALL_RADIUS / airSpeed;
            const drag = K * dragCoefficient(spinRatio) * airSpeed;

            // drag opposes the motion through the air
            ax -= drag * rx;
            ay -= drag * ry;
            az -= drag * rz;

            const ux = rx / airSpeed;
            const uy = ry / airSpeed;
            const uz = rz / airSpeed;
            const horizontal = Math.sqrt(ux * ux + uy * uy);

            if (horizontal > .001) {
                const lift = K * liftCoefficient(spinRatio) * airSpeed * airSpeed;
                const back = lift * Math.cos(ball.tilt); // backspin part pushes 'up', perpendicular to the motion
                const side = lift * Math.sin(ball.tilt); // sidespin part pushes sideways (hook / slice)

                ax += back * (-uz * ux / horizontal) + side * (-uy / horizontal);
                ay += back * (-uz * uy / horizontal) + side * (ux / horizontal);
                az += back * horizontal;
            }
        }

        ball.vx += ax * dt;
        ball.vy += ay * dt;
        ball.vz += az * dt;
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;
        ball.z += ball.vz * dt;
        ball.spin *= 1 - SPIN_DECAY * dt;

        // touched the ground
        if (ball.z <= 0 && ball.vz < 0) {
            const key = surfaceAt(ball.x, ball.y);
            const surface = Surfaces[key] || Surfaces.FAIRWAY;

            // backspin makes the ball 'bite': the more spin is left, the less forward speed survives the bounce
            const bite = Math.min(.35, ball.spin / 3000);
            const retain = Math.max(0, surface.retain - bite);

            ball.z = 0;
            ball.vx *= retain;
            ball.vy *= retain;
            ball.vz = -ball.vz * surface.restitution;
            ball.spin *= .3;
            ball.tilt = 0;
            ball.bounces++;
            ball.surface = key;

            if (ball.vz < MIN_BOUNCE_SPEED) {
                ball.vz = 0;
                ball.phase = Phases.ROLL;
                ball.surfaceTimer = 0;
            }
        }

        return;
    }

    // rolling: check every so often what the ball is rolling over
    ball.surfaceTimer += dt;

    if (ball.surfaceTimer >= SURFACE_SAMPLE_INTERVAL) {
        ball.surfaceTimer = 0;
        ball.surface = surfaceAt(ball.x, ball.y);
    }

    const surface = Surfaces[ball.surface] || Surfaces.FAIRWAY;
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    const newSpeed = speed - surface.rollDeceleration * dt;

    if (newSpeed <= REST_SPEED) {
        ball.vx = 0;
        ball.vy = 0;
        ball.surface = surfaceAt(ball.x, ball.y);
        ball.phase = Phases.REST;

        return;
    }

    ball.vx *= newSpeed / speed;
    ball.vy *= newSpeed / speed;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
};

/**
 * Run a ball until it comes to rest
 * @param {Object} ball - ball as returned by createBall (mutated)
 * @param {Object} wind - velocity of the air in m/s ({ x, y })
 * @param {Function} surfaceAt - (x, y) => key of Surfaces for that position
 * @param {Function} [onStep] - called with the ball after every step
 * @returns {Object} the ball at rest
 */
export const simulate = (ball, wind, surfaceAt, onStep) => {
    while (ball.phase !== Phases.REST && ball.time < MAX_SIMULATION_TIME) {
        stepBall(ball, wind, STEP, surfaceAt);

        if (onStep) {
            onStep(ball);
        }
    }

    return ball;
};

/**
 * Find the launch speed at which a full-power, straight shot on a windless fairway travels exactly the distance
 * configured for the club (carry plus roll). This keeps the club distances the single source of truth
 * @param {Object} club - club with distance (m), launchAngle (degrees) and backspin (rpm)
 * @returns {number} launch speed in m/s
 */
export const calibrateLaunchSpeed = club => {
    const noWind = { x: 0, y: 0 };
    const fairway = () => 'FAIRWAY';
    let low = 1;
    let high = 120;

    for (let iteration = 0; iteration < 30; iteration++) {
        const launchSpeed = (low + high) / 2;
        const ball = simulate(
            createBall({ x: 0, y: 0, heading: 0, club: { ...club, launchSpeed }, power: 1 }),
            noWind,
            fairway
        );

        if (ball.y < club.distance) {
            low = launchSpeed;
        } else {
            high = launchSpeed;
        }
    }

    return (low + high) / 2;
};
