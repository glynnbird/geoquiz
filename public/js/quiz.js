var zoomLevel = 4;
var states = { };
var mystates = [];
var started= false;
var elapsed = 0;
var timer = null;

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

var greyStyle = {
    color: "#666",
    fillColor: "#66bb66",
    fillOpacity: 1.0,
    weight: 1,
    opacity: 1
};

var fancyStyle = {
  color: "#ff8888",
  weight: 3,
  opacity: 0.6,
  fillOpacity: 0.5,
};

var renderGeoJSON = function(obj,style, label) {
  var opts = {style: style}
  L.geoJson(obj, opts).addTo(map);
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
            renderGeoJSON(data, fancyStyle, data.properties.abbreviation);
            $("#info").html(jsonToTable(data.properties));
          }
        });  
}

var renderScore = function() {
  $('#score').html(mystates.length + " / " + Object.keys(states).length);
}

var checkState = function(s) {
  if(!started) {
    started = true;
    startTimer();
  }
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
      if (mystates.length == Object.keys(states).length) {
        stopTimer();
        alert("Quiz complete");
      }
    }
  }
}

var pad = function(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

var renderTimer  = function() {
  var s = elapsed % 60;
  var m = Math.floor(elapsed / 60);
  $('#timer').html(pad(m,2)+":"+pad(s,2));
}

var startTimer = function() {
  renderScore();
  elapsed = 0;
  renderTimer();
  timer = setInterval(function() {
    elapsed++;
    renderTimer();
  },1000);
}

var stopTimer = function() {
  clearInterval(timer);
  timer = null;
};

var stateChange = function() {
  checkState($('#state').val())
};

fetchStateNames();
      
      

