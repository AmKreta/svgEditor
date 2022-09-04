import skills from './Skills-0.json';
import introduction from './Introduction-0.json';
import experience from './Experience-0.json';
import projectInspiration from './Project Inspiration-0.json';
import foodCartSample from './Food-cart-0.json';

const projects = {
    introduction,
    skills,
    experience,
    projectInspiration,
    foodCartSample
}

export const personalProjectIds = Object.keys(projects).map(name => projects[name].id);

export default projects;