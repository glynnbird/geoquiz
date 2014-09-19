var zoomLevel = 4;
var states = { };
var mystates = [];
var started= false;
var elapsed = 0;
var timer = null;

// leaflet map options
var options = {
  zoomControl: false,
  dragging: false,
  touchZoom: false,
  scollWheelZoom: false,
  doubleClickZoom: false,
  boxZoom: false,
  minZoom: zoomLevel,
  maxZoom: zoomLevel
}

// land styling
var greenStyle = {
    color: "#666",
    fillColor: "#66bb66",
    fillOpacity: 1.0,
    weight: 1,
    opacity: 1
};

// state styling
var fancyStyle = {
  color: "#ff8888",
  weight: 3,
  opacity: 0.6,
  fillOpacity: 0.5,
};

// generate a map
var map = L.map('map', options).setView([43.74739, -105], zoomLevel);

// render a GeoJSON object on the map
var renderGeoJSON = function(obj, style, label) {
  var opts = {
    style: style,
    onEachFeature: function(feature, layer) {
      layer.bindPopup(label);
    }
  }
  L.geoJson(obj, opts).addTo(map);
};

// load the state names from Cloudant      
var fetchStateNames = function() {
  $.ajax({url: "/proxy/usstates/_design/fetch/_view/byName",
          success: function(data) {
            data = JSON.parse(data);
            for(var i in data.rows) {
              states[data.rows[i].id] = data.rows[i].key;
            }
          }
        });   
} ;     
      
// render a JSON object as a table of key/values      
var jsonToTable = function(d) {
  var table = "<table>";
  for(var i in d) {
    table += "<tr><th>" + i + "</th><td>" + d[i] + "</td></tr>";
  }
  table += "</table>";
  return table;
};      
      
// given a state name, load it's GeoJSON from Cloudant and render it      
var renderState = function(state) {
  $.ajax({url: "/proxy/usstates/" + encodeURIComponent(state),
          success: function(data) {
            data = JSON.parse(data);
            renderGeoJSON(data, fancyStyle, data.properties.name);
            $("#info").html(jsonToTable(data.properties));
          }
        });  
}

// show the current score e.g 4/50
var renderScore = function() {
  $('#score').html(mystates.length + " / " + Object.keys(states).length);
}

// check if state 's' is in our list
var checkState = function(s) {
  // first keypress, start the timer
  if(!started) {
    started = true;
    startTimer();
  }
  
  // lowercase it
  s = s.toLowerCase();
  
  // check of existance in list of states
  var i = mystates.indexOf(s);
  if(i > -1) {
    return;
  } else if (i == -1 ) {
    
    // if hasn't already been found 
    if(Object.keys(states).indexOf(s)>-1) {
      
      // draw it
      mystates.push(s);
      renderState(s);
      
      // clear the input control
      $('#state').val("");
      
      // update the score
      renderScore();
      
      // check for quiz complete
      if (mystates.length == Object.keys(states).length) {
        stopTimer();
        alert("Quiz complete");
      }
    }
  }
}

// pad a number with leading zeros
var pad = function(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

// show elapsed time in minutes + seconds
var renderTimer  = function() {
  var s = elapsed % 60;
  var m = Math.floor(elapsed / 60);
  $('#timer').html(pad(m,2)+":"+pad(s,2));
}


// called when the quiz starts
var startTimer = function() {
  
  // show the score
  renderScore();
  elapsed = 0;
  
  // and the timer
  renderTimer();
  
  // repeat every second
  timer = setInterval(function() {
    elapsed++;
    renderTimer();
  },1000);
}

// called at end of the quiz
var stopTimer = function() {
  clearInterval(timer);
  timer = null;
};

// called whenever the input control changes state
var stateChange = function() {
  checkState($('#state').val())
};


// onload
$(window).load(function() {
  // render the world
  $.ajax({url: "/js/world.json",
          success: function(data) {
            renderGeoJSON(data, greenStyle);
          }
        });

  fetchStateNames();
});

      
      

