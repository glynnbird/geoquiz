// fetch a list of quizes
var fetchQuizes = function() {

  $.ajax({ url: "/proxy/geoquiz/_design/fetch/_view/byType",
           data: { include_docs: "true", key: "\"Quiz\"", reduce: "false"},
           success: function(data) {
             data = JSON.parse(data);
             data.rows.forEach(function(d) {
               d = d.doc;
               console.log(d._id,d.name);  
               $('#quiz').append('<option value="' + d._id + '">' + d.name + '</option>');
             });
          }
        });  
};

// bounce to the chosen quiz
var quizChange = function() {
  var quiz_id = $('#quiz').val();
  if (quiz_id.length > 0 ) {
    location.href = "/quiz/" + quiz_id;
  }
};

$(window).load(function() {

  fetchQuizes();

});

