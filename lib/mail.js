const nodemailer = require('nodemailer')
const config = require('../config/user.json')

var transporter

function init () {
  transporter = nodemailer.createTransport({
    service: 'Yandex',
    host: 'smtp.yandex.ru',
    port: 465,
    auth: config.mailauth
  })
}

function send (to, subject, content) {
  var mailOptions = {
    from: config.mailauth.user,
    to: to,
    subject: subject,
    html: content
    // html: '<p>You have got a new message</b><ul><li>Username:' + '</li><li>Email:' + '</li><li>Username:' + '</li></ul>'
  }
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}

// const message = {
//   from: 'elonmusk@tesla.com',
//   to: 'to@email.com',
//   subject: 'Design Your Model S | Tesla',
//   html: '<h1>Have the most fun you can in a car!</h1><p>Get your <b>Tesla</b> today!</p>',
//   attachments: [
//       { // Use a URL as an attachment
//         filename: 'your-testla.png',
//         path: 'https://media.gettyimages.com/photos/view-of-tesla-model-s-in-barcelona-spain-on-september-10-2018-picture-id1032050330?s=2048x2048'
//     }
//   ]
// };

module.exports.init = init
module.exports.send = send
