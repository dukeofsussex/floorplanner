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
        if (this.selectedAreaIndex !== -1) { // Add to area
            this.areas[this.selectedAreaIndex].points.push({
                x: Math.round(coords[0]),
                y: Math.round(coords[1])
            });
        } else { // Create new area
            this.areas.push({
                uid: this.generateID(),
                points: [{
                    x: Math.round(coords[0]),
                    y: Math.round(coords[1])
                }]
            });
            this.selectedAreaIndex = this.areas.length - 1;
        }

        // https://stackoverflow.com/questions/2855189/sort-latitude-and-longitude-coordinates-into-clockwise-ordered-quadrilateral

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
}