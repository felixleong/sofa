function(evt) {
  evt.preventDefault();

  var app = $$(this).app;
  var form = $(this);
  var newComment = {
    type: 'comment',
    post_id: app.post_id,
    format: 'markdown',
    comment: $('[name=comment]', form).val(),
    commenter: $$('#profile').profile,
    created_at: new Date()
  };

  app.db.saveDoc(newComment, {
    success: function() {
      $('#new-comment').html('<h2>Success! Your comment has posted.</h2><p>Refresh the page to see it.</p>')
    }
  });
}
