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
  private width: number;
  private height: number;

  constructor() { }

  ngOnInit() {
    this.drawGrid();
  }

  drawGrid() {
    const element = this.gridContainer.nativeElement;

    const grid = d3.select(element).append('svg')	      
      .attr('width', (window.screen.width) + "px")	      
      .attr('height', '202px');

    var row = grid.selectAll(".row")
      .data(this.dridData)
      .enter().append("g")
      .attr("class", "row");

    var column = row.selectAll(".square")
      .data(function(d: any) { return d; })
      .enter().append("rect")
      .attr("class", "square")
      .attr("x", (d: any) => { return d.x; })
      .attr("y", (d: any) => { return d.y; })
      .attr("width", (d: any) => { return d.width; })
	    .attr("height", (d: any) => { return d.height; })
      .style("fill", "#fff")
      .style("stroke", "#000")
      .on('click', () => console.log("clicked"))

  }

  dridData() {
    var data = new Array();
    var xpos = 1;
    var ypos = 1;
    var width = 50;
    var height = 50;

    for (let row = 0; row < 5; row++) {
      data.push(new Array());
      
      for (let column  = 0; column  < 16; column ++) {
        data[row].push({
          x: xpos,
          y: ypos,
          width: width,
          height: height
        })
        xpos += width;
      }

      xpos = 1
      ypos += height;
    }

    return data;

  }

}
