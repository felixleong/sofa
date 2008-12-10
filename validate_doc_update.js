function (newDoc, oldDoc, userCtx) {
  var type = (oldDoc || newDoc)['type'];
  var author = (oldDoc || newDoc)['author'];

  function forbidden(message) {
    throw({forbidden : message});
  };
  
  function unauthorized(message) {
    throw({unauthorized : message});
  };


  // docs with authors can only be saved by their author
  if (author) {
    // dirty hack to provide userCtx.name to the client process
    if (author == '_self') userCtx.name ? forbidden('_self:' + userCtx.name) : unauthorized('Please log in.');
    
    if (userCtx.roles.indexOf('_admin') == -1) {
      // admin can edit anything, only check when not admin...
      if (oldDoc && oldDoc.author != newDoc.author) 
        forbidden("You may not change the author of a doc.");

      if (author != userCtx.name)
        unauthorized("Only "+author+" may edit this document.");      
    }
  }

  // authors and admins can always delete
  if (newDoc._deleted) return true;

  // general timestamps
  if (oldDoc && oldDoc.created_at != newDoc.created_at) 
    forbidden("You may not change the created_at field of a doc.");
  
  // this ensures that the date will be parseable as well as collate correctly
  if (newDoc.created_at) {
    if (!newDoc.created_at.match(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2} \+0000/))
      forbidden("Sorry, "+newDoc.created_at+" is not a valid date format. Try: 2008/12/10 21:16:02 +0000");
  }
    
  if (type == 'post') {
    // post required fields
    if (!author) forbidden("Posts must have an author.");
    if (!newDoc.html) forbidden("Posts must have html field.");
    if (!newDoc.title) forbidden("Posts must have a title.");
    if (!newDoc.slug) forbidden("Posts must have a slug.");
    if (newDoc.slug != newDoc._id) forbidden("Post slugs must be used as the _id.")
    if (!newDoc.created_at) forbidden("Posts must have a created_at date.");
  } else if (type == 'comment') {
    // comment required fields
    if (!newDoc.commenter || !(newDoc.commenter.name && newDoc.commenter.email))
       forbidden("Comments must include name and email.");
    if (!newDoc.html) forbidden("Comments require an html body.");
  }
}