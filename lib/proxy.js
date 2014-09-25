var request = require('request');

module.exports = function(prefix, proxy_url){
  return function(req, res, next){
    var proxy_path = req.path.match(RegExp("^\\/" + prefix + "(.*)$"));
    // only allow GET requests or POST requests to the geoquiz_stats db
    if(proxy_path && (req.method == "GET" || (req.method == "POST" && req.path.match(/geoquiz_stats/) ))){
      var db_url = proxy_url + proxy_path[1];
      var opts = {
        uri: db_url,
        method: req.method,
        qs: req.query
      };
      if (req.method == "POST") {
        opts.body = req.body;
      }
      req.pipe(request(opts)).pipe(res);
    } else {
      next();
    }
  };
};