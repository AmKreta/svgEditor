import { PAGES } from '../../actions/pages/pages.interface';
import { happyNewYear } from './happyNewYear';
import { loveStory } from './loveStory';
import { trainLoop } from './trainLoop';

export const demoProjectIds = ['demo-happy-new-year', 'demo-love-story', 'demo-train-loop'];

let demos: PAGES[] | null = null;

/** The example animations shown on the landing page, built on first use. */
export function getDemoProjects(): PAGES[] {
    if (!demos) {
        demos = [happyNewYear(), loveStory(), trainLoop()];
    }
    return demos;
}

export function getDemoProject(id: string): PAGES | undefined {
    return getDemoProjects().find(demo => demo.id === id);
}
