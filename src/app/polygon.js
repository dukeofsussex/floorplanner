import * as d3 from 'd3';

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

        this.selectedAreaIndex = -1;

        this.svg.attr('width', this.width + MARGIN.LEFT + MARGIN.RIGHT)
            .attr('height', this.height + MARGIN.TOP + MARGIN.BOTTOM);

        this.graph = this.svg.append('g')
            .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

        this.plain = this.graph.append('rect')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('fill', 'transparent')
            .on('click', function () {
                self.addPolygonPoint(d3.mouse(this));
            });

        this.areasGroup = this.graph.append('g')
            .attr('class', 'areas');

        this.tooltip = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);
    }

    addPolygonPoint(coords) {
        const newPoint = {
            x: Math.round(coords[0]),
            y: Math.round(coords[1])
        };

        if (this.selectedAreaIndex !== -1) { // Add to area
            const selectedArea = this.areas[this.selectedAreaIndex];
            let index = 0;
            let shortestDistance = this.width;

            if (selectedArea.points.length > 2) {
                for (let i = 1; i < selectedArea.points.length; i++) {
                    const distance = this.distanceFromLine(newPoint, selectedArea.points[i - 1], selectedArea.points[i]);
                    const intersectionPoint = this.getClosestPointOnLine(newPoint, selectedArea.points[i - 1], selectedArea.points[i]);
                    console.log(newPoint, selectedArea.points[i - 1], selectedArea.points[i], intersectionPoint, distance, shortestDistance);
                    if (distance < shortestDistance && this.pointIsBetween(intersectionPoint, selectedArea.points[i - 1], selectedArea.points[i])) {
                        console.log('Perfect');
                        index = i;
                        shortestDistance = distance;
                    }
                }

                const distance = this.distanceFromLine(newPoint, selectedArea.points[selectedArea.points.length - 1], selectedArea.points[0]);
                const intersectionPoint = this.getClosestPointOnLine(newPoint, selectedArea.points[selectedArea.points.length - 1], selectedArea.points[0]);
                console.log(newPoint, selectedArea.points[selectedArea.points.length - 1], selectedArea.points[0], intersectionPoint, distance, shortestDistance);
                if (distance < shortestDistance && this.pointIsBetween(intersectionPoint, selectedArea.points[selectedArea.points.length - 1], selectedArea.points[0])) {
                    index = selectedArea.points.length;
                    shortestDistance = distance;
                }

                console.log(index);

                selectedArea.points = [
                    ...selectedArea.points.slice(0, index),
                    newPoint,
                    ...selectedArea.points.slice(index)
                ];
            } else {
                selectedArea.points.push(newPoint);
            }

            console.log(selectedArea.points);
        } else { // Create new area
            this.areas.push({
                uid: this.generateID(),
                points: [newPoint]
            });
            this.selectedAreaIndex = this.areas.length - 1;
        }

        this.drawAreas(this.areas);
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
            .attr('stroke', '#007bff')
            .attr('stroke-width', 1)
            .attr('fill', '#007bff')
            .attr('fill-opacity', 0.25)
            .on('click', (d, i) => {
                this.selectedAreaIndex = this.selectedAreaIndex === i ? -1 : i;
                this.drawAreas(areas);
                //this.handlePolygonSelection
            });

        const circles = individualAreaGroup.selectAll('circle')
            .data((d, i) => i === this.selectedAreaIndex ? d.points : [], (d) => d.x + '#' + d.y);

        circles.enter()
            .append('circle')
            .merge(circles)
            .attr('r', 4)
            .attr('cx', (d) => d.x)
            .attr('cy', (d) => d.y)
            .attr('fill', '#007bff')
            .on('click', (d, idx, j) => {
                const parentAreaPoints = d3.select(j[idx].parentNode).datum().points;

                const i = parentAreaPoints.findIndex((p) => p.x === d.x && p.y === d.y);

                if (i === parentAreaPoints.length) {
                    parentAreaPoints.pop();
                } else if (i === 0) {
                    parentAreaPoints.shift();
                } else {
                    parentAreaPoints.splice(i, 1);
                }

                this.drawAreas(areas);
            })
            .call(d3.drag()
                .on('start', function (d) {
                    d3.select(this).classed('active', true)
                })
                .on('drag', function (d) {
                    d3.select(this)
                        .attr('cx', d.x = d3.event.x)
                        .attr('cy', d.y = d3.event.y);
                    self.drawAreas(areas);
                })
                .on('end', function (d) {
                    d3.select(this).classed('active', false)
                }));

        circles.exit().remove();
    }

    generateID() {
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let text = "";
        
        for (let i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
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
        console.log(Math.round(this.distance(lineStartPoint, point)), Math.round(this.distance(point, lineEndPoint)), Math.round(this.distance(lineStartPoint, lineEndPoint)),
            (Math.round(this.distance(lineStartPoint, point)) + Math.round(this.distance(point, lineEndPoint))) === Math.round(this.distance(lineStartPoint, lineEndPoint)));
        return (Math.round(this.distance(lineStartPoint, point)) + Math.round(this.distance(point, lineEndPoint))) <= (Math.round(this.distance(lineStartPoint, lineEndPoint)) + 1)
            && (Math.round(this.distance(lineStartPoint, point)) + Math.round(this.distance(point, lineEndPoint))) >= (Math.round(this.distance(lineStartPoint, lineEndPoint)) - 1);
    }

    getClosestPointOnLine(point, lineStartPoint, lineEndPoint) {
        const k = ((point.x - lineStartPoint.x) * (lineEndPoint.x - lineStartPoint.x) + (point.y - lineStartPoint.y) * (lineEndPoint.y - lineStartPoint.y))
            / (Math.pow(lineEndPoint.x - lineStartPoint.x, 2) + Math.pow(lineEndPoint.y - lineStartPoint.y, 2));
        return {
            x: lineStartPoint.x + k * (lineEndPoint.x - lineStartPoint.x),
            y: lineStartPoint.y + k * (lineEndPoint.y - lineStartPoint.y)
        };
    }
}
