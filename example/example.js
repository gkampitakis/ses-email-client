const SESClient = require('../lib');
const path = require('path');

const settings = {
  accessKeyId: '**********',
  secretAccessKey: '**********',
  region: 'eu-west-2',
  templateLanguage: 'handlebars' // 'mjml', 'ejs'
};

const client = new SESClient(settings);

client.send({
  from: 'mock@email.com',
  to: 'mock@email.com',
  text: 'hello world',
  subject: 'hello world',
  template: path.resolve(__dirname, './templates/test.hbs'),
  data: {
    user: {
      name: 'my name'
    }
  },
  attachments: [{
    path: path.resolve(__dirname, './templates/test.hbs'),
    name: 'templateFile.hbs'
  }]
})
  .then((res) => console.log(res))
  .catch((err) => console.log(err));

