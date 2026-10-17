import { AVAILABLE_SHAPES } from '../../shapes/availableShapes';
import {
    all, buildDemo, centredX, CHANGE, fadeTo, heartPoints, moveBy, random, scaleTo, shapes, TrackBuilder, verticalGradient
} from './builder';

type POINT = [number, number];

const STEPS = 6;
const STEP_LENGTH = 0.5;
const STEP_DISTANCE = 60;
const WALK_START = 1;

/** A simple figure; returns its shapes and its legs so walking can swing them. */
function figure(name: string, x: number, colors: { skin: string, outfit: string, dark: string, hair: string }, dress: boolean) {
    const parts: AVAILABLE_SHAPES[] = [];
    const legs: Array<{ shape: AVAILABLE_SHAPES, hip: POINT }> = [];
    const arms: { [side: string]: AVAILABLE_SHAPES } = {};
    const limb = { stroke: colors.dark, strokeWidth: 6, strokeLinecap: 'round' as const };

    [[-8, 446], [8, 446]].forEach(([dx, hipY], i) => {
        const hip: POINT = [x + dx, hipY];
        const leg = shapes.line(`${name} leg ${i + 1}`, hip, [x + dx * 1.3, 478], limb);
        legs.push({ shape: leg, hip });
        parts.push(leg);
    });
    arms.left = shapes.line(`${name} left arm`, [x - 16, 398], [x - 26, 430], { ...limb, stroke: colors.skin });
    arms.right = shapes.line(`${name} right arm`, [x + 16, 398], [x + 26, 430], { ...limb, stroke: colors.skin });
    parts.push(arms.left, arms.right);
    parts.push(dress
        ? shapes.polygon(`${name} dress`, [[x - 20, 384], [x + 20, 384], [x + 34, 448], [x - 34, 448]], { fill: colors.outfit })
        : shapes.rect(`${name} shirt`, x - 20, 384, 40, 64, { fill: colors.outfit }, { rx: 14, ry: 14 }));
    parts.push(shapes.ellipse(`${name} hair`, x, dress ? 356 : 348, dress ? 27 : 23, dress ? 26 : 14, { fill: colors.hair }));
    parts.push(shapes.circle(`${name} head`, x, 360, 22, { fill: colors.skin }));
    // a little face, looking towards the middle of the scene
    const look = dress ? -4 : 4;
    parts.push(shapes.circle(`${name} eye 1`, x - 7 + look, 357, 2.6, { fill: '#2b1d17' }));
    parts.push(shapes.circle(`${name} eye 2`, x + 7 + look, 357, 2.6, { fill: '#2b1d17' }));
    parts.push(shapes.circle(`${name} blush 1`, x - 12 + look, 366, 4, { fill: '#ff8fab', fillOpacity: 0.55 }));
    parts.push(shapes.circle(`${name} blush 2`, x + 12 + look, 366, 4, { fill: '#ff8fab', fillOpacity: 0.55 }));
    parts.push(shapes.polyline(`${name} smile`, [[x - 5 + look, 368], [x + look, 371], [x + 5 + look, 368]], { stroke: '#7a2e3a', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }));
    return { parts, legs, arms };
}

/** A step: the whole figure moves and bobs while the legs swing the other way. */
function walkStep(who: ReturnType<typeof figure>, step: number, direction: 1 | -1): Array<[AVAILABLE_SHAPES, CHANGE]> {
    const bob = step % 2 === 0 ? -6 : 0;
    const legSwing = step % 2 === 0 ? 12 : -12;
    const legShapes = new Set(who.legs.map(l => l.shape.id));
    const changes: Array<[AVAILABLE_SHAPES, CHANGE]> = who.parts
        .filter(part => !legShapes.has(part.id))
        .map(part => [part, shape => ({ style: { translate: [shape.style.translate[0] + STEP_DISTANCE * direction, bob] } })] as [AVAILABLE_SHAPES, CHANGE]);
    who.legs.forEach(({ shape, hip }, i) => {
        const swing = (i === 0 ? legSwing : -legSwing) * direction;
        changes.push([shape, s => ({
            style: { translate: [s.style.translate[0] + STEP_DISTANCE * direction, bob] },
            points: [hip, [hip[0] + swing, 478]],
        })]);
    });
    return changes;
}

