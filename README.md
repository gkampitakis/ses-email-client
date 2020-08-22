# SES Email Client

[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/standard/semistandard)
[![Build Status](https://travis-ci.org/gkampitakis/ses-email-client.svg?branch=master)](https://travis-ci.org/gkampitakis/ses-email-client)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

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

```javascript
// or ES6 syntax import SESEmailClient from 'ses-email-client';
const SESEmailClient = require('ses-email-client');

const client = new SESEmailClient({
    accessKeyId: '**********',
    secretAccessKey: '**********',
    region: 'eu-west-2',
    templateLanguage: 'handlebars', // 'mjml', 'ejs'
});
```

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
-   subject `string`
-   template `string` the filename of the html template you want to use
-   data `object` an object containing the data that the template is going to be compiled with
-   subject `string`
-   attachments
```js
[
    {
        "name": "myfilte.txt", // optional if not provided take filename
        "path": __dirname + "/path/to/file"
    }
] 
// or 
[__dirname + "/path/to/file","another/file"]
```

### Changelog

[CHANGELOG.md](./CHANGELOG.md)

### Example

You can also check an [example](./example) usage.

### Issues

For any [issues](https://github.com/gkampitakis/ses-email-client/issues).
