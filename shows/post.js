function(doc, req) {  
  var path = require('vendor/couchapp/lib/path').init(req);
  var redirect = require('vendor/couchapp/lib/redirect');

  // We would need to redirect to a list page because it'd be easier to retrieve the comments
  // associated with it using the post-page view
  return redirect.permanent(path.list('post', 'post-page', {startkey: [doc._id]}));
}
