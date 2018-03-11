import * as d3 from 'd3';

const MARGIN = {
    TOP: 0,
    RIGHT: 0,
    BOTTOM: 0,
    LEFT: 0,
};

const PADDING = 5;

const RADIUS = 25;

export default class Polygon {
    constructor(svgElement) {
        this.svgElement = svgElement;

        this.svg = d3.select(svgElement);

        this.dimensions = this.svg.node().getBoundingClientRect();

        this.width = this.dimensions.width - MARGIN.LEFT - MARGIN.RIGHT;
        this.height = this.dimensions.height - MARGIN.TOP - MARGIN.BOTTOM;

        this.polygons = [];

        this.svg
            .attr('width', this.width + MARGIN.LEFT + MARGIN.RIGHT)
            .attr('height', this.height + MARGIN.TOP + MARGIN.BOTTOM);

        this.graph = this.svg.append('g')
            .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

        this.plain = this.graph.append('rect')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('fill', 'transparent');

        this.tooltip = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

        let self = this;

        this.plain
            .on('click', function () {
                self.drawCircles(d3.mouse(this));
            });
    }

    drawCircles(coords) {
        const self = this;

        if (coords) {
            this.polygons.push({
                x: Math.round(coords[0]),
                y: Math.round(coords[1])
            });
        }

        // https://stackoverflow.com/questions/2855189/sort-latitude-and-longitude-coordinates-into-clockwise-ordered-quadrilateral

        const circles = this.graph.selectAll('circle')
            .data(this.polygons, (d) => d.x + '#' + d.y);

        circles.enter()
            .append('circle')
            .attr('r', 5)
            .attr('cx', (d) => d.x)
            .attr('cy', (d) => d.y)
            .attr('fill', 'blue')
            .call(d3.drag()
                .on("start", function (d) {
                    d3.select(this).raise().classed("active", true)
                })
                .on("drag", function (d) {
                    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
                    self.drawCircles();
                })
                .on("end", function (d) {
                    d3.select(this).classed("active", false)
                }))
            .on('contextmenu', (d) => {
                d3.event.preventDefault();
                const i = this.polygons.findIndex((p) => p.x === d.x && p.y === d.y);

                if (i === this.polygons.length) {
                    this.polygons.pop();
                } else if (i === 0) {
                    this.polygons.shift();
                } else {
                    this.polygons.splice(i, 1);
                }

                this.drawCircles();
            });

        circles.exit().remove();

        this.graph.selectAll('polygon').remove();

        this.graph.append('polygon')
            .attr('points', () => this.polygons.map((d) => [d.x, d.y].join(',')).join(' '))
            .attr('stroke', '#007bff')
            .attr('stroke-width', 1)
            .attr('fill', '#007bff')
            .attr('fill-opacity', 0.25)
            .style('pointer-events', 'none');
    }
}