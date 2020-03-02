// if the data you are going to import is small, then you can import it using es6 import
// import MY_DATA from './app/data/example.json'

//centering https://gis.stackexchange.com/questions/180675/d3-center-a-map-feature-using-correct-latitude-and-longitude-without-rotation
//tutorial http://duspviz.mit.edu/d3-workshop/mapping-data-with-d3/

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

//helper functions (to be migrated to utils)
function mouseOverHandler(d) {
  d3.select(this).attr("fill", "#FFD700");
}

function mouseOutHandler(d) {
  d3.select(this).attr("fill", "#ccc");
}

function clickHandler(d) {
  var name = d.properties.community;
  d3.select('h1').text(name);
}

function parseJson(json) {
  for (const [key, value] of Object.entries(json)) {
    console.log(key, value.properties.community);
  }
}


//first layer of the map
d3.json("/data/community-area.geojson")
  .then(function(data) {
    //parseJson(data.features);
    g.selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
      .attr("fill", "#ccc")
      .attr("stroke", "#333333")
      .attr("d", geoPath)
      .on("mouseover", mouseOverHandler)
      .on("mouseout", mouseOutHandler)
      .on("click", clickHandler)
  }).catch((error) => {
    console.log(error);
  });
