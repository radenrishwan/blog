// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

import type { Project } from "./pages/project/index.astro";

export const SITE_TITLE = ' Raden Mohamad Rishwan';
export const SITE_DESCRIPTION = 'A personal blog about web development and programming';

export const projects: Project[] = [
    {
        title: 'Otakudesu',
        description: 'Unofficial otakudesu mobile app',
        repositories: 'https://github.com/radenrishwan/otakudesu',
        url: 'https://github.com/radenrishwan/otakudesu',
        technologies: ['golang', 'dart', 'flutter']
    },
    {
        title: 'Learnywhere',
        description: 'Learn anywhere and getting better than yesterday.',
        repositories: 'https://github.com/radenrishwan/learnywhere',
        url: 'https://github.com/radenrishwan/learnywhere',
        technologies: ['golang', 'dart', 'flutter']
    },
    {
        title: 'Crack The Roll',
        description: 'Simple apps to find out your favorite movies',
        repositories: 'https://github.com/radenrishwan/learnywhere',
        url: 'https://github.com/radenrishwan/crack-the-roll',
        technologies: ['dart', 'flutter']
    },
    {
        title: 'Gothon',
        description: 'Simple intepreter language using golang as interpreter',
        repositories: 'https://github.com/radenrishwan/gothon',
        url: 'https://github.com/radenrishwan/gothon',
        technologies: ['golang']
    },
]