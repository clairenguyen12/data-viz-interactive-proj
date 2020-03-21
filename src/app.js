//centering https://gis.stackexchange.com/questions/180675/d3-center-a-map-feature-using-correct-latitude-and-longitude-without-rotation
//tutorial http://duspviz.mit.edu/d3-workshop/mapping-data-with-d3/
//https://bl.ocks.org/tiffylou/88f58da4599c9b95232f5c89a6321992


//helper functions
function clickHandler(d) {
  var name = d.properties.community;
  var housingCap = d.properties.housingCap;
  var text = "Community Area: " + name;
  d3.select('h2#big-title').text(text);

  clearElement('area-chart');

  var instruction = document.getElementById("comm-area-instruction");
  instruction.style.display = 'block';

  var areaCrimes = d.properties.areaCrimes;
  //console.log(areaCrimes);
  makeLine(areaCrimes, 'Year', 'Total Crimes', 25000, 8, 5,
           "Year",
           "Total Reported Crimes",
           "Total Reported Crimes from 2012 to 2019",
           "The chart shows both violent and non-violent crimes reported in the neighborhood.",
           "Data Source: Chicago Open Data Portal");

  var areaIncome = d.properties.medianIncome;
  makeLine(areaIncome, 'Year', 'MedianIncome', 120000, 6, 5,
           "Year",
           "Median Income (US$)",
           "Median Income Trend from 2014 to 2019",
           "The median income was calculated on the household level for the neighborhood.",
           "Data Source: U.S. Census Bureau, ACS 5-Year Tables");

  var areaCensus = d.properties.census;
  makeManyLines(areaCensus,
                "Year",
                "Percent of Total Population (%)");
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


function remap(arr) {
  const myMap = {};
  for (let i=0; i<arr.length; i++) {
    myMap[arr[i]['Community Area Number']] = arr[i]
  }
  return myMap;
}


function clearElement(elementID) {
    var div = document.getElementById(elementID);
    while(div.firstChild) {
        div.removeChild(div.firstChild);
    }
}


//making line charts for the community area
function makeLine(data, xKey, yKey, ymax, xtick, ytick, xlab, ylab, title, subtitle, datasource) {
  var height = 500;
  var width = 600;
  var margin = { top: 80, left: 60, right: 80, bottom: 60 };
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

  svg.append("text")
    .attr("transform", "translate(" + (plotWidth/2) + "," + (plotHeight + 40) + ")")
    .attr("class", "x-label")
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text(xlab);

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left - 3)
    .attr("x",0 - (plotHeight / 2))
    .attr("dy", "1em")
    .style("font-size", "12px")
    .style("text-anchor", "middle")
    .text(ylab);

  svg.append("text")
    .attr("x", (width / 2 - 40))
    .attr("y", 0 - (margin.top / 2 + 20))
    .attr("class", "title")
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text(title);

  svg.append("text")
    .attr("x", (width / 2 - 40))
    .attr("y", 0 - (margin.top / 2))
    .attr("class", "subtitle")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text(subtitle);

  svg.append("text")
    .attr("x", (width / 2 - 40))
    .attr("y", 0 - (margin.top / 2) + 20)
    .attr("class", "subtitle")
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .text(datasource);
}


