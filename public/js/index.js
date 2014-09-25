// bounce to the chosen quiz
var quizChange = function() {
  var quiz_id = $('#quiz').val();
  if (quiz_id.length > 0 ) {
    location.href = "/quiz/" + quiz_id;
  }
};
