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

import { Floor, Point } from '@/models';

const Key = 'floorplanner:floorplan';

export const Storage = {
    load: (): Floor[] | null => {
        const floors = localStorage.getItem(Key);
        return floors === null ? null : JSON.parse(floors);
    },
    save: (floors: Floor[]) => localStorage.setItem(Key, JSON.stringify(floors)),
};

export function distance(lineStart: Point, lineEnd: Point) {
    return Math.sqrt(((lineEnd.x - lineStart.x) ** 2) + ((lineEnd.y - lineStart.y) ** 2));
}

export function distanceFromLine(point: Point, lineStart: Point, lineEnd: Point) {
    return Math.abs((((lineEnd.y - lineStart.y) * point.x)
        - ((lineEnd.x - lineStart.x) * point.y))
        + ((lineEnd.x * lineStart.y)
            - (lineEnd.y * lineStart.x)))
        / distance(lineStart, lineEnd);
}

export function generateUID() {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';

    for (let i = 0; i < 5; i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

export function getClosestPointOnLine(point: Point, lineStart: Point, lineEnd: Point) {
    const dist = (((point.x - lineStart.x) * (lineEnd.x - lineStart.x))
        + ((point.y - lineStart.y) * (lineEnd.y - lineStart.y)))
        / (((lineEnd.x - lineStart.x) ** 2) + ((lineEnd.y - lineStart.y) ** 2));

    return {
        x: lineStart.x + (dist * (lineEnd.x - lineStart.x)),
        y: lineStart.y + (dist * (lineEnd.y - lineStart.y)),
    };
}

export function getMousePosition(svg: SVGSVGElement, event: MouseEvent) {
    const refPoint = svg.createSVGPoint();

    refPoint.x = event.clientX;
    refPoint.y = event.clientY;

    return refPoint.matrixTransform(svg.getScreenCTM()!.inverse());
}

export function pointIsBetween(point: Point, lineStart: Point, lineEnd: Point) {
    return (Math.round(distance(lineStart, point)) + Math.round(distance(point, lineEnd)))
        <= (Math.round(distance(lineStart, lineEnd)) + 1)
        && (Math.round(distance(lineStart, point)) + Math.round(distance(point, lineEnd)))
        >= (Math.round(distance(lineStart, lineEnd)) - 1);
}
