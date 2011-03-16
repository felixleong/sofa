function(doc, req) {  
  var ddoc = this;
  var Mustache = require('vendor/couchapp/lib/mustache');
  var path = require('vendor/couchapp/lib/path').init(req);

  // Generate the paths for links on the page
  //TODO: Maybe a good idea to split out the part that generate common data
  var indexPath = path.list('index', 'recent-posts', {descending: true, limit: 10});
  var feedPath = path.list('index', 'recent-posts', {descending: true, limit: 10, format: 'atom'});
  var commentsFeed = path.list('comments', 'comments', {descending: true, limit: 10, format: 'atom'});

  // Define the context variables to be passed into the template
  var data = {
    // This is only passed to the header partial template
    header: {
      index: indexPath,
      blogName: ddoc.blog.title,
      feedPath: feedPath,
      commentsFeed: commentsFeed
    },
    scripts: {},
    pageTitle: doc ? 'Edit: ' + doc.title : "Create a new post",
    blogName: ddoc.blog.title, //… hence this needs to be duplicated :(
    assets: path.asset()
  };

  // Extra context variables: depending on whether it's in create or edit mode
  if (doc) {
    data.doc = JSON.stringify(doc);
    data.title = doc.title;
    data.body = doc.body;
    data.tags = doc.tags.join(", ");
  } else {
    data.doc = JSON.stringify({
      type: 'post',
      format: 'markdown'
    });
  }

  // Render our template
  return Mustache.to_html(ddoc.templates.edit, data, ddoc.templates.partials);
}
