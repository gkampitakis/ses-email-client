import { PromiseResult } from 'aws-sdk/lib/request';
import AWS from 'aws-sdk';

/**
 * AWS credentials are optional as you can use aws-sdk authentication methods
 * https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html
 */
export interface SESEmailClientSettings {
  /** AWS accessKeyId */
  accessKeyId?: string;
  /** AWS accessKeyId */
  secretAccessKey?: string;
  /** AWS region */
  region?: string;
  /** Templates that are supported are mjml, handlebars, ejs */
  templateLanguage?: 'mjml' | 'handlebars' | 'ejs';
  /** In case of true or NODE_ENV=production enables caching for template and attachment files */
  production?: boolean;
  /** cache size for template files default = 100 */
  tmpltCacheSize?: number;
  /** cache size for attachment files default = 100 */
  attCacheSize?: number;
}

/**
 * Attachment File
 */
export interface AttFile {
  /** You can specify different name for the file */
  name?: string;
  /** Path were file is located */
  path: string;
}

export interface SESMessage {
  /** Email sender */
  from: string;
  /** Email recipient can be one or multiple */
  to: string | string[];
  /** Email subject */
  subject: string;
  /** Data to be passed on template */
  data?: Record<string, any>;
  /** Path to template */
  template?: string;
  /** Send plain text */
  text?: string;
  /** Sender name */
  name?: string;
  /** Send html, if html and template is present html takes priority */
  html?: string;
  /** Array of attachments to send with email
   * if not provided name the filename will be used
  */
  attachments?: (AttFile | string)[];
  /** Carbon Copy recipients */
  cc?: string | string[];
  /** Blind Carbon Copy recipients */
  bcc?: string | string[];
  [key: string]: any;
}

export default class SESEmailClient {
  constructor (settings?: SESEmailClientSettings);
  /** Send method
   * @param message Message to send
  */
  send (message: SESMessage): Promise<PromiseResult<AWS.SES.SendRawEmailResponse, AWS.AWSError>>;
}


