import * as d3 from 'd3';
import { Area, Point } from './object';


const MARGIN = {
    TOP: 0,
    RIGHT: 0,
    BOTTOM: 0,
    LEFT: 0,
};

export default class Polygon {
    constructor(svgElement, handlePolygonSelection) {
        const self = this;

        this.svgElement = svgElement;
        this.handlePolygonSelection = handlePolygonSelection;

        this.svg = d3.select(svgElement);

        this.dimensions = this.svg.node().getBoundingClientRect();

        this.width = this.dimensions.width - MARGIN.LEFT - MARGIN.RIGHT;
        this.height = this.dimensions.height - MARGIN.TOP - MARGIN.BOTTOM;

        this.drawingPoints = [];
        this.selectedAreaIndex = -1;

        this.svg.attr('width', this.width + MARGIN.LEFT + MARGIN.RIGHT)
            .attr('height', this.height + MARGIN.TOP + MARGIN.BOTTOM);

        this.graph = this.svg.append('g')
            .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

        this.graph.append('rect')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('fill', 'transparent');

        this.graph.on('click', function () {
            if (self.selectedAreaIndex !== -1) {
                self.addPolygonPoint(d3.mouse(this));
            } else {
                self.draw(d3.mouse(this));
            }
        }).on('mousemove', function () {
            if (self.selectedAreaIndex !== -1 || self.drawingPoints.length === 0) {
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
            .attr('class', 'tooltip')
            .style('opacity', 0);
    }

    addPolygonPoint(coords) {
        const newPoint = new Point(Math.round(coords[0]), Math.round(coords[1]));
        const selectedArea = this.areas[this.selectedAreaIndex];
        let index = 0;
        let shortestDistance = this.width;

        if (selectedArea.points.length > 2) {
            for (let i = 1; i < selectedArea.points.length; i++) {
                const distance = this.distanceFromLine(newPoint, selectedArea.points[i - 1], selectedArea.points[i]);
                const intersectionPoint = this.getClosestPointOnLine(newPoint, selectedArea.points[i - 1], selectedArea.points[i]);

                if (distance < shortestDistance && this.pointIsBetween(intersectionPoint, selectedArea.points[i - 1], selectedArea.points[i])) {
                    index = i;
                    shortestDistance = distance;
                }
            }

            const distance = this.distanceFromLine(newPoint, selectedArea.points[selectedArea.points.length - 1], selectedArea.points[0]);
            const intersectionPoint = this.getClosestPointOnLine(newPoint, selectedArea.points[selectedArea.points.length - 1], selectedArea.points[0]);

            if (distance < shortestDistance && this.pointIsBetween(intersectionPoint, selectedArea.points[selectedArea.points.length - 1], selectedArea.points[0])) {
                index = selectedArea.points.length;
                shortestDistance = distance;
            }

            selectedArea.points = [
                ...selectedArea.points.slice(0, index),
                newPoint,
                ...selectedArea.points.slice(index)
            ];
        } else {
            selectedArea.points.push(newPoint);
        }

        this.drawAreas(this.areas);
    }

    draw(coords) {
        if (d3.event.target.hasAttribute('is-handle')) {
            return this.closePolygon();
        }

        this.drawingPoints.push(new Point(Math.round(coords[0]), Math.round(coords[1])));

        this.polygonDrawingGroup.select('line').remove();
        this.polygonDrawingGroup.select('polyline').remove();
        const polyline = this.polygonDrawingGroup.append('polyline')
            .attr('points', () => this.drawingPoints.map((d) => [d.x, d.y].join(',')).join(' '));

        const circles = this.polygonDrawingGroup
            .selectAll('circle')
            .data(this.drawingPoints, (d) => d.x + '#' + d.y);

        circles.enter()
            .append('circle')
            .attr('cx', (d, i) => this.drawingPoints[i].x)
            .attr('cy', (d, i) => this.drawingPoints[i].y)
            .attr('r', 4)
            .attr('is-handle', 'true');

        circles.exit().remove();
    }

    closePolygon() {
        this.areas.push(new Area({ points: this.drawingPoints }));
        this.selectedAreaIndex = this.areas.length - 1;
        this.polygonDrawingGroup.selectAll('*').remove();
        this.drawingPoints = [];
        this.drawAreas(this.areas);
        this.handlePolygonSelection(this.areas[this.selectedAreaIndex]);
    }

    drawAreas(areas) {
        const self = this;
        this.areas = areas;

        const areasGroup = this.areasGroup.selectAll('g.area')
            .data(areas, (d) => d.uid);

        areasGroup.exit().remove();

        const individualAreaGroup = areasGroup.enter()
            .append('g')
            .merge(areasGroup)
            .attr('class', 'area');

        const polygon = individualAreaGroup.selectAll('polygon')
            .data((d) => [d.points]);

        polygon.exit().remove();

        polygon.enter()
            .append('polygon')
            .merge(polygon)
            .attr('points', (d) => d.map((d) => [d.x, d.y].join(',')).join(' '))
            .on('click', (d, i, j) => {
                d3.event.stopPropagation();
                const index = areas.findIndex((a) => a.uid === d3.select(j[i].parentNode).datum().uid);
                this.selectedAreaIndex = (this.selectedAreaIndex === index) ? -1 : index;
                this.drawAreas(areas);
                this.handlePolygonSelection(d3.select(j[i].parentNode).datum());
            });

        const circles = individualAreaGroup.selectAll('circle')
            .data((d, i) => i === this.selectedAreaIndex ? d.points : [], (d) => d.x + '#' + d.y);

        circles.enter()
            .append('circle')
            .merge(circles)
            .attr('r', 4)
            .attr('cx', (d) => d.x)
            .attr('cy', (d) => d.y)
            .on('click', (d, i, j) => {
                d3.event.stopPropagation();
                const parentAreaPoints = d3.select(j[i].parentNode).datum().points;

                const index = parentAreaPoints.findIndex((p) => p.x === d.x && p.y === d.y);

                if (index === parentAreaPoints.length) {
                    parentAreaPoints.pop();
                } else if (index === 0) {
                    parentAreaPoints.shift();
                } else {
                    parentAreaPoints.splice(index, 1);
                }

                this.drawAreas(areas);
            })
            .call(d3.drag()
                .on('start', function (d) {
                    d3.select(this).classed('active', true);
                })
                .on('drag', function (d) {
                    d3.select(this)
                        .attr('cx', d.x = d3.event.x)
                        .attr('cy', d.y = d3.event.y);
                    self.drawAreas(areas);
                })
                .on('end', function (d) {
                    d3.select(this).classed('active', false);
                }));

        circles.exit().remove();
    }

    

    distance(lineStartPoint, lineEndPoint) {
        return Math.sqrt(Math.pow(lineEndPoint.x - lineStartPoint.x, 2) + Math.pow(lineEndPoint.y - lineStartPoint.y, 2));
    }

    distanceFromLine(point, lineStartPoint, lineEndPoint) {
        return Math.abs((lineEndPoint.y - lineStartPoint.y) * point.x
            - (lineEndPoint.x - lineStartPoint.x) * point.y
            + (lineEndPoint.x * lineStartPoint.y)
            - (lineEndPoint.y * lineStartPoint.x))
            / this.distance(lineStartPoint, lineEndPoint);
    }

    pointIsBetween(point, lineStartPoint, lineEndPoint) {
        return (Math.round(this.distance(lineStartPoint, point)) + Math.round(this.distance(point, lineEndPoint))) <= (Math.round(this.distance(lineStartPoint, lineEndPoint)) + 1)
            && (Math.round(this.distance(lineStartPoint, point)) + Math.round(this.distance(point, lineEndPoint))) >= (Math.round(this.distance(lineStartPoint, lineEndPoint)) - 1);
    }

    getClosestPointOnLine(point, lineStartPoint, lineEndPoint) {
        const distance = ((point.x - lineStartPoint.x) * (lineEndPoint.x - lineStartPoint.x) + (point.y - lineStartPoint.y) * (lineEndPoint.y - lineStartPoint.y))
            / (Math.pow(lineEndPoint.x - lineStartPoint.x, 2) + Math.pow(lineEndPoint.y - lineStartPoint.y, 2));
        return {
            x: lineStartPoint.x + distance * (lineEndPoint.x - lineStartPoint.x),
            y: lineStartPoint.y + distance * (lineEndPoint.y - lineStartPoint.y)
        };
    }
}
