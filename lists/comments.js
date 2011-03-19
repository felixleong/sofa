function(head, req) {
  var ddoc = this;
  var Mustache = require('vendor/couchapp/lib/mustache');
  var List = require('vendor/couchapp/lib/list');
  var Atom = require('vendor/couchapp/lib/atom');
  var path = require('vendor/couchapp/lib/path').init(req);
  var markdown = require('vendor/couchapp/lib/markdown');

  var indexPath = path.list('index', 'recent-posts', {descending: true, limit: 10});
  var commentsFeed = path.list('comments', 'comments', {descending: true, limit: 10, format: 'atom'});

  // Provides the view in ATOM format (preferred)
  provides('atom', function() {
    var row = getRow();

    // Generate the feed header
    var feedHeader = Atom.header({
      updated: (row ? new Date(row.value.created_at) : new Date()),
      title: ddoc.blog.title + " comments",
      feed_id: path.absolute(indexPath),
      feed_link: path.absolute(commentsFeed)
    });

    // Send the header to the client
    send(feedHeader);

    // Loop over all rows and generate the corresponding feed entries - send them in chunks
    if (row) {
      do {
        var v = row.value;

        var feedEntry = Atom.entry({
          entry_id: path.absolute('/' + encodeURIComponent(req.info.db_name) + '/' + encodeURIComponent(row.id)),
          title: 'comment on ' + v.post_id,
          content: markdown.encode(Mustache.escape(v.comment)),
          updated: new Date(v.created_at),
          author: v.commenter.nickname || v.commenter.name,
          alternate: path.absolute(path.list('post', 'post-page', {startkey: [v.post_id]}))
        });
        send(feedEntry);
      } while (row = getRow());
    }

    return "</feed>";
  });
}
