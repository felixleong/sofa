function(evt) {
  evt.preventDefault();

  var form = $('#new-comment');
  var app = $$(this).app;
  var Mustache = app.require('vendor/couchapp/lib/mustache');
  var markdown = app.require('vendor/couchapp/lib/markdown');

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
}
