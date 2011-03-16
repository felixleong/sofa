function(head, req) {
  var ddoc = this;
  var Mustache = require('vendor/couchapp/lib/mustache');
  var List = require('vendor/couchapp/lib/list');
  var path = require('vendor/couchapp/lib/path').init(req);
  var markdown = require('vendor/couchapp/lib/markdown');

  var indexPath = path.list('index', 'recent-posts', {descending: true, limit: 10});
  var feedPath = path.list('index', 'recent-posts', {descending: true, limit: 10, format: 'atom'});
  var commentsFeed = path.list('comments', 'comments', {descending: true, limit: 10, format: 'atom'});

  // The HTML view
  provides('html', function() {
    // Get the first row and make sure it's a post
    var post = getRow().value;
    if (post.type != 'post') {
      throw(['error', 'not_found', 'not a post']); // Here's how you'd do a 404
    }

    // Determine the format and generate the HTML if necessary
    if (post.format == 'markdown') {
      var html = markdown.encode(post.body);
    } else {
      var html = Mustache.escape(post.html);
    }

    // Load up the context variable to be stuff into the template
    var stash = {
      // This is only passed to the header partial template
      header: {
        index: indexPath,
        blogName: ddoc.blog.title,
        feedPath: feedPath,
        commentsFeed: commentsFeed
      },
      assets: path.asset(),
      title: post.title,
      blogName: ddoc.blog.title, //… hence this needs to be duplicated :(
      post_id: post._id,
      date: post.created_at,
      html: html
    };

    // Read and load the comments as well
    comments = [];
    while (row = getRow()) {
      var v = row.value;

      // Break the loop once all the comments for this current post is retrieved
      if (v.type != "comment") {
        break;
      }

      comments.push({
        comment: {
          name: v.commenter.nickname || v.commenter.name,
          url: v.commenter.url,
          avatar: v.commenter.gravatar_url || 'http://www.gravatar.com/avatar/' + v.commenter.gravatar + '.jpg?s=40&d=identicon',
          html: markdown.encode(Mustache.escape(v.comment)),
          created_at: v.created_at
        }
      });
    }
    stash.comments = comments;

    // Render the HTML template
    return Mustache.to_html(ddoc.templates.post, stash, ddoc.templates.partials, List.send);
  });
}
