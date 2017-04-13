// Static comments
(function ($) {
    
  $('#contactForm').submit(function (event) {
      console.log("action")
      event.preventDefault();
    var form = this;

    $.ajax({
      type: $(this).attr('method'),
      url: $(this).attr('action'),
      data: $(this).serialize(),
      contentType: 'application/x-www-form-urlencoded',
      success: function (data) {
        console.log("yey");
      },
      error: function (err) {
        console.log(err);
      }
    });

    return false;
  });
})(jQuery);