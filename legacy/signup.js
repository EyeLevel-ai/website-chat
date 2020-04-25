window.isPosting = false;

$(document).ready(function() {
  $('#contact_form').bootstrapValidator({
    feedbackIcons: {
      valid: 'glyphicon glyphicon-ok',
      invalid: 'glyphicon glyphicon-remove',
      validating: 'glyphicon glyphicon-refresh'
    },
    fields: {
      first_name: {
        validators: {
          stringLength: {
            min: 2,
            max: 32
          },
          notEmpty: {
            message: 'Please enter your first name'
          }
        }
      },
      last_name: {
        validators: {
          stringLength: {
            min: 2,
            max: 32
          },
          notEmpty: {
            message: 'Please enter your last name'
          }
        }
      },
      email: {
        validators: {
          notEmpty: {
            message: 'Please enter your email address'
          },
          emailAddress: {
            message: 'Please enter a valid email address'
          }
        }
      },
      bot: {
        validators: {
          stringLength: {
            min: 3,
            max: 500,
            message:'Please enter a URL that is between 3 and 500 characters'
          },
          uri: {
            message:'Please enter a valid URL including a protocol first (http://, https://)'
          }
        }
      },
      mau: {
        validators: {
          stringLength: {
            max: 50,
            message:'Please enter a number that is 50 characters or less'
          }
        }
      },
      products: {
        validators: {
          stringLength: {
            min: 5,
            max: 500,
            message:'Please enter between 5 and 500 characters'
          }
        }
      }
    }
  })
  .on('success.form.bv', function(e) {
//    $('#success_message').slideDown({ opacity: "show" }, "slow")
    if (!window.isPosting) {
      mixpanel.track('GENERATING_REQUEST');
      $('#contact_form').data('bootstrapValidator').resetForm();
      e.preventDefault();
      window.isPosting = true;
      var $form = $(e.target);
      var bv = $form.data('bootstrapValidator');
      var vals = $form.serializeArray();
      var name = '';
      var data = {};
      for (var i in vals) {
        var val = vals[i];
        if (val.name === 'first_name') {
          if (name.length) {
            name = val.value + ' ' + name;
          } else {
            name = val.value;
          }
        } else if (val.name === 'last_name') {
          if (name.length) {
            name += ' ' + val.value;
          } else {
            name = val.value;
          }
        } else if (val.name === 'products') {
          if (data['rec_profile']) {
            data['rec_profile']['products'] = val.value;
          } else {
            data['rec_profile'] = { products: val.value };
          }
        } else if (val.name === 'mau' && val.value.length) {
          data[val.name] = parseInt(val.value);
        } else if (val.value.length) {
          data[val.name] = val.value;
        }
      }
      if (data['rec_profile'] && typeof data['rec_profile'] !== 'string') {
        data['rec_profile'] = JSON.stringify(data['rec_profile']);
      }
      data['name'] = name;
      mixpanel.track('SUBMITTING_REQUEST');
      var p1 = new Promise(function(resolve, reject) {
        $.post($form.attr('action'), $form.serialize(), function(result) {
          if (result) {
            if (result.code) {
              if (result.code === 200) {
                mixpanel.track('ACTION_RESPONSE_OK');
                resolve(result);
              } else if (result.code === 400) {
                mixpanel.track('ACTION_RESPONSE_ERROR', { code: 400 });
                reject(400);
              }
            } else {
              mixpanel.track('ACTION_RESPONSE_ERROR', { code: 500 });
              reject(500);
            }
          } else {
            mixpanel.track('ACTION_RESPONSE_ERROR', { code: 501 });
            reject(501);
          }
        }, 'json');
      });
      var p2 = new Promise(function(resolve, reject) {
        $.ajax({
          type: 'POST',
          url: 'https://api.cashbot.ai/register',
          dataType: 'json',
          contentType: 'application/json',
          data: JSON.stringify(data),
          xhrFields: {
            withCredentials: true
          }
        }).done(function(result) {
          mixpanel.track('REGISTER_RESPONSE_OK');
          resolve(result);
        }).fail(function(err) {
          mixpanel.track('REGISTER_RESPONSE_ERROR', { code: err.status || 500 });
          reject(err.status || 500);
        });
      });

      Promise.all([p1, p2])
        .then(function(res) {
          mixpanel.track('SIGNUP_SUCCESS');
          window.isPosting = false;
          window.location.href = '//cashbot.ai/success';
          return res;
        }).catch(function(err) {
          mixpanel.track('SIGNUP_ERROR', {'err': JSON.stringify(err)});
          window.isPosting = false;
          if (err === 400) {
            $('#error_content').text('Thanks for testing cashbot.ai. We\'d love for you to legitimately fill out our form and to be part of the community we\'re trying to create.');
            $('#error_message').slideDown({ opacity: "show" }, "slow");
          } else {
            $('#error_content').text('There was a server error. Please try again later.');
            $('#error_message').slideDown({ opacity: "show" }, "slow");
            return err;
          }
        });
    }
  });

  $("input").change(function(e) {
    mixpanel.track('INPUT_ENTERED', { 'type': e.target.name, 'value': e.target.value });
  });
  $('#signupSubmit').click(function() {
    mixpanel.track('SIGNUP_SUBMITTED');
  });
});
