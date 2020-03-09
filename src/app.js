//centering https://gis.stackexchange.com/questions/180675/d3-center-a-map-feature-using-correct-latitude-and-longitude-without-rotation
//tutorial http://duspviz.mit.edu/d3-workshop/mapping-data-with-d3/


//helper functions (to be migrated to utils)
function mouseOverHandler(d) {
  d3.select(this).attr("fill", "#FFD700");
}

function mouseOutHandler(d) {
  d3.select(this).attr("fill", "#ccc");
}

function clickHandler(d) {
  var name = d.properties.community;
  var housingCap = d.properties.housingCap;
  var text = "Community Area " + name + " has " + housingCap + " affordable housing buildings."
  d3.select('p').text(text);

  var areaCrimes = d.properties.areaCrimes;
  //console.log(areaCrimes);
  makeLine(areaCrimes);
}

function parseJson(json) {
  for (const [key, value] of Object.entries(json)) {
    console.log(key, value.properties.community);
  }
}

function groupBy(data, accessorKey) {
  const myMap = {};
  for (let i = 0; i<data.length; i++) {
    const key = data[i][accessorKey];
    if (!(key in myMap)) {
      myMap[key] = []
    };
    myMap[key].push(data[i]);
  };
  return myMap;
}

function clearElement(elementID) {
    var div = document.getElementById(elementID);
    while(div.firstChild) {
        div.removeChild(div.firstChild);
    }
}

function makeLine(data) {
  clearElement("area-chart");
  var xKey = 'Year';
  var yKey = 'Total Crimes';

  var height = 400;
  var width = 500;
  var margin = { top: 80, left: 40, right: 80, bottom: 40 };
  var plotWidth = width - margin.left - margin.right;
  var plotHeight = height - margin.bottom - margin.top;

  var svg = d3.select("div#area-chart")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  xmin = d3.min(data, function(d) {
    return d[xKey];
  });
  //console.log(xmin);

  xmax = d3.max(data, function(d) {
    return d[xKey];
  });
  //console.log(xmax);

  ymin = d3.min(data, function(d) {
    return d[yKey];
  });
  //console.log(ymin);

  ymax = d3.max(data, function(d) {
    return d[yKey];
  });
  //console.log(ymax);

  var x = d3.scaleLinear()
    .domain([xmin, xmax])
    .range([0, plotWidth]);

  var xAxis = d3.axisBottom(x).ticks(8);

  var y = d3.scaleLinear()
    .domain([0, ymax])
    .range([plotHeight, 0]);

  var yAxis = d3.axisLeft(y).ticks(5);

  svg.append("g")
    .call(yAxis);

  var valueLine = d3.line()
    .x(function(d) { return xScale(d[xKey]); })
    .y(function(d) { return yScale(d[yKey]); });

  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d[xKey]); } )
    .attr("cy", function (d) { return y(d[yKey]); } )
    .attr("r", 2)

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + plotHeight + ")")
    .call(xAxis)

/*
  svg.append("g")
    .append("text")
    .attr("class", "x-label")
    .attr("transform", "translate(" + (margin.right - 30) + "," + (margin.bottom - 60) + ")")
    .text("Year")


  svg.append("g")
    .append("text")
    .attr("class", "y-title")
    .attr("transform", "translate(" + (plotWidth - margin.right + 70) + "," + (plotHeight) + ") rotate(-90)")
    .text("Total Annual Crimes");
*/

  svg.append("text")
    .attr("x", (width / 2 - 40))
    .attr("y", 0 - (margin.top / 2 + 20))
    .attr("class", "title")
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Crime trend from 2012 to 2019");


  svg.append("text")
    .attr("x", (width / 2 - 40))
    .attr("y", 0 - (margin.top / 2))
    .attr("class", "subtitle")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Add subtitle here");


  svg.append("text")
    .attr("transform", "translate(" + (plotWidth) + "," + (plotHeight + 40) + ")")
    .attr("class", "data-source")
    .attr("text-anchor", "end")
    .style("font-size", "14px")
    .text("Data source: Chicago Open Data Portal");
}

Promise.all([
  d3.csv("./data/affordable_housing.csv"),
  d3.json("./data/community-area.geojson"),
  d3.json("./data/total_crimes.json")
  ]).then(d => {
      const [housing, communityShapes, totalCrimes] = d;
      makeMap(housing, communityShapes, totalCrimes);
    }).catch(function(error) {
      console.log(error);
    });


function makeMap(housing, communityShapes, totalCrimes) {

  var housingByArea = groupBy(housing, "Community Area Number");
  //console.log(housingByArea);

  var totalCrimesByArea = groupBy(totalCrimes, "Community Area");
  //console.log(totalCrimesByArea);

  //adding housing information to community Shapes
  var communityShapesFeatures = communityShapes.features;
  //console.log(communityShapesFeatures);

  for (var i = 0; i < communityShapesFeatures.length; i++) {
    var areaNumStr = communityShapesFeatures[i].properties["area_num_1"];
    var areaNum = parseFloat(areaNumStr);

    if (housingByArea.hasOwnProperty(areaNum)) {
      var housingCap = housingByArea[areaNum].length;
    } else {
      var housingCap = 0;
    };

    communityShapesFeatures[i].properties["housingCap"] = housingCap;

    var areaCrimes = totalCrimesByArea[areaNum]
    communityShapesFeatures[i].properties["areaCrimes"] = areaCrimes;
  };


  var width = 700;
  var height = 580;

  // Create SVG
  var svg = d3.select("div#main-map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  var g = svg.append("g");

  //using Albers projection and trying to center the map
  var albersProjection = d3.geoAlbers()
    .scale(80000)
    .rotate([87.65, 0])
    .center([0, 41.83])
    .translate([width/2,height/2]);

  //Turning lat/lon into screen coordinates
  var geoPath = d3.geoPath()
    .projection(albersProjection);

  //first layer of the map
  g.selectAll("path")
    .data(communityShapesFeatures)
    .enter()
    .append("path")
    .attr("fill", "#ccc")
    .attr("stroke", "#333333")
    .attr("d", geoPath)
    .on("mouseover", mouseOverHandler)
    .on("mouseout", mouseOutHandler)
    .on("click", clickHandler);

  } //end of makeMap