//making multiple line chart
function makeManyLines(data, xlab, ylab) {
  var height = 500;
  var width = 600;
  var margin = { top: 80, left: 60, right: 80, bottom: 60 };
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
    .attr("stroke", "#1192e8")
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
    .attr("r", 1);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#a56eff")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) { return x(d.Year) })
      .y(function(d) { return y(d.PercentBlack) })
      );

  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.Year); } )
    .attr("cy", function (d) { return y(d.PercentBlack); } )
    .attr("r", 1);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#005d5d")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) { return x(d.Year) })
      .y(function(d) { return y(d.PercentAsian) })
      );

  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.Year); } )
    .attr("cy", function (d) { return y(d.PercentAsian); } )
    .attr("r", 1);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#ee5396")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) { return x(d.Year) })
      .y(function(d) { return y(d.PercentHispanic) })
        );

  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.Year); } )
    .attr("cy", function (d) { return y(d.PercentHispanic); } )
    .attr("r", 1);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "gray")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) { return x(d.Year) })
      .y(function(d) { return y(d.PercentOther) })
        );

  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.Year); } )
    .attr("cy", function (d) { return y(d.PercentOther); } )
    .attr("r", 1);

  // Add the X Axis
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + plotHeight + ")")
    .call(xAxis);

  // Add the Y Axis
  svg.append("g")
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("transform", "translate(" + (plotWidth/2) + "," + (plotHeight + 40) + ")")
    .attr("class", "x-label")
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text(xlab);

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left - 3)
    .attr("x",0 - (plotHeight / 2))
    .attr("dy", "1em")
    .style("font-size", "12px")
    .style("text-anchor", "middle")
    .text(ylab);

  svg.append("text")
    .attr("x", (width / 2 - 40))
    .attr("y", 0 - (margin.top / 2 + 20))
    .attr("class", "title")
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text("Racial Demographics Trend from 2014 to 2019");

  svg.append("text")
    .attr("x", (width / 2 - 40))
    .attr("y", 0 - (margin.top / 2))
    .attr("class", "subtitle")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("This chart shows the percentage of White, Black, Asian and Hispanic")

  svg.append("text")
    .attr("x", (width / 2 - 40))
    .attr("y", 0 - (margin.top / 2) + 20)
    .attr("class", "subtitle")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("residents over total neighborhood population.");

  svg.append("text")
    .attr("x", (width / 2 - 40))
    .attr("y", 0 - (margin.top / 2) + 40)
    .attr("class", "subtitle")
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .text("Data Source: U.S. Census Bureau, ACS 5-Year Tables");

  const legendWidth = 100;
  const legendHeight = 100;
  const legendX = plotWidth + 30;
  const legendY = margin.top;
  const rectMargin = 10;
  const textMarginX = 15;
  const textMarginY = 10;

  const legendContainer = svg.append("g")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .attr("x", legendX)
    .attr("y", legendY)

  legendContainer.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("x", legendX + rectMargin)
    .attr("y", legendY + rectMargin)
    .attr("fill", "#1192e8")
  legendContainer.append("text")
    .text("White")
    .attr("x", legendX + rectMargin + textMarginX)
    .attr("y", legendY + rectMargin + textMarginY)
    .attr("class", "legendText")

  legendContainer.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("x", legendX + rectMargin)
    .attr("y", legendY + 3*rectMargin)
    .attr("fill","#a56eff")
  legendContainer.append("text")
    .text("Black")
    .attr("x", legendX + rectMargin + textMarginX)
    .attr("y", legendY + 3*rectMargin + textMarginY)
    .attr("class", "legendText")

  legendContainer.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("x", legendX + rectMargin)
    .attr("y", legendY + 5*rectMargin)
    .attr("fill", "#005d5d")
  legendContainer.append("text")
    .text("Asian")
    .attr("x", legendX + rectMargin + textMarginX)
    .attr("y", legendY + 5*rectMargin + textMarginY)
    .attr("class", "legendText")

  legendContainer.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("x", legendX + rectMargin)
    .attr("y", legendY + 7*rectMargin)
    .attr("fill", "#ee5396")
  legendContainer.append("text")
    .text("Hispanic")
    .attr("x", legendX + rectMargin + textMarginX)
    .attr("y", legendY + 7*rectMargin + textMarginY)
    .attr("class", "legendText")

  legendContainer.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("x", legendX + rectMargin)
    .attr("y", legendY + 9*rectMargin)
    .attr("fill", "gray")
  legendContainer.append("text")
    .text("Other")
    .attr("x", legendX + rectMargin + textMarginX)
    .attr("y", legendY + 9*rectMargin + textMarginY)
    .attr("class", "legendText")
}


Promise.all([
  d3.json("./data/housing.json"),
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

  var housingByArea = remap(housing);
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
      var housingCap = housingByArea[areaNum]['Units'];
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

  //console.log(communityShapesFeatures[0].properties);

  var width = 700;
  var height = 600;

  // Create SVG
  var svg = d3.select("div#main-map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  var g = svg.append("g");

  //choropleth codes start
  var color = d3.scaleThreshold()
    .domain([1,500])
    .range(d3.schemeBlues[3]);
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
      tooltip.html(d.properties.community + ': ' + d.properties.housingCap + ' units')
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
    .data([0,100,200,300,400,500,600,700,800,900,1000].reverse())
    .enter()
    .append('rect')
    .attr("x", 450)
    .attr("y", function(d, i) {
        return i * 10;
     })
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", color);

  svg.append("text")
    .attr("x", 470)
    .attr("y", 110)
    .style("font-size", "10px")
    .text('0')

  svg.append("text")
    .attr("x", 470)
    .attr("y", 60)
    .style("font-size", "10px")
    .text('500')

  svg.append("text")
    .attr("x", 470)
    .attr("y", 10)
    .style("font-size", "10px")
    .text('1000')

  } //end of makeMap
