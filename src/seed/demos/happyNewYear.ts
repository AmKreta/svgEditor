import { AVAILABLE_SHAPES } from '../../shapes/availableShapes';
import {
    all, buildDemo, centredX, fadeTo, fillTo, moveBy, random, scaleTo, shapes, TrackBuilder, verticalGradient
} from './builder';

const FIREWORK_LENGTH = 2.4;
/** the new year after the current one */
const YEAR = String(new Date().getFullYear() + 1);

interface FIREWORK {
    at: number;
    x: number;
    y: number;
    color: string;
}

/** Rocket rises, bursts into sparks that fly outwards and fade, then everything clears. */
function addFirework(track: TrackBuilder, { at, x, y, color }: FIREWORK, index: number, rnd: () => number) {
    const r2 = (n: number) => Math.round(n * 100) / 100;
    const rocket = shapes.circle(`Rocket ${index}`, x, 560, 3.5, { fill: color });
    const flash = shapes.circle(`Burst ${index}`, x, y, 26, { fill: color, fillOpacity: 0.35 });
    const glow = { cssFilters: { dropShadow: [{ xOffset: 0, yOffset: 0, blur: 6, color }] } };
    const sparks: AVAILABLE_SHAPES[] = [];
    // an outer ring and a smaller inner ring of sparks
    const count = 16;
    const inner = 8;
    for (let i = 0; i < count + inner; i++) {
        sparks.push(shapes.circle(`Spark ${index}.${i + 1}`, x, y, i < count ? 5 : 4, { fill: i % 4 === 0 ? '#ffffff' : color, ...glow }));
    }
    const reach = 105 + rnd() * 30;
    track
        .cutscene(`Launch ${index}`, r2(at), r2(at + 0.05), { add: [[rocket, 'none']] })
        .cutscene(`Rise ${index}`, r2(at + 0.05), r2(at + 0.95), { ease: 'power2.out', change: [[rocket, moveBy(0, y - 560)]] })
        .cutscene(`Burst ${index}`, r2(at + 0.95), r2(at + 1.15), {
            remove: [[rocket, 'fade']],
            add: [[flash, 'zoom'], ...sparks.map(s => [s, 'zoom'] as [AVAILABLE_SHAPES, 'zoom'])],
        })
        .cutscene(`Sparkle ${index}`, r2(at + 1.15), r2(at + 2.3), {
            ease: 'power3.out',
            change: [
                [flash, all(scaleTo(2.4), fadeTo(0))],
                ...sparks.map((spark, i) => {
                    const ring = i < count ? { n: count, at: i, distance: reach } : { n: inner, at: i - count + 0.5, distance: reach * 0.5 };
                    const angle = (ring.at / ring.n) * Math.PI * 2;
                    // a little gravity pulls the sparks down as they spread
                    return [spark, all(moveBy(Math.cos(angle) * ring.distance, Math.sin(angle) * ring.distance + 22), fadeTo(0.45), { radius: 2.5 })] as [AVAILABLE_SHAPES, ReturnType<typeof all>];
                }),
            ],
        })
        .cutscene(`Clear ${index}`, r2(at + 2.3), r2(at + FIREWORK_LENGTH), {
            remove: [[flash, 'none'], ...sparks.map(s => [s, 'fade'] as [AVAILABLE_SHAPES, 'fade'])],
        });
}

