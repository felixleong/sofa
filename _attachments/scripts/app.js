$.couch.app(function(app) {
  $('.date').prettyDate(); // Prettify all dates on the page

  // Load the login session Evently widget
  $('#account').evently(
//    app.ddoc.vendor.couchapp.evently.account, // Our base login session Evently widget…
    $.extend(true,
      app.ddoc.vendor.couchapp.evently.account, // Our base login session Evently widget…
      app.ddoc.evently.account // We would override the default handlers with our own
    ),
    app
  );
});
