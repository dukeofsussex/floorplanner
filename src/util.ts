/*
const defaultTestFloorplan = {
    name: 'Default floorplan',
    description: 'Just a default floorplan',
    floors: [
        {
            image: 'https://i.imgur.com/Y9cDiqE.png',
            name: 'Riverside Main Floor',
            description: 'Just some random wacky description',
            areas: [
                {
                    uid: 'ajf9v0',
                    points: [{ x: 52, y: 92 }, { x: 50, y: 151 }, { x: 123, y: 149 }, { x: 125, y: 91 }],
                    name: 'Back stairwell',
                    description: 'Stairs',
                    hoverDescription: 'Hover \'n stuff',
                }, {
                    uid: 'ufnf12',
                    points: [{ x: 450, y: 250 }, { x: 700, y: 250 }, { x: 700, y: 275 }, { x: 450, y: 275 }],
                    name: 'Some botched bridge stairwell',
                    description: 'Woopsee',
                    hoverDescription: 'Fucked this one right up',
                },
            ],
        },
    ],
};
*/

import { Floorplan } from '@/models';

const Key = 'floorplanner:floorplan';

export const Storage = {
    load: (): Floorplan | null => {
        const floorplan = localStorage.getItem(Key);
        return floorplan === null ? null : JSON.parse(floorplan);
    },
    save: (floorplan: Floorplan) => localStorage.setItem(Key, JSON.stringify(floorplan)),
};

export function generateUID() {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';

    for (let i = 0; i < 5; i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}
