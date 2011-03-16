function (newDoc, oldDoc, userCtx, secObj) {
  var v = require('vendor/couchapp/lib/validate').init(newDoc, oldDoc, userCtx, secObj);
  // Additional validation functions
  v.isAuthor = function() {
    return v.isAdmin() || v.isRole('author');
  };

  // Handle the deletion validation
  if (oldDoc && newDoc._deleted) {
    if (oldDoc.author == userCtx.name || v.isAdmin()) {
      return true;
    } else {
      v.unauthorized('Only the original author may delete this post');
    }
  } 

  // Forbid any editing on the following fields
  v.unchanged('type');
  v.unchanged('author');
  v.unchanged('created_at');

  // General fields - format validation
  if (newDoc.created_at) v.dateFormat('created_at');

  // Creation and update - field validation
  switch(newDoc.type) {
  case 'post':
    if (! v.isAuthor()) {
      v.unauthorized('Only authors may create or edit posts');
    }
    v.require('created_at', 'author', 'title', 'body', 'format');
    break;
  case 'comment':
    v.require('created_at', 'post_id', 'commenter', 'comment', 'format');

    // Validate the commenter field formats
    v.assert(
      (newDoc.commenter.name || newDoc.commenter.nickname) &&
        (typeof newDoc.commenter.email != 'undefined'),
      'Comments must include name and email'
    );
    if (newDoc.commenter.url) {
      v.assert(
        newDoc.commenter.url.match(/^https?:\/\/[^.]*\..*/),
        'Commenter URL must start with http://'
      );
    }
    break;
  default:
    v.forbidden('Invalid document type'); // let's be a bit iron-fist on what gets in the DB ;)
  }
}
