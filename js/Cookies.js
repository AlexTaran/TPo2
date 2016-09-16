// Copypaste from http://stackoverflow.com/questions/11344531/pure-javascript-store-object-in-cookie

function set_cookie(name, value, days) {
 var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toGMTString();
  }
  var cookie = [name, '=', JSON.stringify(value), expires, '; domain=.', window.location.host.toString(), '; path=/;'].join('');
  document.cookie = cookie;
}

function get_cookie(name) {
  var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
  result && (result = JSON.parse(result[1]));
  return result;
}

function delete_cookie(name) {
  document.cookie = [name, '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/; domain=.', window.location.host.toString()].join('');
}