export function happyNewYear() {
    const rnd = random(2027);

    // ---------- night city
    const sky = shapes.rect('Night sky', 0, 0, 1100, 560, { fill: 'url(#nye-sky)' });
    const moon = shapes.circle('Moon', 960, 92, 34, { fill: '#fdf3c7' });
    const moonShadow = shapes.circle('Moon shadow', 974, 82, 30, { fill: '#0e1533' });
    const stars: AVAILABLE_SHAPES[] = [];
    for (let i = 0; i < 46; i++) {
        stars.push(shapes.circle(`Star ${i + 1}`, rnd() * 1100, rnd() * 330, 0.8 + rnd() * 1.6, { fill: '#ffffff', opacity: 0.35 + rnd() * 0.65 }));
    }
    const buildings: AVAILABLE_SHAPES[] = [];
    const windows: AVAILABLE_SHAPES[] = [];
    for (let x = -10, i = 1; x < 1100; i++) {
        const w = 60 + rnd() * 60;
        const h = 90 + rnd() * 150;
        const top = 530 - h;
        buildings.push(shapes.rect(`Building ${i}`, x, top, w, h + 30, { fill: i % 2 ? '#141a3a' : '#1b2250' }));
        for (let wy = top + 14; wy < 510; wy += 22) {
            for (let wx = x + 10; wx < x + w - 14; wx += 18) {
                if (rnd() < 0.32) {
                    windows.push(shapes.rect(`Window ${windows.length + 1}`, wx, wy, 8, 11, { fill: '#ffd86b', opacity: 0.55 + rnd() * 0.45 }));
                }
            }
        }
        x += w + 6;
    }
    const river = shapes.rect('River', 0, 530, 1100, 30, { fill: '#0a0d22' });

    const city = new TrackBuilder('Night city', [sky, moon, moonShadow, ...stars, ...buildings, ...windows, river]);
    // stars twinkle in two alternating groups
    const evens = stars.filter((_, i) => i % 2 === 0);
    const odds = stars.filter((_, i) => i % 2 === 1);
    [[0.1, 2.5], [2.5, 5], [5, 7.5], [7.5, 10.6]].forEach(([start, end], i) => {
        city.cutscene(`Twinkle ${i + 1}`, start, end, {
            change: [[i % 2 ? evens : odds, fadeTo(0.25)], [i % 2 ? odds : evens, fadeTo(1)]],
        });
    });

    // ---------- countdown
    const digit = (n: string) => shapes.text(`Countdown ${n}`, n, centredX(n, 190, 550), 340, 190, { fill: '#ffffff' });
    const [three, two, one] = ['3', '2', '1'].map(digit);
    const countdown = new TrackBuilder('Countdown', []);
    countdown
        .cutscene('Three', 0.5, 1.1, { ease: 'back.out(1.7)', add: [[three, 'zoom']] })
        .cutscene('Two', 1.5, 2.1, { ease: 'back.out(1.7)', remove: [[three, 'fade']], add: [[two, 'zoom']] })
        .cutscene('One', 2.5, 3.1, { ease: 'back.out(1.7)', remove: [[two, 'fade']], add: [[one, 'zoom']] })
        .cutscene('Midnight', 3.5, 3.9, { remove: [[one, 'zoom']] });

    // ---------- fireworks, spread over as many timelines as needed so bursts can overlap
    const fireworks: FIREWORK[] = [
        { at: 3.6, x: 550, y: 160, color: '#ffd166' },
        { at: 4.3, x: 290, y: 200, color: '#ff6b9a' },
        { at: 4.9, x: 820, y: 185, color: '#5ee7f7' },
        { at: 6.3, x: 420, y: 140, color: '#c77dff' },
        { at: 7.0, x: 700, y: 150, color: '#ffd166' },
        { at: 7.6, x: 200, y: 225, color: '#5ee7f7' },
        { at: 8.2, x: 905, y: 210, color: '#ff6b9a' },
    ];
    const fireworkTracks: Array<{ track: TrackBuilder, freeAt: number }> = [];
    fireworks.forEach((fw, i) => {
        let lane = fireworkTracks.find(l => l.freeAt <= fw.at);
        if (!lane) {
            lane = { track: new TrackBuilder(`Fireworks ${fireworkTracks.length + 1}`, []), freeAt: 0 };
            fireworkTracks.push(lane);
        }
        addFirework(lane.track, fw, i + 1, rnd);
        lane.freeAt = fw.at + FIREWORK_LENGTH;
    });

    // ---------- greeting
    const textGlow = (color: string, blur: number) => ({ cssFilters: { dropShadow: [{ xOffset: 0, yOffset: 0, blur, color }] } });
    const greeting = shapes.text('Happy New Year', 'HAPPY NEW YEAR', centredX('HAPPY NEW YEAR', 74, 550), 315, 74, { fill: '#ffd166', ...textGlow('rgba(255, 209, 102, .55)', 14) });
    const year = shapes.text('Year', YEAR, centredX(YEAR, 112, 550), 435, 112, { fill: '#ffffff', ...textGlow('rgba(7, 11, 31, .9)', 10) });
    const wish = shapes.text('Wish', 'Cheers to new beginnings', centredX('Cheers to new beginnings', 26, 550), 490, 26, { fill: '#e0e7ff', ...textGlow('rgba(7, 11, 31, 1)', 6) }, { fontWeight: 500 });
    const greet = new TrackBuilder('Greeting', []);
    greet
        .cutscene('Greeting', 4.0, 4.9, { ease: 'back.out(1.7)', add: [[greeting, 'zoom']] })
        .cutscene('Year', 5.0, 5.8, { ease: 'power3.out', add: [[year, 'slideDown']] })
        .cutscene('Glow', 6.0, 6.8, { change: [[year, all(fillTo('#ffd166'), scaleTo(1.08))]] })
        .cutscene('Settle', 6.8, 7.6, { change: [[year, scaleTo(1)]] })
        .cutscene('Wish', 8.0, 9.0, { add: [[wish, 'fade']] });

    return buildDemo({
        id: 'demo-happy-new-year',
        name: 'Happy New Year',
        background: '#0b1026',
        posterTime: 5.9,
        colors: ['#ffd166', '#ff6b9a', '#5ee7f7', '#c77dff', '#ffffff'],
        gradients: {
            'nye-sky': verticalGradient([['#070b1f', 0], ['#141c4a', 65], ['#3b2a6b', 100]]),
        },
        tracks: [city, ...fireworkTracks.map(l => l.track), countdown, greet],
    });
}
