var Q = require("q");
var _ = require("underscore");

function p(){
    var d = Q.defer();
    d.resolve((new Date).getTime());
    return d.promise;
}

p = _.throttle(p, 5000);
p = _.debounce(p, 5000, true);

setInterval(function(){
    p().then(function(result){
        console.log(result);
    });
}, 100);




