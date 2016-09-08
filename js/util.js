var MyUtil = {};

MyUtil.DEBUG = false;

MyUtil.getQueryParameter = function(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

MyUtil.log = function() {
  if (MyUtil.DEBUG) {
    console.log(arguments);
  }
}
