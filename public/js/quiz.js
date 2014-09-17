var zoomLevel = 4;
var states = { };
var mystates = [];

var options = {
  zoomControl: false,
  dragging: false,
  touchZoom: false,
  scollWheelZoom: false,
  doubleClickZoom: false,
  boxZoom: false,
  minZoom:zoomLevel,
  maxZoom:zoomLevel
}
var map = L.map('map', options).setView([43.74739, -105], zoomLevel);

/*
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
		'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="http://mapbox.com">Mapbox</a>'
}).addTo(map);*/

var greyStyle = {
    "color": "#aaaaaa",
    "weight": 1,
    "opacity": 1
};

var plainStyle = {
    "color": "#0000cc",
    "weight": 1,
    "opacity": 0.4
};

var fancyStyle = {
  color: "#1188ee",
  weight: 3,
  opacity: 0.6
}

var renderGeoJSON = function(obj,style) {
  L.geoJson(obj, {style: style} ).addTo(map);
};

$.ajax({url: "/js/world.json",
        success: function(data) {
          //console.log(data);
          renderGeoJSON(data, greyStyle);
        }
      });
      
var fetchStateNames = function() {
  $.ajax({url: "https://reader.cloudant.com/usstates/_design/fetch/_view/byName",
          success: function(data) {
            data = JSON.parse(data);
            for(var i in data.rows) {
              states[data.rows[i].id] = data.rows[i].key;
            }
          }
        }); 
  
} ;     
      
var jsonToTable = function(d) {
  var table = "<table>";
  for(var i in d) {
    table += "<tr><th>"+i+"</th><td>"+d[i]+"</td></tr>";
  }
  table += "</table>";
  return table;
}      
      
      
var renderState = function(state) {
  $.ajax({url: "https://reader.cloudant.com/usstates/" + encodeURIComponent(state),
          success: function(data) {
            data = JSON.parse(data);
            renderGeoJSON(data, fancyStyle);
            console.log(data.properties);
            $("#info").html(jsonToTable(data.properties));
    //        $('#info').html("<pre>" + JSON.stringify(data.properties, null, " ") + "</pre>")
          }
        });  
}

var renderScore = function() {
  $('#score').html(mystates.length + " / " + Object.keys(states).length);
}

var checkState = function(s) {
  s = s.toLowerCase();
  var i = mystates.indexOf(s);
  if(i > -1) {
    return;
  } else if (i == -1 ) {
    if(Object.keys(states).indexOf(s)>-1) {
      mystates.push(s);
      renderState(s);
      $('#state').val("");
      renderScore();
    }
  }
}

var stateChange = function() {
  //console.log("!!!");
  checkState($('#state').val())
};

fetchStateNames();
      
      

