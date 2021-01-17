'use strict';

const { SESTransporter } = require('../SESTransporter/SESTransporter');
const fs = require('fs');
const handleBars = require('handlebars');
const mjml2html = require('mjml');
const ejs = require('ejs');
const HLRU = require('hashlru');
const prod = Symbol('production');
const LRU = Symbol('LRU');
const transporter = Symbol('transporter');
const compiler = Symbol('compiler');
const constructMessage = Symbol('constructMessage');
const getCompiledHTML = Symbol('getCompiledHTML');

class SESEmailClient {
  constructor (settings = {}) {
    const { accessKeyId, secretAccessKey, region, templateLanguage, production, tmpltCacheSize, attCacheSize = 100 } = settings;

    if (templateLanguage && !templateCompilers[templateLanguage]) throw new Error('Unsupported template language');

    this[prod] = typeof production === 'boolean' ? production : process.env.NODE_ENV === 'production';
    this[transporter] = new SESTransporter(this[prod], attCacheSize, accessKeyId, secretAccessKey, region);
    this[compiler] = templateLanguage;
    this[LRU] = HLRU(tmpltCacheSize || 100);
  }

  async send (message) {
    if (message.template && !this[compiler]) {
      console.warn('Missing template language,templates will not be compiled!');
    }

    return this[transporter].send(this[constructMessage](message));
  }

  [constructMessage] (message) {
    let { template = '', html = '', data = {}, cc, bcc, to, ...rest } = message;

    if (template && this[compiler] && !html) html = this[getCompiledHTML](template, data);

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

  [getCompiledHTML] (template, data) {
    let file = this[LRU].get(template);

    if (!this[prod] || !file) {
      file = fs.readFileSync(template, { encoding: 'utf-8' });
      this[LRU].set(template, file);
    }

    return templateCompilers[this[compiler]](file, data);
  }
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
