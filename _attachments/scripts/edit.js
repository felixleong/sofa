$.couch.app(function(app) {
  var path = app.require('vendor/couchapp/lib/path').init(app.req);
  var blog = app.require('vendor/app/blog');

  // Build up the tagcloud handler
  var tagcloud = $.extend(true, {}, this.ddoc.evently.tagcloud, {
    _init: {
      selectors: {
        a: {
          click: function() {
            var tag = $(this).text();
            var tags = $('input[name=tags]').val();
            if (tags) tags = tags + ',';
            $('input[name=tags]').val(tags + tag);
            return false;
          }
        }
      }
    }
  });
  $('#tagcloud').evently(tagcloud, this);

  // UI changes
  $('label[for=body]').append(' <em>with ' + (postDoc.format||'html') + '</em>');

  // Wiring up events
  // Submiting a post
  $('form#new-post').submit(function(evt) {
    evt.preventDefault();

    // Check that the user is logged in before allowing a post
    if (! $$('#account').userCtx) {
      alert('You need to login to create or edit a post.');
      return false;
    }

    // Populate the CouchDB document
    postDoc.author = $$('#account').userCtx.name;
    postDoc.title = $('input[name=title]').val();
    postDoc.body = $('textarea[name=body]').val();
    // Tags
    var dtags = [], tags = $('input[name=tags]').val().split(',');
    for(var i in tags) { dtags.push($.trim(tags[i])); }
    postDoc.tags = dtags;
    // Fill in default fields
    if (! postDoc.created_at) { postDoc.created_at = new Date(); }
    if (! postDoc._id) { postDoc._id = blog.slugifyString(postDoc.title); }
    
    // Save the document
    app.db.saveDoc(postDoc, {
      success: function(resp) {
        $('#saved').text('Saved _rev:' + resp.rev).fadeIn(500).fadeOut(6000);
        $('h1').html('Editing <a href="' + path.show('post', resp.id)  + '">' + resp.id + '</a> by ' + postDoc.author);
      }
    });
  });

  // Previewing a post
  $('#preview').click(function() {
    var markdown = app.require('vendor/couchapp/lib/markdown');
    var html = markdown.encode($('textarea[name=body]').val());
    $('#show-preview').html(html);
    $('body').scrollTo('#show-preview', {duration: 500});
  });

  // Show delete button if it's editing an existing post
  if (postDoc._id) {
    $('#preview').before('<input type="button" id="delete" value="Delete Post" />');
    $('#delete').click(function() {
      app.db.deleteDoc(postDoc, {
        success: function(resp) {
          $('h1').text('Deleted ' + resp.id);
          $('form#new-post input').attr('disabled', true);
        }
      });
    });
  }
});
