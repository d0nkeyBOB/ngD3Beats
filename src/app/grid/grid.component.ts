import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';	
import * as d3 from 'd3';
import { Tone, Volume, Synth } from "tone";

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
    const audioContext: AudioContext = new (window["AudioContext"] || window["webkitAudioContext"])();
    const destination = audioContext.destination;
    const gain = audioContext.createGain();
    gain.gain.value = 1.0;
    gain.connect(destination);

    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = 440;

    var circleAttrs = {
        w: 800,
        h: 600,
        r: 25
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

    var circle = grid.selectAll("circle")
        .data(circles)
        .enter().append("circle")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", circleAttrs.r)
        .style('fill', (d, i) => this.colors(i))
        .on("click", () => {
          oscillator.start();
        })
        .on("mouseout", () => {
          oscillator.stop();
        });
  }

  initDrag(d: any) {
    d3.drag()
  }

  // dragstarted(d) {
  //   d3.select(this).raise().classed("active", true);
  // }
  
  // dragged(d) {
  //   d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
  // }
  
  // dragended(d) {
  //   d3.select(this).classed("active", false);
  // }
}
