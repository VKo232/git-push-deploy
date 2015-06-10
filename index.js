var http = require("http");
var url = require("url");
var spawn = require("child_process").spawn;
var path = require("path");

http.createServer(function(req, res){
  res.writeHeader(200, {"Content-Type": "text/plain"});
  if(req.method == "POST") {
    var raw = "";
    req.on("data", function (x) {
      raw += x.toString()
    });
    req.on("end", function () {
      var reqUrl = req.url;
      var reqQuery = url.parse(reqUrl, true).query;
      var body = JSON.parse(raw);
      var repoName = body.repository.name;
      var repoUrl = body.repository.links.html.href;
      console.log("New Push", repoName, repoUrl, reqQuery);
      res.write("ok");
      res.end();

      if (reqQuery.script) {
        var script = reqQuery.script.replace(/\.\./g, "dotdot");
        var fullPath = path.join("/usr/src/scripts", script + ".sh");
        console.log("script path", fullPath);
        var shargs = [repoName, repoUrl];
        var index = 3;
        while(true){
          var key = "arg" + index;
          var val = reqQuery[key];
          if(typeof(val) == "string"){
            shargs.push(val);
            index += 1; 
          }else{
            break;
          };  
        }
        console.log("script args", JSON.stringify(shargs));
        var buildProcess = spawn(fullPath, shargs);
        buildProcess.stdout.pipe(process.stdout);
        buildProcess.stderr.pipe(process.stderr);
        buildProcess.on("error", console.error.bind(console));
        buildProcess.on("close", function () {
          console.log("Script completed");
        });
      } else {
        console.error("Error: SCRIPT query param not set in url request");
      }
    });
  }else {
    res.write("hi, server is working :-)");
    res.end();
  }
}).listen(process.env.PORT || 3000);

//curl -X POST -H "Content-Type: application/json" --data @bitbucket-payload.json "http://localhost:3000?A=1&B=2&SCRIPT=deploy"
