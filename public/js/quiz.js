var states = { };
var mystates = [];
var layers = [ ]
var started= false;
var elapsed = 0;
var timer = null;

// leaflet map options
var options = {
  zoomControl: false,
  dragging: true,
  touchZoom: false,
  scollWheelZoom: false,
  doubleClickZoom: false,
  boxZoom: false
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

var neversubmit = function() {
  return false;
}

var getCookie = function(key) {
  var bits = document.cookie.split(";");
  for(var i in bits) {
    var kp = bits[i].split("=");
    if(kp[0]== key) {
      return kp[1];
    }
  }
  return null;
}

var introdismiss = function() {
  
  // set a cookie to keep this user's initials for the next time
  var initials = $('#initials').val();
  document.cookie="initials="+initials+"; path=/";
  console.log(getCookie("initials"));
  
  setTimeout(function() {
    $('#state').focus();
    $('#state').popover("show");
  },500);
  
}

// generate a map
var map = L.map('map', options).setView([0, 0], 2);

// render a GeoJSON object on the map
var renderGeoJSON = function(obj, style, label) {
  var opts = {
    style: style,
    onEachFeature: function(feature, layer) {
      if (typeof label == "string" && label.length >0) {
        layer.bindPopup(label); 
             
      }
    }
  }
  var l = L.geoJson(obj, opts).addTo(map);
  if(typeof label == "string") {
    layers.push( l );
  }

};
          
      
// given a state name, load it's GeoJSON from Cloudant and render it      
var renderState = function(state) {
  $.ajax({url: "/proxy/geoquiz/" + encodeURIComponent(state),
          success: function(data) {
            if (typeof data === 'string') {
              data = JSON.parse(data);
            }
            renderGeoJSON(data, fancyStyle, data.properties.name);
          }
        });  
}

// show the current score e.g 4/50
var renderScore = function() {
  var markup = mystates.length + " / " + Object.keys(states).length;
  $('#livescore').html(markup);
  $('#finalscore').html(markup)
}

// check if state 's' is in our list
var checkState = function(s) {
  // first keypress, start the timer
  if(!started) {
    started = true;
    startTimer();
    $("#stopbutton").prop('disabled', false);
    $('#state').popover("hide");
    
    // record that a quiz has been started in the database
    $.ajax({url: "/proxy/geoquiz_stats",
            method: "POST",
            data: JSON.stringify(quizdoc), 
            contentType: "application/json; charset=utf-8", 
            dataType: "json",
            success: function(data) {
              // store the id + rev so we can update the stats at the end of the quiz
              quizdoc._id = data.id;
              quizdoc._rev = data.rev;
            }           
          });  
  }
  
  // lowercase it and trim it
  s = s.toLowerCase();
  s = s.replace(/^ +/,"").replace(/ +$/,"");
  
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
        stopQuiz();
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
  var markup = pad(m,2)+":"+pad(s,2);
  $('#livetimer').html(markup);
  $('#finaltime').html(markup);
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


var renderQuizList = function() {
  quizes.forEach(function(q) {
  });
}

var startQuiz = function(quiz) {
  
  // see if we have initials
  var initials = getCookie("initials");
  if(initials) {
      $('#initials').val(initials)
  }
  
  // show the modal
  $('#introtitle').html(quiz.name);
  $('#introdescription').html(quiz.description);
  $('#intro').modal('show');
  
  
  states = { };
  mystates = [];
  elapsed = 0;
  quizdoc = { };
  
  // mark start of quiz
  var now = moment().utc();
  quizdoc.startdate = now.format("YYYY-MM-DD HH:mm:ss Z");
  quizdoc.startts = now.unix();
  quizdoc.enddate = null;
  quizdoc.endts = null;
  quizdoc.quiz_id = quiz._id;
  quizdoc.name = quiz.name
  quizdoc.score = null;

  // set titles
  $('#title').html(quiz.name);
  document.title = quiz.name;
  
  // remove old layers
  layers.forEach(function(l) {
    map.removeLayer(l);
  });
  layers = [ ];
  
  // move the map view
  map.setView([quiz.latitude, quiz.longitude], quiz.zoom);
  
  // load the state names from Cloudant      
  $.ajax({ url: "/proxy/geoquiz/_design/fetch/_view/byTypeGroup",
           data : { key: JSON.stringify( ["Feature", quiz.group]),
                    reduce: "false"
                  },
          success: function(data) {
            if (typeof data === 'string') {
              data = JSON.parse(data);
            }
            for (var i in data.rows) {
              states[data.rows[i].id] = data.rows[i].value;
            }
            renderScore();
            $("#state").prop('disabled', false);
            quizdoc.outof = Object.keys(states).length;
          }
        });   
}

var loadQuiz = function(quiz_id) {
  $.ajax({ url: "/proxy/geoquiz/" + encodeURIComponent(quiz_id),
           data: { include_docs: "true"},
           success: function(data) {
             console.log(typeof data, data);
             if (typeof data === 'string') {
               data = JSON.parse(data);
             }
             startQuiz(data);
          },
          error: function() {
            location.href = "/";
          }
        });  
};


var stopQuiz = function() {
  // disable the stop button
  $("#stopbutton").prop('disabled', true);
  
  // stop the clock
  stopTimer();
  
  // kill the map
  map.remove();
  
  // record that a quiz has been stopped in the database
  var now = moment().utc();
  quizdoc.endts = now.unix();
  quizdoc.enddate = now.format("YYYY-MM-DD HH:mm:ss Z");
  quizdoc.score = mystates.length;
  quizdoc.initials = getCookie("initials");
  $.ajax({url: "/proxy/geoquiz_stats",
          method: "POST",
          data: JSON.stringify(quizdoc), 
          contentType: "application/json; charset=utf-8", 
          dataType: "json"         
        });  
  
  // if quiz was won
  if (Object.keys(states).length == mystates.length) {
    $('#youmissed').hide();
    $('#youmissedlist').hide();
  } else {

    // calculate what was missed
    mystates.forEach(function(state) {
      delete states[state];
    });
    var html = "";
    Object.keys(states).forEach(function(i) {
      html += '<li class="list-group-item">' + states[i] + '</li>';
    });
    $('#youmissedlist').append(html);
  }
  
  // update social media links
  var markup = "I scored " + $('#finalscore').html() + " in " + $('#finaltime').html() + ' on the "' + $('#title').html() + '" at #GeoQuiz';
  document.title = markup;
  
  // twitter share button
  window.twttr=(function(d,s,id){var t,js,fjs=d.getElementsByTagName(s)[0];if(d.getElementById(id)){return}js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);return window.twttr||(t={_e:[],ready:function(f){t._e.push(f)}})}(document,"script","twitter-wjs"));
  
  // facebook share button
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&appId=700694686689593&version=v2.0";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
  
  // fill in block quote
  $('#myquote').html('"' + markup + '"');
  
  // show the modal
  $('#myModal').modal('show');
}

// onload
$(window).load(function() {
  
  // extract quizid from the path
  var match = window.location.pathname.match(/^\/quiz\/(.+)$/);
  if (match) {
    quiz_id = match[1];
  }
  
  // then load the quiz
  loadQuiz(quiz_id);
  
  // render the world
  $.ajax({url: "/js/world.json",
          success: function(data) {
            renderGeoJSON(data, greenStyle);
          }
        });

});

