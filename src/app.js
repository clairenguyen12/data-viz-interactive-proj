//centering https://gis.stackexchange.com/questions/180675/d3-center-a-map-feature-using-correct-latitude-and-longitude-without-rotation
//tutorial http://duspviz.mit.edu/d3-workshop/mapping-data-with-d3/
//https://bl.ocks.org/tiffylou/88f58da4599c9b95232f5c89a6321992


//helper functions (to be migrated to utils)
function clickHandler(d) {
  var name = d.properties.community;
  var housingCap = d.properties.housingCap;
  var text = "Community Area " + name + " has " + housingCap + " affordable housing buildings."
  d3.select('p').text(text);

  clearElement('area-chart');

  var areaCrimes = d.properties.areaCrimes;
  //console.log(areaCrimes);
  makeLine(areaCrimes, 'Year', 'Total Crimes', 12000, 8, 5,
           "Crime Trend in from 2012 to 2019",
           "Add subtitle here",
           "Data Source: Chicago Open Data Portal");

  var areaIncome = d.properties.medianIncome;
  makeLine(areaIncome, 'Year', 'MedianIncome', 120000, 6, 5,
           "Median Income Trend from 2014 to 2019",
           "Add subtitle here",
           "Data Source: Census");

  var areaCensus = d.properties.census;
  makeManyLines(areaCensus);
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


function makeLine(data, xKey, yKey, ymax, xtick, ytick, title, subtitle, datasource) {
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

  var x = d3.scaleLinear()
    .domain([xmin, xmax])
    .range([0, plotWidth]);

  var xAxis = d3.axisBottom(x).ticks(xtick).tickFormat(d3.format("d"));

  var y = d3.scaleLinear()
    .domain([0, ymax])
    .range([plotHeight, 0]);

  var yAxis = d3.axisLeft(y).ticks(ytick);

  svg.append("g")
    .call(yAxis);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "purple")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) { return x(d[xKey]) })
      .y(function(d) { return y(d[yKey]) })
    )

  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d[xKey]); } )
    .attr("cy", function (d) { return y(d[yKey]); } )
    .attr("r", 2);


  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + plotHeight + ")")
    .call(xAxis);

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
    .text(title);


  svg.append("text")
    .attr("x", (width / 2 - 40))
    .attr("y", 0 - (margin.top / 2))
    .attr("class", "subtitle")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text(subtitle);


  svg.append("text")
    .attr("transform", "translate(" + (plotWidth) + "," + (plotHeight + 40) + ")")
    .attr("class", "data-source")
    .attr("text-anchor", "end")
    .style("font-size", "14px")
    .text(datasource);
}



function makeManyLines(data) {
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


  var x = d3.scaleLinear()
    .domain([2014, 2019])
    .range([0, plotWidth]);

  var xAxis = d3.axisBottom(x).ticks(6).tickFormat(d3.format("d"));

  var y = d3.scaleLinear()
    .domain([0, 100])
    .range([plotHeight, 0]);

  var yAxis = d3.axisLeft(y).ticks(10);

  svg.append("g")
    .call(yAxis);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) { return x(d.Year) })
      .y(function(d) { return y(d.PercentWhite) })
    );

  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.Year); } )
    .attr("cy", function (d) { return y(d.PercentWhite); } )
    .attr("r", 2);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) { return x(d.Year) })
      .y(function(d) { return y(d.PercentNonWhite) })
      );

  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.Year); } )
    .attr("cy", function (d) { return y(d.PercentNonWhite); } )
    .attr("r", 2);

  // Add the X Axis
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + plotHeight + ")")
    .call(xAxis);

  // Add the Y Axis
  svg.append("g")
    .call(d3.axisLeft(y));

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
    .text("Racial Demographics");


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
    .text("Data Source: Census");
}


Promise.all([
  d3.csv("./data/affordable_housing.csv"),
  d3.json("./data/community-area.geojson"),
  d3.json("./data/total_crimes.json"),
  d3.json("./data/chi_inc.json"),
  d3.json("./data/chi_census.json")
  ]).then(d => {
      const [housing, communityShapes, totalCrimes, income, census] = d;
      makeMap(housing, communityShapes, totalCrimes, income, census);
    }).catch(function(error) {
      console.log(error);
    });


function makeMap(housing, communityShapes, totalCrimes, income, census) {

  var housingByArea = groupBy(housing, "Community Area Number");
  //console.log(housingByArea);

  var totalCrimesByArea = groupBy(totalCrimes, "Community Area");
  //console.log(totalCrimesByArea);

  //adding housing information to community Shapes
  var communityShapesFeatures = communityShapes.features;
  //console.log(communityShapesFeatures);

  var incomeByArea = groupBy(income, "CommunityAreaCode");
  //console.log(incomeByArea);

  var censusByArea = groupBy(census, "CommunityAreaCode");
  //console.log(censusByArea);

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

    var areaMedInc = incomeByArea[areaNum]
    communityShapesFeatures[i].properties["medianIncome"] = areaMedInc;

    var areaRace = censusByArea[areaNum]
    communityShapesFeatures[i].properties["census"] = areaRace;
  };

  console.log(communityShapesFeatures[0].properties);

  var width = 700;
  var height = 580;

  // Create SVG
  var svg = d3.select("div#main-map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  var g = svg.append("g");

  //choropleth codes start
  var color = d3.scaleThreshold()
    .domain(d3.range(0, 30))
    .range(d3.schemeBlues[6]);
  //choropleth codes end

  var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

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
    //.attr("fill", "#ccc")
    .attr("stroke", "#333333")
    .attr("d", geoPath)
    .attr("fill", function(d) { return color(d.properties.housingCap); }) //choropleth code
    .on("mouseover", function mouseOverHandler(d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(d.properties.community)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
      d3.select(this).style("fill", "orange");
      })
    .on("mouseout", function mouseOutHandler(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
      d3.select(this).style("fill", function(d) { return color(d.properties.housingCap); });
      })
    .on("click", clickHandler)


  var legend = svg.selectAll("rect")
    .data(color.domain().reverse())
    .enter()
    .append('rect')
    .attr("x", 10)
    .attr("y", function(d, i) {
        return i * 5;
     })
    .attr("width", 5)
    .attr("height", 5)
    .attr("fill", color);

  } //end of makeMap
