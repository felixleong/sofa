function(doc) {
  // !code vendor/couchapp/lib/md5.js

  if (doc.type == 'comment') {
    if (doc.commenter && doc.commenter.email && !doc.commenter.gravatar_url) {
      // TODO: normalize this schema-ness
      doc.commenter.gravatar = hex_md5(doc.commenter.email);
    }
    emit(new Date(doc.created_at), doc);
  }
}
