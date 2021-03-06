# SES Email Client

[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg)](https://github.com/standard/semistandard)

## Description

`ses-email-client` is a wrapper for sending emails with **AWS SES** supporting templates.

### Supported Templates

-   mjml
-   handlebars
-   ejs

## Install

```bash
npm i ses-email-client
```

## Usage

### Instantiate Client

**All settings are optional**

```javascript
// or ES6 syntax import SESEmailClient from 'ses-email-client';
const SESEmailClient = require('ses-email-client');
const client = new SESEmailClient({
    accessKeyId: '**********',
    secretAccessKey: '**********',
    region: 'eu-west-2',
    templateLanguage: 'handlebars', // 'mjml', 'ejs'
    production: true, // or process.env.NODE_ENV = production is as setting to true
    tmpltCacheSize: 50, // template cache size default = 100
    attCacheSize: 50, // attachment cache size default = 100
});
```

> Note that in production mode either by explicitly setting it to true or by setting NODE_ENV = production **ses-email-client** will cache template and attachment files.

For AWS you can skip providing credentials as the `aws-sdk` is used so you can opt for other ways for authorizing.

For more info you can check [setting-credentials-node](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html).

### Send an email

```javascript
await client.send({
    from: 'mock@email.com',
    to: 'test@email.com',
    subject: 'Hello World',
    text: 'Hello World',
});
```

### Message options

-   from `string`
-   to `string` or `string []`
-   cc `string` or `string []`
-   bcc `string` or `string []`
-   text `string`
-   html `string`
-   subject `string`
-   template `string` the path of the html template you want to use
-   data `object` an object containing the data that the template is going to be compiled with
-   subject `string`
-   attachments

```js
[
    {
        name: 'myfilte.txt', // optional if not provided will keep filename
        path: __dirname + '/path/to/file',
    },
][
    // or
    (__dirname + '/path/to/file', 'another/file')
];
```

### Example

You can also check an [example](./example) usage.

### Issues

For any [issues](https://github.com/gkampitakis/ses-email-client/issues).

## License

MIT License
