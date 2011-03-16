function(e, r) {
  var app = $$(this).app;
  var path = app.require('vendor/couchapp/lib/path').init(app.req);

  // Shove in some context variables
  var data = {
    name: r.userCtx.name,
    uri_name: encodeURIComponent(r.userCtx.name),
    auth_db: encodeURIComponent(r.info.authentication_db)
  };

  // Add the create/edit post link if the user is an admin or has the author role
  if (r.userCtx.roles.indexOf('_admin') != -1 || r.userCtx.roles.indexOf('author') != -1) {
    // If the page isn't on an individual post page, show the "New Post" link
    if (app.req.path.indexOf('post-page') == -1) {
      data.postPath = path.show('edit') + '/';
      data.postMessage = 'New post';

    // ... Otherwise, let the user to edit this current post
    } else {
      data.postPath = path.show('edit', app.req.query.startkey[0]);
      data.postMessage = 'Edit this post';
    }
  }

  return data;
}
