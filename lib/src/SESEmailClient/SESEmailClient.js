'use strict';

const { SESTransporter } = require('../SESTransporter/SESTransporter');
const fs = require('fs');
const handleBars = require('handlebars');
const mjml2html = require('mjml');
const ejs = require('ejs');

class SESEmailClient {
  constructor (settings = {}) {
    const { accessKeyId, secretAccessKey, region, templateLanguage } = settings;

    if (templateLanguage && !templateCompilers[templateLanguage]) throw new Error('Unsupported template language');

    this.transporter = new SESTransporter(accessKeyId, secretAccessKey, region);
    this.templateLanguage = templateLanguage;
  }

  async send (message) {
    if (message.template && !this.templateLanguage) {
      console.warn('Missing template language,templates will not be compiled!');
    }

    return this.transporter.send(constructMessage(message, this.templateLanguage));
  }
}

function constructMessage (message, templateLng) {
  let { template = '', html = '', data = {}, cc, bcc, to, ...rest } = message;

  if (template && templateLng && !html) html = getCompiledHTML(template, data, templateLng);

  if (cc) cc = transformString2Array(cc);
  if (bcc) bcc = transformString2Array(bcc);
  to = transformString2Array(to);

  return {
    ...(cc && { cc }),
    ...(bcc && { bcc }),
    ...(html && { html }),
    to,
    ...rest
  };
}

function getCompiledHTML (template, data, templateLng) {
  const file = fs.readFileSync(template, { encoding: 'utf-8' });

  return templateCompilers[templateLng](file, data);
}

const templateCompilers = {
  mjml: mjmlCompile,
  handlebars: handlebarsCompile,
  ejs: ejsCompile
};

function mjmlCompile (file, data) {
  const compiled = handleBars.compile(file);

  return mjml2html(compiled(data)).html;
}

function handlebarsCompile (file, data) {
  const compiled = handleBars.compile(file);

  return compiled(data);
}

function ejsCompile (file, data) {
  const compiled = ejs.compile(file);

  return compiled(data);
}

function transformString2Array (value) {
  if (typeof value === 'string') return [value];
  return value;
}

module.exports = SESEmailClient;
