<template>
    <svg id="floor-graph"
         ref="floor"
         :viewBox="viewBox">
        <g transform="translate(0,0)">
            <rect fill="transparent"
                  height="100%"
                  width="100%"
                  @click="onClick"
                  @mousemove="onMouseMove" />
            <g class="areas">
                <g v-for="(area, index) in areas"
                   :key="area.uid"
                   :class="[ 'area', { 'active': area.uid === selectedAreaUid }]">
                    <polygon v-tooltip="{ content: `<h6>${area.name}</h6>${area.hoverDescription}`,
                                          classes: ['card'],
                                          offset: 5,
                                          placement: 'bottom',
                                          trigger: 'manual',
                                          show: !editing && tooltipUid === area.uid }"
                             :points="areaPolygonPoints[index]"
                             @click="selectArea(area.uid)"
                             @mousemove="onMouseMove"
                             @mouseover="onPolygonMouseOver(area.uid)"
                             @mouseout="onPolygonMouseOut" />
                    <template v-if="editing && selectedArea && selectedArea.uid === area.uid">
                        <circle v-for="point in area.points"
                                :key="`${point.x}-${point.y}`"
                                r="3"
                                :cx="point.x"
                                :cy="point.y"
                                @click="onCircleClick(point)"
                                @mousedown="onCircleMouseDown(point)"
                                @mousemove="onMouseMove"
                                @mouseup="onCircleMouseUp" />
                    </template>
                </g>
            </g>
            <g v-if="drawingPoints.length"
               class="polygon-drawing">
                <polyline :points="drawingPolygonPoints" />
                <circle v-for="point in drawingPoints"
                        :key="`${point.x}-${point.y}`"
                        r="4"
                        :cx="point.x"
                        :cy="point.y"
                        @click="closePolygon"
                        @mousemove="onMouseMove" />
                <line v-if="drawingPoints.length > 0"
                      :x1="drawingPoints[drawingPoints.length - 1].x"
                      :y1="drawingPoints[drawingPoints.length - 1].y"
                      :x2="mouse.x"
                      :y2="mouse.y" />
            </g>
        </g>
    </svg>
</template>

<script lang="ts">
    import {
        Component,
        Prop,
        PropSync,
        Vue,
    } from 'vue-property-decorator';
    import { VTooltip } from 'v-tooltip';
    import { Area, Point } from '@/models';
    import {
        distanceFromLine,
        getClosestPointOnLine,
        pointIsBetween,
        generateUID,
        getMousePosition,
    } from '@/util';

    @Component({
        directives: {
            tooltip: VTooltip,
        },
    })
    export default class TheViewCanvas extends Vue {
        @Prop({ default: false }) readonly editing!: boolean;

        @Prop({ default: '' }) readonly viewBox!: string;

        @PropSync('a', { default: () => [] }) areas!: Area[];

        @PropSync('aUid', { default: () => [] }) selectedAreaUid!: string;

        dragging = false;

        draggedPoint: Point = {
            x: 0,
            y: 0,
        };

        drawingPoints: Point[] = [];

        mouse: Point = {
            x: 0,
            y: 0,
        };

        tooltipUid = '';

        get areaPolygonPoints() {
            return this.areas
                .map(a => a.points.map(p => [p.x, p.y]
                    .join(','))
                    .join(' '));
        }

        get drawingPolygonPoints() {
            return this.drawingPoints.map(p => [p.x, p.y].join(','))
                .join(' ');
        }

        get selectedArea() {
            return this.areas.find(a => a.uid === this.selectedAreaUid);
        }

        selectArea(uid: string) {
            if (this.drawingPoints.length > 0) {
                return;
            }

            this.selectedAreaUid = uid === this.selectedAreaUid ? '' : uid;
        }

        onClick(event: MouseEvent) {
            if (!this.editing) {
                return;
            }

            const point = getMousePosition((this.$refs.floor as SVGSVGElement), event);

            if (this.selectedArea) {
               this.addPolygonPoint({ x: point.x, y: point.y });
               return;
            }

            this.drawingPoints.push({ x: point.x, y: point.y });
        }

        onMouseMove(event: MouseEvent) {
            if (!this.editing) {
                return;
            }

            const point = getMousePosition((this.$refs.floor as SVGSVGElement), event);

            this.mouse = { x: point.x, y: point.y };

            if (this.dragging) {
                this.draggedPoint.x = this.mouse.x;
                this.draggedPoint.y = this.mouse.y;
            }
        }

        onCircleClick(point: Point) {
            if (!this.selectedArea || this.selectedArea.points.length === 2) {
                return;
            }

            const index = this.selectedArea.points.findIndex(p => p.x === point.x && p.y === point.y);
            this.selectedArea.points.splice(index, 1);
        }

        onCircleMouseDown(point: Point) {
            this.dragging = true;
            this.draggedPoint = point;
        }

        onCircleMouseUp() {
            this.dragging = false;
        }

        onPolygonMouseOver(uid: string) {
            this.tooltipUid = uid;
        }

        onPolygonMouseOut() {
            this.tooltipUid = '';
        }

        addPolygonPoint(point: Point) {
            let index = 0;
            let shortestDistance = Number.MAX_VALUE;

            if (!this.selectedArea) {
                return;
            }

            if (this.selectedArea.points.length <= 2) {
                this.selectedArea.points.push(point);
                return;
            }

            const points = [...this.selectedArea.points, this.selectedArea.points[0]];

            for (let i = 1; i < points.length; i += 1) {
                const distance = distanceFromLine(
                    point,
                    points[i - 1],
                    points[i],
                );
                const intersectionPoint = getClosestPointOnLine(
                    point,
                    points[i - 1],
                    points[i],
                );

                if (
                    distance < shortestDistance
                    && pointIsBetween(
                        intersectionPoint,
                        points[i - 1],
                        points[i],
                    )
                ) {
                    index = i;
                    shortestDistance = distance;
                }
            }

            this.selectedArea.points = [
                ...this.selectedArea.points.slice(0, index),
                point,
                ...this.selectedArea.points.slice(index),
            ];
        }

        closePolygon() {
            if (this.drawingPoints.length < 3) {
                return;
            }

            const area = {
                name: `Area ${this.areas.length + 1}`,
                hoverDescription: '',
                description: '',
                points: this.drawingPoints,
                uid: generateUID(),
            };

            this.areas.push(area);
            this.drawingPoints = [];
            this.selectArea(area.uid);
        }
    }
</script>

<style lang="scss" scoped>
    $polygon-default: #007bff;
    $polygon-active: #28a745;

    circle {
        fill: $polygon-default;

        &:hover {
            cursor: move;
        }
    }

    .active {
        circle,
        polygon {
            fill: $polygon-active;
            stroke: $polygon-active;
        }
    }

    line {
        pointer-events: none;
        stroke: $polygon-default;
        stroke-width: 1;
    }

    polygon {
        fill: $polygon-default;
        fill-opacity: 0.15;
        stroke: $polygon-default;
        stroke-width: 1;

        &:hover {
            cursor: pointer;
        }
    }

    svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        user-select: none;
    }

    .polygon-drawing {
        circle {
            cursor: pointer;
        }

        polyline {
            fill: none;
            stroke: $polygon-default;
            pointer-events: none;
        }
    }

    ::v-deep .tooltip {
        opacity: 1;
    }
</style>
