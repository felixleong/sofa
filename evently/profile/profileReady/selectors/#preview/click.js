function(evt) {
  evt.preventDefault();

  var form = $('#new-comment');
  var app = $$(this).app;
  console.log('Preview clicked', this, app);
  var Mustache = app.require('vendor/couchapp/lib/mustache');
  console.log('mustache');
  var markdown = app.require('vendor/couchapp/lib/markdown');
  console.log('markdown');

  // Load up the context variables
  var profile = $$('#profile').profile;
  var c = {
    name: profile.nickname,
    url: profile.url,
    avatar: profile.gravatar_url,
    html: markdown.encode(Mustache.escape($('[name=comment]', form).val())),
    created_at: JSON.parse(JSON.stringify(new Date()))
  };

  // Render the template
  $('#comment-preview').html(Mustache.to_html(app.ddoc.templates.partials.comment, c));
  console.log('Preview ended');
}
