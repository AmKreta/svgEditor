import { AVAILABLE_SHAPES } from '../../shapes/availableShapes';
import {
    all, buildDemo, fadeTo, moveBy, radialGradient, random, rotateBy, scaleTo, shapes, TrackBuilder, verticalGradient
} from './builder';

const DURATION = 10;
const RAIL_Y = 458;
/** the train starts fully off-screen left and ends fully off-screen right, so the loop is seamless */
const TRAIN_START_X = -560;
const TRAVEL = 1710;

export function trainLoop() {
    const rnd = random(7);

    // ---------- scenery
    const sky = shapes.rect('Sky', 0, 0, 1100, 560, { fill: 'url(#train-sky)' });
    const sunGlow = shapes.circle('Sun glow', 930, 110, 120, { fill: 'url(#train-sun-glow)' });
    const sun = shapes.circle('Sun', 930, 110, 46, { fill: '#ffd34d' });
    const farMountains = shapes.polygon('Far mountains', [
        [0, 330], [120, 220], [230, 300], [360, 175], [500, 305], [640, 195], [780, 300], [900, 205], [1100, 320], [1100, 560], [0, 560],
    ], { fill: '#a7c7e7' });
    const snowCaps = [[360, 175], [640, 195], [900, 205]].map(([x, y], i) =>
        shapes.polygon(`Snow cap ${i + 1}`, [[x - 34, y + 34], [x, y], [x + 34, y + 34], [x + 12, y + 26], [x - 10, y + 30]], { fill: '#f4f8ff' }));
    const nearHills = shapes.polygon('Near hills', [
        [0, 385], [160, 285], [300, 360], [460, 265], [620, 372], [780, 295], [960, 372], [1100, 305], [1100, 560], [0, 560],
    ], { fill: '#86bf8d' });
    const meadow = shapes.rect('Meadow', 0, 405, 1100, 155, { fill: '#6cae54' });

    const trees: AVAILABLE_SHAPES[] = [];
    [[60, 418], [150, 412], [880, 414], [975, 420], [1060, 412], [600, 410]].forEach(([x, base], i) => {
        const h = 70 + rnd() * 30;
        trees.push(shapes.rect(`Tree ${i + 1} trunk`, x - 5, base - 20, 10, 22, { fill: '#6b4226' }));
        trees.push(shapes.polygon(`Tree ${i + 1}`, [[x - 30, base - 16], [x, base - h], [x + 30, base - 16]], { fill: i % 2 ? '#2f7d4a' : '#2a6f42' }));
        trees.push(shapes.polygon(`Tree ${i + 1} top`, [[x - 22, base - h * 0.55], [x, base - h - 18], [x + 22, base - h * 0.55]], { fill: '#3b9159' }));
    });

    const ballast = shapes.rect('Ballast', 0, 466, 1100, 20, { fill: '#a1887f' });
    const sleepers: AVAILABLE_SHAPES[] = [];
    for (let x = 4; x < 1100; x += 34) {
        sleepers.push(shapes.rect(`Sleeper ${sleepers.length + 1}`, x, RAIL_Y + 2, 18, 9, { fill: '#6d4c41' }, { rx: 2, ry: 2 }));
    }
    const rail = shapes.rect('Rail', 0, RAIL_Y, 1100, 5, { fill: '#5f6368' });
    const foreground = shapes.rect('Foreground grass', 0, 486, 1100, 74, { fill: '#5b9a42' });
    const flowers: AVAILABLE_SHAPES[] = [];
    for (let i = 0; i < 26; i++) {
        flowers.push(shapes.circle(`Flower ${i + 1}`, 20 + rnd() * 1060, 500 + rnd() * 50, 3 + rnd() * 2, {
            fill: ['#ffd166', '#ff8fab', '#ffffff', '#c77dff'][i % 4],
        }));
    }

    const clouds: AVAILABLE_SHAPES[] = [];
    [[160, 90, 1], [470, 60, 0.8], [720, 120, 1.1]].forEach(([x, y, k], i) => {
        clouds.push(shapes.ellipse(`Cloud ${i + 1}`, x, y + 14 * k, 70 * k, 22 * k, { fill: '#ffffff', fillOpacity: 0.95 }));
        clouds.push(shapes.circle(`Cloud ${i + 1} puff`, x - 22 * k, y, 26 * k, { fill: '#ffffff', fillOpacity: 0.95 }));
        clouds.push(shapes.circle(`Cloud ${i + 1} top`, x + 14 * k, y - 8 * k, 32 * k, { fill: '#ffffff', fillOpacity: 0.95 }));
    });

    const scenery = new TrackBuilder('Scenery', [
        sky, sunGlow, sun, farMountains, ...snowCaps, nearHills, meadow, ...clouds, ...trees,
        ballast, ...sleepers, rail,
    ]);
    // clouds drift and come back, the sun glow breathes; both end where they started for the loop
    scenery
        .cutscene('Drift', 0.1, DURATION / 2, { change: [[clouds, moveBy(60)], [sunGlow, scaleTo(1.15)]] })
        .cutscene('Drift back', DURATION / 2, DURATION, { change: [[clouds, moveBy(-60)], [sunGlow, scaleTo(1)]] });

    // ---------- train
    const x0 = TRAIN_START_X;
    const body: AVAILABLE_SHAPES[] = [];
    const spokes: AVAILABLE_SHAPES[] = [];
    const wheel = (name: string, cx: number, r: number) => {
        const cy = RAIL_Y - r;
        body.push(shapes.circle(name, cx, cy, r, { fill: '#2b2b2b' }));
        spokes.push(shapes.line(`${name} spoke`, [cx - r + 3, cy], [cx + r - 3, cy], { stroke: '#cfd8dc', strokeWidth: 3 }));
        spokes.push(shapes.line(`${name} spoke 2`, [cx, cy - r + 3], [cx, cy + r - 3], { stroke: '#cfd8dc', strokeWidth: 3 }));
        body.push(shapes.circle(`${name} hub`, cx, cy, 4, { fill: '#eceff1' }));
    };
    const carriage = (name: string, x: number, color: string, roof: string) => {
        body.push(shapes.rect(`${name} roof`, x - 5, 372, 160, 12, { fill: roof }, { rx: 6, ry: 6 }));
        body.push(shapes.rect(`${name}`, x, 380, 150, 62, { fill: color }, { rx: 8, ry: 8 }));
        for (let i = 0; i < 3; i++) {
            body.push(shapes.rect(`${name} window ${i + 1}`, x + 14 + i * 46, 392, 30, 22, { fill: '#fff7d6' }, { rx: 4, ry: 4 }));
        }
        body.push(shapes.rect(`${name} stripe`, x, 425, 150, 6, { fill: '#ffffff', fillOpacity: 0.55 }));
        body.push(shapes.rect(`${name} coupler`, x + 150, 428, 15, 6, { fill: '#444444' }));
    };
    carriage('Rear carriage', x0, '#f2a541', '#a8661c');
    wheel('Rear carriage wheel 1', x0 + 32, 14);
    wheel('Rear carriage wheel 2', x0 + 118, 14);
    carriage('Carriage', x0 + 165, '#e85d5d', '#8e3b3b');
    wheel('Carriage wheel 1', x0 + 197, 14);
    wheel('Carriage wheel 2', x0 + 283, 14);

    const e = x0 + 330;
    body.push(shapes.rect('Engine boiler', e, 392, 130, 50, { fill: '#2f6fb5' }, { rx: 10, ry: 10 }));
    body.push(shapes.rect('Boiler band', e + 70, 392, 8, 50, { fill: '#245a94' }));
    body.push(shapes.circle('Steam dome', e + 60, 392, 13, { fill: '#f1c40f' }));
    body.push(shapes.rect('Chimney', e + 90, 352, 20, 42, { fill: '#333333' }, { rx: 3, ry: 3 }));
    body.push(shapes.rect('Chimney top', e + 84, 346, 32, 10, { fill: '#222222' }, { rx: 3, ry: 3 }));
    body.push(shapes.rect('Cab roof', e - 6, 352, 74, 12, { fill: '#163a63' }, { rx: 6, ry: 6 }));
    body.push(shapes.rect('Cab', e, 360, 62, 82, { fill: '#1f4f85' }, { rx: 6, ry: 6 }));
    body.push(shapes.rect('Cab window', e + 12, 372, 38, 26, { fill: '#fff7d6' }, { rx: 4, ry: 4 }));
    body.push(shapes.polygon('Cowcatcher', [[e + 130, 436], [e + 190, RAIL_Y - 2], [e + 130, RAIL_Y - 2]], { fill: '#c0392b' }));
    body.push(shapes.circle('Headlight', e + 136, 404, 7, { fill: '#ffe066' }));
    wheel('Engine drive wheel', e + 30, 18);
    wheel('Engine wheel 1', e + 82, 14);
    wheel('Engine wheel 2', e + 115, 14);

    const train = new TrackBuilder('Train', [...body, ...spokes]);
    train.cutscene('Ride across', 0.1, DURATION, {
        ease: 'none',
        change: [
            [body, moveBy(TRAVEL)],
            // spokes roll with the train: one turn per wheel circumference travelled
            ...spokes.map(spoke => [spoke, all(moveBy(TRAVEL), rotateBy(Math.round(TRAVEL / (2 * Math.PI * 15) * 360)))] as [AVAILABLE_SHAPES, ReturnType<typeof all>]),
        ],
    });

    // ---------- smoke: each cutscene puffs from the chimney while older puffs rise, grow and fade
    const smoke = new TrackBuilder('Smoke', []);
    const puffs: AVAILABLE_SHAPES[] = [];
    const step = 0.6;
    for (let k = 0, t = 0.1; t + step <= DURATION + 1e-6; k++, t += step) {
        const chimneyX = e + 100 + TRAVEL * (t - 0.1) / (DURATION - 0.1);
        const puff = shapes.circle(`Smoke puff ${k + 1}`, chimneyX, 334, 12, { fill: '#f7f7f7', fillOpacity: 0.95 });
        puffs.push(puff);
        const rise = (n: number) => all(moveBy(-26, -40), { radius: 12 + n * 10 }, fadeTo(1 - n * 0.28));
        smoke.cutscene(`Puff ${k + 1}`, Math.round(t * 100) / 100, Math.round((t + step) * 100) / 100, {
            add: [[puff, 'zoom']],
            change: [
                ...(puffs[k - 1] ? [[puffs[k - 1], rise(1)] as [AVAILABLE_SHAPES, ReturnType<typeof all>]] : []),
                ...(puffs[k - 2] ? [[puffs[k - 2], rise(2)] as [AVAILABLE_SHAPES, ReturnType<typeof all>]] : []),
            ],
            remove: puffs[k - 3] ? [[puffs[k - 3], 'fade']] : [],
        });
    }

    // ---------- birds flap across, starting and ending off-screen
    const birdTrack = new TrackBuilder('Birds', []);
    const wingsUp = (x: number, y: number): [number, number][] => [[x - 12, y - 7], [x, y], [x + 12, y - 7]];
    const wingsDown = (x: number, y: number): [number, number][] => [[x - 12, y + 4], [x, y], [x + 12, y + 4]];
    const flock = [[-60, 150], [-100, 175], [-140, 140]].map(([x, y], i) =>
        shapes.polyline(`Bird ${i + 1}`, wingsUp(x, y), { stroke: '#37474f', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }));
    birdTrack.cutscene('Birds arrive', 0.1, 0.2, { add: flock.map(b => [b, 'none'] as [AVAILABLE_SHAPES, 'none']) });
    const flaps = 19;
    for (let i = 0; i < flaps; i++) {
        const start = 0.2 + i * 0.5;
        birdTrack.cutscene(`Flap ${i + 1}`, Math.round(start * 100) / 100, Math.round(Math.min(DURATION, start + 0.5) * 100) / 100, {
            ease: 'sine.inOut',
            change: flock.map((bird, b) => {
                const [x, y] = [[-60, 150], [-100, 175], [-140, 140]][b];
                return [bird, all(moveBy(68, i % 2 ? 6 : -6), { points: i % 2 ? wingsUp(x, y) : wingsDown(x, y) })] as [AVAILABLE_SHAPES, ReturnType<typeof all>];
            }),
        });
    }

    // foreground last so it's drawn in front of the wheels' lower edge
    const front = new TrackBuilder('Foreground', [foreground, ...flowers]);

    return buildDemo({
        id: 'demo-train-loop',
        name: 'Train Loop',
        background: '#bfe3ff',
        loop: true,
        posterTime: 4.6,
        colors: ['#2f6fb5', '#e85d5d', '#f2a541', '#6cae54', '#ffd34d'],
        gradients: {
            'train-sky': verticalGradient([['#6fbcf0', 0], ['#cdeeff', 65], ['#ffe8c7', 100]]),
            'train-sun-glow': radialGradient([['#fff4c2', 0, 1], ['#ffd76a', 45, 0.55], ['#ffd76a', 100, 0]]),
        },
        tracks: [scenery, birdTrack, train, smoke, front],
    });
}
