import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';	
import * as d3 from 'd3';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css'],	  
  encapsulation: ViewEncapsulation.None
  
})
export class GridComponent implements OnInit {
  @ViewChild('grid') private gridContainer: ElementRef;
  
  private margin: any = { top: 20, bottom: 20, left: 20, right: 20};	  
  private grid: any;
  private width: number = window.innerWidth;
  private height: number = window.innerHeight;
  private radius: number = 50;
  private colors: any;

  constructor() { }

  ngOnInit() {
    this.drawField();
  }

  drawField() {
    const element = this.gridContainer.nativeElement;

    var circleAttrs = {
        w: this.width,
        h: this.height,
        r: 50
    };

    var circles = d3.range(1).map(function() {
      return {
        x: Math.round(Math.random() * (circleAttrs.w - circleAttrs.r * 2) + circleAttrs.r),
        y: Math.round(Math.random() * (circleAttrs.h - circleAttrs.r * 2) + circleAttrs.r)
      };
    });

    this.colors = d3.scaleOrdinal()
      .range(d3.schemeCategory10);

    const grid = d3.select(element).append('svg')	      
      .attr('width', this.width)	      
      .attr('height', this.height)
      .attr('class', 'field')
      .call(d3.drag()
        .container(this)
        .subject(dragsubject)
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    var circle = grid.selectAll("circle")
        .data(circles)
        .enter().append("circle")
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; })
          .attr("r", circleAttrs.r)
          .style('fill', (d, i) => this.colors(i));


  }

  dragsubject() {
    return simulation.find(d3.event.x, d3.event.y, this.radius);
  }
  
  dragstarted() {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
  }
  
  dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
  }
  
  dragended() {
    if (!d3.event.active) simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  }

}
