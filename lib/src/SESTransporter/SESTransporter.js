'use strict';

const { Credentials, SES, config } = require('aws-sdk');
const MailComposer = require('nodemailer/lib/mail-composer');
const { fromFile } = require('file-type');
const fs = require('fs');
const path = require('path');
const PromiseUtil = require('@gkampitakis/promise-util').default;

class SESTransporter {
  constructor (accessKeyId, secretAccessKey, region) {
    if (accessKeyId && secretAccessKey && region) {
      const credentials = new Credentials({ accessKeyId, secretAccessKey });

      config.update({ credentials, region });
    }

    this.client = new SES();
  }

  async send (message) {
    const { from, to, subject } = message;

    if (!from || !to || !subject) {
      throw new Error('Missing one of required parameters [from, to, subject]');
    }

    const Data = await messageTransform(message);

    return this.client.sendRawEmail({ RawMessage: { Data } }).promise();
  }
}

async function messageTransform (message) {
  const { from, to, subject, html, text, cc = [], bcc = [], replyTo, attachments = [], ...rest } = message;

  const _attachments = await processAttachments(attachments);

  const msg = new MailComposer({
    ...(cc.length && { cc: cc.join(',') }),
    ...(bcc.length && { bcc: bcc.join(',') }),
    ...(to && { to: to.join(',') }),
    ...(subject && { subject }),
    ...(html && { html }),
    ...(text && { text }),
    ...(replyTo && { replyTo }),
    ...(attachments.length && { attachments: _attachments }),
    from,
    ...rest
  });

  return new Promise((resolve, reject) => {
    msg.compile().build((err, message) => {
      if (err) return reject(err);

      resolve(message);
    });
  });
}

function processAttachments (files) {
  return PromiseUtil.map(files, async (file) => {
    let filepath = file.path;
    let filename = file.name;

    if (!file.path) filepath = file;
    if (!file.name) {
      const parsePath = path.parse(filepath);
      filename = parsePath.name + parsePath.ext;
    }

    const result = await fromFile(filepath);
    const content = fs.readFileSync(filepath).toString('base64');

    return {
      contentType: result?.mime,
      filename,
      encoding: 'base64',
      content
    };
  });
}

module.exports = { SESTransporter };
