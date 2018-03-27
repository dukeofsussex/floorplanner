import * as d3 from 'd3';
import { Area, Point } from './object';


const MARGIN = {
    TOP: 0,
    RIGHT: 0,
    BOTTOM: 0,
    LEFT: 0,
};

export default class Polygon {
    constructor(svgElement, handleAreaSelection) {
        const self = this;

        this.svgElement = svgElement;
        this.handleAreaSelection = handleAreaSelection;

        this.svg = d3.select(svgElement);

        this.dimensions = this.svg.node().getBoundingClientRect();

        this.width = this.dimensions.width - MARGIN.LEFT - MARGIN.RIGHT;
        this.height = this.dimensions.height - MARGIN.TOP - MARGIN.BOTTOM;

        this.drawingPoints = [];
        this.editing = false;
        this.selectedAreaIndex = -1;

        this.svg.attr('width', this.width + MARGIN.LEFT + MARGIN.RIGHT)
            .attr('height', this.height + MARGIN.TOP + MARGIN.BOTTOM);

        this.graph = this.svg.append('g')
            .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

        this.graph.append('rect')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', 'transparent');

        this.graph.on('click', function () {
            if (self.selectedAreaIndex !== -1 && self.editing) {
                self.addPolygonPoint(d3.mouse(this));
            } else if (self.editing) {
                self.draw(d3.mouse(this));
            }
        }).on('mousemove', function () {
            if (self.selectedAreaIndex !== -1 || self.drawingPoints.length === 0 || !self.editing) {
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

        this.drawAreas(this.areas, this.editing);
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
        this.drawAreas(this.areas, this.editing);
        this.handleAreaSelection(this.areas[this.selectedAreaIndex]);
    }

    drawAreas(areas, editing) {
        const self = this;
        this.areas = areas;
        this.editing = editing;

        const areasGroup = this.areasGroup.selectAll('g.area')
            .data(areas, (d) => d.uid);

        areasGroup.exit().remove();

        const individualAreaGroup = areasGroup.enter()
            .append('g')
            .merge(areasGroup)
            .attr('class', 'area');

        const polygon = individualAreaGroup.selectAll('polygon')
            .data((d, i) => {
                return [{ index: i, hoverDesc: d.hoverDescription, points: d.points }];
            });

        polygon.exit().remove();

        polygon.enter()
            .append('polygon')
            .merge(polygon)
            .attr('points', (d) => d.points.map((d) => [d.x, d.y].join(',')).join(' '))
            .attr('class', (d) => d.index === this.selectedAreaIndex ? 'active' : '')
            .on('click', (d, i, j) => {
                d3.event.stopPropagation();
                this.selectedAreaIndex = (this.selectedAreaIndex === d.index) ? -1 : d.index;
                this.drawAreas(areas, this.editing);
                this.handleAreaSelection(d3.select(j[i].parentNode).datum());
            })
            .on('mouseover', (d) => {
                if (this.editing) {
                    return;
                }

                this.tooltip.html(d.hoverDesc);
                this.tooltip.style('opacity', 1);
            })
            .on('mousemove', function (d) {
                if (this.editing) {
                    return;
                }

                const coords = d3.mouse(this);

                // self.tooltip.style('left', `${coords[0] + 15}px`) // 15 pixels for the row margin
                //     .style('top', `${coords[1] + (self.tooltip.node().getBoundingClientRect().height / 2)}px`);
                
                self.tooltip.style('left', `${coords[0] + 25}px`) // Rob version just sets it away from the corner
                    .style('top', `${coords[1] + 100}px`);
            })
            .on('mouseout', (d) => {
                if (this.editing) {
                    return;
                }

                this.tooltip.style('opacity', 0);
            });

        const circles = individualAreaGroup.selectAll('circle')
            .data((d, i) => this.editing && i === this.selectedAreaIndex ? d.points : [], (d) => d.x + '#' + d.y);

        circles.enter()
            .append('circle')
            .merge(circles)
            .attr('r', 4)
            .attr('cx', (d) => d.x)
            .attr('cy', (d) => d.y)
            .attr('class', 'active') // These circles are only drawn for the selected polygon
            .on('click', (d, i, j) => {
                d3.event.stopPropagation();
                const parentAreaPoints = d3.select(j[i].parentNode).datum().points;

                const index = parentAreaPoints.findIndex((p) => p.x === d.x && p.y === d.y);
                parentAreaPoints.splice(index, 1);

                this.drawAreas(areas, this.editing);
            })
            .call(d3.drag()
                .on('start', function (d) {
                    d3.select(this).classed('drag', true);
                })
                .on('drag', function (d) {
                    d3.select(this)
                        .attr('cx', d.x = d3.event.x)
                        .attr('cy', d.y = d3.event.y);
                    self.drawAreas(areas, self.editing);
                })
                .on('end', function (d) {
                    d3.select(this).classed('drag', false);
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
