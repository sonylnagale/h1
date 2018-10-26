import React, { Component } from 'react';
import './App.css';
import * as d3 from 'd3';
import csv from 'csvtojson';
import request from 'request';

const csvFile = "http://localhost:3000/LoanStats3a.csv";


class BarChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      json: null
    }
  }



  drawChart() {
    const data = this.props.json;
    console.log(data);
    var margin = {top: 20, right: 20, bottom: 70, left: 40},
        width = 1024 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


    // set the ranges
    var x = d3.scaleLinear().domain([0, data.length]).range([0, width]);

    var y = d3.scaleLinear().range([height, 0]);

    // define the axis
    var xAxis = d3.axisBottom(x);

    var yAxis = d3.axisLeft(y);


    // add the SVG element
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");


    // load the data
    //d3.json(this.props.data, function(error, data) {

      data.forEach(function(d,i) {
          d.id = i;
          d.loan_amnt = +d.loan_amnt;
      });

      // scale the range of the data
      x.domain(data.map(function(d) { return d.id; }));
      y.domain([0, d3.max(data, function(d) { return d.loan_amnt; })]);

      // add axis
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", "-.55em")
          .attr("transform", "rotate(-90)" );

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 5)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Frequency");

      // var scale = d3.scaleBand()
      //   .domain(x.range())
      //   .range(y.range());

      // Add bar chart
      svg.selectAll("bar")
        .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d,i) { return i  * 50; })
          // .attr("width", scale.bandwidth())
          .attr("width", 30)
          .attr("y", function(d) { return y(d.loan_amnt); })
          .attr("height", function(d) { return height - y(d.loan_amnt); });

    //});

    // const data = this.props.data;
    //
    // const svg = d3.select("body")
    // .append("svg")
    // .attr("width", 500)
    // .attr("height", 500)
    // .style("margin-left", 100);
    //
    // svg.selectAll("rect")
    //   .data(data)
    //   .enter()
    //   .append("rect")
    //   .attr("x", (d, i) => i * 70)
    //   .attr("y", (d, i) => 500 - 10 * d)
    //   .attr("width", 65)
    //   .attr("height", (d, i) => d * 10)
    //   .attr("fill", "green")
  }

  render() {

    if (this.props.json !== null) {
      this.drawChart();
    }

    return <div id={"#" + this.props.id}></div>
  }
}

// export BarChart;


class App extends Component {

  constructor(props) {
      super(props);
      this.state = {
        jsonData: null
      };
  }

  componentDidMount() {
    csv()
      .fromStream(
        request.get(csvFile)
      )
      .preRawData((csvRawData) => {
        return csvRawData.split("\n").slice(1).join("\n")
      })
      .then((json) => {
        this.setState({'jsonData':json});
      });

  }

  render() {
    return (
      <div className="App">
          <div id="error" />

          <BarChart id="visualization" json={this.state.jsonData} />
      </div>
    );
  }
}

export default App;
