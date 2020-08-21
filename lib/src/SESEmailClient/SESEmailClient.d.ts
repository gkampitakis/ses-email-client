import { PromiseResult } from 'aws-sdk/lib/request';
import AWS from 'aws-sdk';

interface SESEmailClientSettings {
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  templateLanguage?: 'mjml' | 'handlebars' | 'ejs';
}

interface File {
  name: string;
  path: string;
}

interface Message {
  from: string;
  to: string | string[];
  subject: string;
  data?: Record<string, any>;
  template?: string;
  text?: string;
  name?: string;
  attachments?: File[];
  cc?: string | string[];
  bcc?: string | string[];
  [key: string]: any;
}

export default class SESEmailClient {
  constructor (settings: SESEmailClientSettings);
  send (message: Message): Promise<PromiseResult<AWS.SES.SendRawEmailResponse, AWS.AWSError>>;
}


