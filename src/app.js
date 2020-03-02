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
  var text = "Community Area " + name + " has " + housingCap + " affordable housing units."
  d3.select('p').text(text);
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

Promise.all([
  d3.csv("./data/affordable_housing.csv"),
  d3.json("./data/community-area.geojson")
  ]).then(d => {
      const [housing, communityShapes] = d;
      makeMap(housing, communityShapes);
    }).catch(function(error) {
      console.log(error);
    });


function makeMap(housing, communityShapes) {

  var housingByArea = groupBy(housing, "Community Area Number");
  //console.log(housingByArea);

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
  };


  var width = 700;
  var height = 580;

  // Create SVG
  var svg = d3.select("body")
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
