'use strict';

const { Credentials, SES, config } = require('aws-sdk');
const MailComposer = require('nodemailer/lib/mail-composer');
const { fromFile } = require('file-type');
const fs = require('fs');
const path = require('path');
const HLRU = require('hashlru');
const LRU = Symbol('LRU');
const messageTransform = Symbol('messageTransform');
const processAttachments = Symbol('processAttachments');
const prod = Symbol('production');

class SESTransporter {
  constructor (accessKeyId, secretAccessKey, region, production, cacheSize) {
    const settings = {
      ...(accessKeyId && secretAccessKey && { credentials: new Credentials({ accessKeyId, secretAccessKey }) }),
      ...(region && { region })
    };

    if (Object.keys(settings).length) config.update(settings);

    this.client = new SES();
    this[prod] = production;
    this[LRU] = HLRU(cacheSize || 100);
  }

  async send (message) {
    const { from, to, subject } = message;

    if (!from || !to || !subject) {
      throw new Error('Missing one of required parameters [from, to, subject]');
    }

    const Data = await this[messageTransform](message);

    return this.client.sendRawEmail({ RawMessage: { Data } }).promise();
  }

  async [messageTransform] (message) {
    const { from, to, subject, html, text, cc = [], bcc = [], replyTo, attachments = [], ...rest } = message;

    const _attachments = await this[processAttachments](attachments);

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

  async [processAttachments] (files) {
    const attachments = [];

    for (const file of files) {
      let filepath = file.path;
      let filename = file.name;

      if (!file.path) filepath = file;
      if (!file.name) {
        const parsePath = path.parse(filepath);
        filename = parsePath.name + parsePath.ext;
      }

      let attachment = this[LRU].get(filepath + '-' + filename);

      if (attachment && this[prod]) {
        attachments.push(attachment);

        break;
      }

      const result = await fromFile(filepath);
      const content = fs.readFileSync(filepath).toString('base64');

      attachment = {
        ...(result && { contentType: result.mime }),
        filename,
        encoding: 'base64',
        content
      };

      attachments.push(attachment);
      this[LRU].set(filepath + '-' + filename, attachment);
    }

    return attachments;
  }
}

module.exports = { SESTransporter };
