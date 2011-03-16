function(head, req) {
  var ddoc = this;

  var Mustache = require('vendor/couchapp/lib/mustache');
  var List = require('vendor/couchapp/lib/list');
  var Atom = require('vendor/couchapp/lib/atom');
  var path = require('vendor/couchapp/lib/path').init(req);

  var indexPath = path.list('index', 'recent-posts', {descending: true, limit: 10});
  var feedPath = path.list('index', 'recent-posts', {descending: true, limit: 10, format: 'atom'});
  var commentsFeed = path.list('comments', 'comments', {descending: true, limit: 10, format: 'atom'});

  var path_parts = req.path;

  // Provide the HTML format (preferred)
  provides('html', function() {
    var key = '';
    // Template context variable
    var stash = {
      // This is only passed to the header partial template
      header: {
        index: indexPath,
        blogName: ddoc.blog.title,
        feedPath: feedPath,
        commentsFeed: commentsFeed
      },
      db: req.path[0],
      design: req.path[2],
      blogName: ddoc.blog.title, //… hence this needs to be duplicated :(
      feedPath: feedPath,
      assets: path.asset(),
      // TODO: This should be limit + 1, so that we could prefetch an extra key for the next page
      "5": path.limit(5),
      "10": path.limit(10),
      "25": path.limit(25)
    };

    var posts = [];
    while (row = getRow()) {
      var post = row.value;
      key = row.id;

      posts.push({
        title: post.title,
        author: post.author,
        date: post.created_at,
        link: path.list('post', 'post-page', {startkey: [row.id]}),
        has_tags: post.tags ? true : false,
        tags: post.tags && post.tags.map ? post.tags.map(function(tag) {
          var t = tag.toLowerCase();
          return {
            tag: tag,
            // Great example of using the same list function and template to generate
            // a different page
            link: path.list('index', 'tags', {
              descending: true,
              reduce: false,
              startkey: [t, {}],
              endkey: [t]
            })
          };
        }) : []
      });
    }
    stash.posts = posts;
    // TODO:
    // 1. The older function is a bug, which the first post of the next page will be the last post
    // 2. Need a newer function to page through new posts
    stash.older = function() { return path.older(key); };

    // Pass to the template and generate the page
    return Mustache.to_html(ddoc.templates.index, stash, ddoc.templates.partials, List.send);
  });

  // Provide the ATOM feed
  provides('atom', function() {
    var markdown = require('vendor/couchapp/lib/markdown');

    var row = getRow();

    // Generate and send the feed header chunk
    var feedHeader = Atom.header({
      updated: (row ? new Date(row.value.created_at) : new Date()),
      title: ddoc.blog.title,
      feed_id: path.absolute(indexPath),
      feed_link: path.absolute(feedPath)
    });
    send(feedHeader);

    // Generate and send the feed entries chunks
    if(row) {
      do {
        if(row.value.format == 'markdown') {
          var html = markdown.encode(row.value.body);
        } else {
          var html = Mustache.escape(row.value.html);
        }

        var feedEntry = Atom.entry({
          entry_id: path.absolute('/' + encodeURIComponent(req.info.db_name) + '/' + encodeURIComponent(row.id)),
          title: row.value.title,
          content: html,
          updated: new Date(row.value.created_at),
          author: row.value.author,
          alternate: path.absolute(path.show('post', row.id))
        });
        send(feedEntry);
      } while(row = getRow());
    }

    // Close the feed once all rows are rendered
    return '</feed>';
  });
}
