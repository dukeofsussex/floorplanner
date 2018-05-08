import * as d3 from 'd3';
import { Area, Point } from '../../models';

const MARGIN = {
    TOP: 0,
    RIGHT: 0,
    BOTTOM: 0,
    LEFT: 0,
};

export default {
    name: 'floorGraph',
    data: function () {
        return {
            drawingPoints: [],
        }
    },
    props: ['editing', 'floor', 'selectedArea', 'onAreaSelection'],
    mounted: function () {
        this.init();
        this.drawAreas(this.floor.areas);
    },
    watch: {
        floor: {
            handler: function (newFloor, oldFloor) {
                if (newFloor.areas && newFloor.areas.length > 0) {
                    this.reflectChanges();
                    this.drawAreas(newFloor.areas);
                }
            },
            deep: true,
        },
        editing: function () {
            this.reflectChanges();
            this.drawAreas(this.areas);
        },
        selectedArea: function () {
            this.reflectChanges();
            this.drawAreas(this.areas);
        },
    },
    methods: {
        init: function () {
            const self = this;

            const svg = d3.select(this.$refs.floor);

            this.dimensions = svg.node().getBoundingClientRect();

            this.width = this.dimensions.width - MARGIN.LEFT - MARGIN.RIGHT;
            this.height = this.dimensions.height - MARGIN.TOP - MARGIN.BOTTOM;

            svg.attr('width', this.width + MARGIN.LEFT + MARGIN.RIGHT)
                .attr('height', this.height + MARGIN.TOP + MARGIN.BOTTOM);

            this.graph = svg.append('g')
                .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

            this.graph.append('rect')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('fill', 'transparent');

            this.graph.on('click', function click() {
                if (self.selectedArea.uid !== '' && self.editing) {
                    self.addPolygonPoint(d3.mouse(this));
                } else if (self.editing) {
                    self.draw(d3.mouse(this));
                }
            }).on('mousemove', function mousemove() {
                if (self.selectedArea.uid !== '' || self.drawingPoints.length === 0 || !self.editing) {
                    return;
                }

                self.polygonDrawingGroup.select('line').remove();

                self.polygonDrawingGroup.append('line')
                    .attr('x1', self.drawingPoints[self.drawingPoints.length - 1].x)
                    .attr('y1', self.drawingPoints[self.drawingPoints.length - 1].y)
                    .attr('x2', d3.mouse(this)[0])
                    .attr('y2', d3.mouse(this)[1]);
            });

            this.polygonDrawingGroup = this.graph.append('g')
                .attr('class', 'polygon-drawing');

            this.areasGroup = this.graph.append('g')
                .attr('class', 'areas');

            this.tooltip = d3.select('body')
                .append('div')
                .attr('id', 'tooltip')
                .attr('class', 'card')
                .style('opacity', 0);
        },
        addPolygonPoint: function (coords) {
            const newPoint = new Point(Math.round(coords[0]), Math.round(coords[1]));
            let index = 0;
            let shortestDistance = this.width;

            if (this.selectedArea.points.length > 2) {
                for (let i = 1; i < this.selectedArea.points.length; i += 1) {
                    const distance = this.distanceFromLine(newPoint, this.selectedArea.points[i - 1], this.selectedArea.points[i]);
                    const intersectionPoint = this.getClosestPointOnLine(newPoint, this.selectedArea.points[i - 1], this.selectedArea.points[i]);

                    if (distance < shortestDistance && this.pointIsBetween(intersectionPoint, this.selectedArea.points[i - 1], this.selectedArea.points[i])) {
                        index = i;
                        shortestDistance = distance;
                    }
                }

                const distance = this.distanceFromLine(newPoint, this.selectedArea.points[this.selectedArea.points.length - 1], this.selectedArea.points[0]);
                const intersectionPoint = this.getClosestPointOnLine(
                    newPoint,
                    this.selectedArea.points[this.selectedArea.points.length - 1],
                    this.selectedArea.points[0]);

                if (distance < shortestDistance
                    && this.pointIsBetween(intersectionPoint, this.selectedArea.points[this.selectedArea.points.length - 1], this.selectedArea.points[0])) {
                    index = this.selectedArea.points.length;
                    shortestDistance = distance;
                }

                this.selectedArea.points = [
                    ...this.selectedArea.points.slice(0, index),
                    newPoint,
                    ...this.selectedArea.points.slice(index),
                ];
            } else {
                this.selectedArea.points.push(newPoint);
            }

            this.drawAreas(this.areas, this.editing);
        },
        draw: function (coords) {
            if (d3.event.target.hasAttribute('is-handle')) {
                this.closePolygon();
                return;
            }

            this.drawingPoints.push(new Point(Math.round(coords[0]), Math.round(coords[1])));

            this.polygonDrawingGroup.select('line').remove();
            this.polygonDrawingGroup.select('polyline').remove();
            this.polygonDrawingGroup.append('polyline')
                .attr('points', () => this.drawingPoints.map(p => [p.x, p.y].join(',')).join(' '));

            const circles = this.polygonDrawingGroup
                .selectAll('circle')
                .data(this.drawingPoints, d => `${d.x}#${d.y}`);

            circles.enter()
                .append('circle')
                .attr('cx', (d, i) => this.drawingPoints[i].x)
                .attr('cy', (d, i) => this.drawingPoints[i].y)
                .attr('r', 4)
                .attr('is-handle', 'true');

            circles.exit().remove();
        },
        closePolygon: function () {
            this.areas.push(new Area({ points: this.drawingPoints }));
            this.polygonDrawingGroup.selectAll('*').remove();
            this.drawingPoints = [];
            this.drawAreas(this.areas, this.editing);
            this.onAreaSelection(this.areas[this.areas.length - 1]);
        },
        drawAreas: function (areas) {
            const self = this;
            this.areas = areas;

            const areasGroup = this.areasGroup.selectAll('g.area')
                .data(areas, d => d.uid);

            areasGroup.exit().remove();

            const individualAreaGroup = areasGroup.enter()
                .append('g')
                .merge(areasGroup)
                .attr('class', 'area');

            const polygon = individualAreaGroup.selectAll('polygon')
                .data(d => [{ uid: d.uid, name: d.name, hoverDesc: d.hoverDescription, points: d.points }]);

            polygon.exit().remove();

            polygon.enter()
                .append('polygon')
                .merge(polygon)
                .attr('points', d => d.points.map(p => [p.x, p.y].join(',')).join(' '))
                .attr('class', d => {
                    const activePolygon = d.uid === this.selectedArea.uid;
                    return activePolygon ? 'active' : '';
                })
                .on('click', (d, i, j) => {
                    d3.event.stopPropagation();
                    this.drawAreas(areas, this.editing);
                    this.onAreaSelection(d3.select(j[i].parentNode).datum());
                })
                .on('mouseover', (d) => {
                    if (this.editing) {
                        return;
                    }

                    this.tooltip.html(`<h6>${d.name}</h6>${d.hoverDesc}`);
                    this.tooltip.style('opacity', 1);
                })
                .on('mousemove', function mousemove() {
                    if (this.editing) {
                        return;
                    }

                    self.tooltip.style('left', `${d3.event.clientX + 15}px`) // Rob version just sets it away from the corner
                        .style('top', `${d3.event.clientY - 10}px`);
                })
                .on('mouseout', () => {
                    if (this.editing) {
                        return;
                    }

                    this.tooltip.style('opacity', 0);
                });

            const circles = individualAreaGroup.selectAll('circle')
                .data(d => {
                    const showCircles = this.editing && d.uid === this.selectedArea.uid;
                    return showCircles ? d.points : [];
                }, c => `${c.x}#${c.y}`);

            circles.enter()
                .append('circle')
                .merge(circles)
                .attr('r', 4)
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('class', 'active') // These circles are only drawn for the selected polygon
                .on('click', (d, i, j) => {
                    d3.event.stopPropagation();
                    const parentAreaPoints = d3.select(j[i].parentNode).datum().points;

                    // Don't remove the last circle from an area
                    if (parentAreaPoints.length === 1) {
                        return;
                    }

                    const index = parentAreaPoints.findIndex(p => p.x === d.x && p.y === d.y);
                    parentAreaPoints.splice(index, 1);

                    this.drawAreas(areas, this.editing);
                })
                .call(d3.drag()
                    .on('start', function start() {
                        d3.select(this).classed('drag', true);
                    })
                    .on('drag', function drag(d) {
                        const point = d;
                        d3.select(this)
                            .attr('cx', point.x = d3.event.x)
                            .attr('cy', point.y = d3.event.y);
                        self.drawAreas(areas, self.editing);
                    })
                    .on('end', function end() {
                        d3.select(this).classed('drag', false);
                    }));

            circles.exit().remove();
        },
        distance: function (lineStartPoint, lineEndPoint) {
            return Math.sqrt(((lineEndPoint.x - lineStartPoint.x) ** 2) + ((lineEndPoint.y - lineStartPoint.y) ** 2));
        },
        distanceFromLine: function (point, lineStartPoint, lineEndPoint) {
            return Math.abs((((lineEndPoint.y - lineStartPoint.y) * point.x)
                - ((lineEndPoint.x - lineStartPoint.x) * point.y))
                + ((lineEndPoint.x * lineStartPoint.y)
                    - (lineEndPoint.y * lineStartPoint.x)))
                / this.distance(lineStartPoint, lineEndPoint);
        },
        pointIsBetween: function (point, lineStartPoint, lineEndPoint) {
            return (Math.round(this.distance(lineStartPoint, point)) + Math.round(this.distance(point, lineEndPoint)))
                <= (Math.round(this.distance(lineStartPoint, lineEndPoint)) + 1)
                && (Math.round(this.distance(lineStartPoint, point)) + Math.round(this.distance(point, lineEndPoint)))
                >= (Math.round(this.distance(lineStartPoint, lineEndPoint)) - 1);
        },
        getClosestPointOnLine: function (point, lineStartPoint, lineEndPoint) {
            const distance = (((point.x - lineStartPoint.x) * (lineEndPoint.x - lineStartPoint.x))
                + ((point.y - lineStartPoint.y) * (lineEndPoint.y - lineStartPoint.y)))
                / (((lineEndPoint.x - lineStartPoint.x) ** 2) + ((lineEndPoint.y - lineStartPoint.y) ** 2));
            return {
                x: lineStartPoint.x + (distance * (lineEndPoint.x - lineStartPoint.x)),
                y: lineStartPoint.y + (distance * (lineEndPoint.y - lineStartPoint.y)),
            };
        },
        reflectChanges: function () {
            this.drawingPoints = [];
            this.polygonDrawingGroup
                .selectAll('*')
                .remove();
        },
    }
}