export function loveStory() {
    const rnd = random(14);

    // ---------- scene
    const sky = shapes.rect('Sky', 0, 0, 1100, 560, { fill: 'url(#love-day)' });
    const sunsetSky = shapes.rect('Sunset sky', 0, 0, 1100, 560, { fill: 'url(#love-sunset)', opacity: 0 });
    const sun = shapes.circle('Sun', 550, 250, 62, { fill: '#ffd36e' });
    const backHill = shapes.ellipse('Back hill', 250, 560, 540, 175, { fill: '#a8d5a2' });
    const frontHill = shapes.ellipse('Front hill', 860, 585, 580, 195, { fill: '#8cc58a' });
    const ground = shapes.rect('Ground', 0, 470, 1100, 90, { fill: '#7cb87a' });
    const trunk = shapes.rect('Tree trunk', 978, 320, 22, 160, { fill: '#7a5230' }, { rx: 6, ry: 6 });
    const canopy = [
        shapes.circle('Tree canopy', 989, 290, 68, { fill: '#5fa35a' }),
        shapes.circle('Tree canopy left', 940, 320, 44, { fill: '#6db567' }),
        shapes.circle('Tree canopy right', 1040, 318, 46, { fill: '#579c52' }),
    ];
    const blossoms: AVAILABLE_SHAPES[] = [];
    for (let i = 0; i < 9; i++) {
        blossoms.push(shapes.circle(`Blossom ${i + 1}`, 935 + rnd() * 110, 250 + rnd() * 90, 5, { fill: '#ff8fab' }));
    }
    const title = shapes.text('Title', 'A small love story', centredX('A small love story', 46, 550), 110, 46, { fill: '#7a2e3a' }, { fontStyle: 'italic' });
    const ending = shapes.text('Ending', 'Together, always', centredX('Together, always', 44, 550), 110, 44, { fill: '#ffffff' }, { fontStyle: 'italic' });

    const scene = new TrackBuilder('Scene', [sky, sunsetSky, sun, backHill, frontHill, ground, trunk, ...canopy, ...blossoms, title]);
    scene
        .cutscene('Title fades', 3.0, 3.6, { remove: [[title, 'fade']] })
        .cutscene('Sunset', 5.0, 10.0, { change: [[sunsetSky, fadeTo(0.9)], [sun, all(moveBy(0, 210), { fill: '#ff9248' })]] })
        .cutscene('The end', 10.0, 11.0, { ease: 'power2.out', add: [[ending, 'slideDown']] });

    // ---------- the two of them walk towards each other and meet in the middle
    const him = figure('Him', 150, { skin: '#f2c6a0', outfit: '#3b82f6', dark: '#1e3a8a', hair: '#3b2a20' }, false);
    const her = figure('Her', 950, { skin: '#f5cfae', outfit: '#ec4899', dark: '#9d174d', hair: '#5b3a29' }, true);
    const himTrack = new TrackBuilder('Him', him.parts);
    const herTrack = new TrackBuilder('Her', her.parts);
    for (let step = 0; step < STEPS; step++) {
        const start = WALK_START + step * STEP_LENGTH;
        const end = start + STEP_LENGTH;
        himTrack.cutscene(`Step ${step + 1}`, start, end, { ease: 'sine.inOut', change: walkStep(him, step, 1) });
        herTrack.cutscene(`Step ${step + 1}`, start, end, { ease: 'sine.inOut', change: walkStep(her, step, -1) });
    }
    const walked = STEPS * STEP_DISTANCE;
    const standStill = (who: ReturnType<typeof figure>): Array<[AVAILABLE_SHAPES, CHANGE]> =>
        who.legs.map(({ shape, hip }, i) => [shape, { points: [hip, [hip[0] + (i === 0 ? -2 : 2), 478]] }] as [AVAILABLE_SHAPES, CHANGE]);
    // they stop, straighten up and reach for each other's hand
    himTrack.cutscene('Hold hands', 4.2, 4.8, {
        change: [
            [him.parts, s => ({ style: { translate: [s.style.translate[0], 0] } })],
            ...standStill(him),
            [him.arms.right, { points: [[150 + 16, 398], [150 + 44, 404]] }],
        ],
    });
    herTrack.cutscene('Hold hands', 4.2, 4.8, {
        change: [
            [her.parts, s => ({ style: { translate: [s.style.translate[0], 0] } })],
            ...standStill(her),
            [her.arms.left, { points: [[950 - 16, 398], [950 - 44, 404]] }],
        ],
    });

    // ---------- a heart appears above them and beats
    const meetX = (150 + walked + 950 - walked) / 2;
    const heart = shapes.path('Heart', heartPoints(meetX, 268, 46), { fill: '#ef4444' });
    const heartTrack = new TrackBuilder('Heart', []);
    heartTrack.cutscene('Heart appears', 4.8, 5.6, { ease: 'back.out(1.7)', add: [[heart, 'zoom']] });
    for (let beat = 0; beat < 4; beat++) {
        const start = 5.6 + beat * 0.5;
        heartTrack.cutscene(`Beat ${beat + 1}`, start, start + 0.5, { ease: 'sine.inOut', change: [[heart, scaleTo(beat % 2 ? 1 : 1.18)]] });
    }

    // ---------- little hearts float up: each cutscene adds one while older ones rise and fade
    const floating = new TrackBuilder('Floating hearts', []);
    const little: AVAILABLE_SHAPES[] = [];
    for (let k = 0; k < 10; k++) {
        const start = 5.0 + k * 0.5;
        const x = meetX - 110 + rnd() * 220;
        const h = shapes.path(`Little heart ${k + 1}`, heartPoints(x, 360, 11), { fill: k % 2 ? '#fb7185' : '#f472b6' });
        little.push(h);
        const rise = (n: number) => all(moveBy(rnd() * 20 - 10, -70), fadeTo(1 - n * 0.3));
        floating.cutscene(`Float ${k + 1}`, start, start + 0.5, {
            ease: 'sine.out',
            add: [[h, 'zoom']],
            change: [
                ...(little[k - 1] ? [[little[k - 1], rise(1)] as [AVAILABLE_SHAPES, CHANGE]] : []),
                ...(little[k - 2] ? [[little[k - 2], rise(2)] as [AVAILABLE_SHAPES, CHANGE]] : []),
            ],
            remove: little[k - 3] ? [[little[k - 3], 'fade']] : [],
        });
    }
    floating.cutscene('Last hearts drift away', 10.0, 10.8, {
        remove: little.slice(-3).map(h => [h, 'fade'] as [AVAILABLE_SHAPES, 'fade']),
    });

    return buildDemo({
        id: 'demo-love-story',
        name: 'A Small Love Story',
        background: '#ffe9e3',
        posterTime: 6.2,
        colors: ['#ef4444', '#ec4899', '#3b82f6', '#ffd36e', '#8cc58a'],
        gradients: {
            'love-day': verticalGradient([['#bfe6ff', 0], ['#ffe4ec', 100]]),
            'love-sunset': verticalGradient([['#6a4c93', 0], ['#ff6a88', 55], ['#ffc48c', 100]]),
        },
        tracks: [scene, himTrack, herTrack, heartTrack, floating],
    });
}
