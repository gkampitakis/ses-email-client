'use strict';

const { SESTransporter } = require('./SESTransporter');

jest.mock('aws-sdk');
jest.mock('nodemailer/lib/mail-composer');
jest.mock('file-type');
jest.mock('fs');

describe('SESTransporter', () => {
  const { CredentialsSpy, SESSpy, ConfigUpdateSpy, SendRawEmailSpy } = jest.requireMock('aws-sdk');
  const MailComposerMock = jest.requireMock('nodemailer/lib/mail-composer');
  const { FromFileSpy, SRC } = jest.requireMock('file-type');
  const FsMock = jest.requireMock('fs');

  beforeEach(() => {
    CredentialsSpy.mockClear();
    SESSpy.mockClear();
    ConfigUpdateSpy.mockClear();
    SendRawEmailSpy.mockClear();
    MailComposerMock.ConstructorSpy.mockClear();
    FsMock.ReadFileSyncSpy.mockClear();
    FromFileSpy.mockClear();
    MailComposerMock.BuildError = false;
    SRC.result = true;
  });

  describe('When instantiate', () => {
    it('Should create credentials and update config if provided', () => {
      new SESTransporter('mockKey', 'mockAccessKey', 'mockRegion'); // eslint-disable-line

      expect(CredentialsSpy).toHaveBeenCalledWith({
        accessKeyId: 'mockKey',
        secretAccessKey: 'mockAccessKey'
      });
      expect(ConfigUpdateSpy).toHaveBeenCalledWith({
        credentials: expect.anything(),
        region: 'mockRegion'
      });
      expect(SESSpy).toHaveBeenCalled();
    });

    it('Should just instantiate SES if no settings provided', () => {
      new SESTransporter(); // eslint-disable-line

      expect(CredentialsSpy).not.toHaveBeenCalled();
      expect(ConfigUpdateSpy).not.toHaveBeenCalled();
      expect(SESSpy).toHaveBeenCalled();
    });
  });

  describe('When call send method', () => {
    it('Should throw error if missing required params', async () => {
      const transporter = new SESTransporter();
      try {
        await transporter.send({});
      } catch (err) {
        expect(err.message).toBe('Missing one of required parameters [from, to, subject]');
      }
    });

    it('Should call the send method', async () => {
      const transporter = new SESTransporter();

      await transporter.send({
        html: '<div>Test</div>',
        subject: 'testSubject',
        from: 'me@gmail.com',
        to: ['you@gmail.com'],
        text: 'text'
      });

      expect(SendRawEmailSpy).toHaveBeenNthCalledWith(1, {
        RawMessage: { Data: 'mockMessage' }
      });
      expect(MailComposerMock.ConstructorSpy).toHaveBeenNthCalledWith(1, {
        html: '<div>Test</div>',
        subject: 'testSubject',
        from: 'me@gmail.com',
        to: 'you@gmail.com',
        text: 'text'
      });
    });

    it('Should include attachments if present', async () => {
      const transporter = new SESTransporter();

      await transporter.send({
        html: '<div>Test</div>',
        subject: 'testSubject',
        from: 'me@gmail.com',
        to: ['mock@mail.com'],
        cc: ['mock@mail.com', 'mock@mail.com'],
        bcc: ['mock@mail.com', 'mock@mail.com'],
        text: 'text',
        replyTo: 'mock@mail.com',
        attachments: [{ name: 'mockAttachments', path: 'mock/path' }]
      });

      expect(SendRawEmailSpy).toHaveBeenNthCalledWith(1, {
        RawMessage: { Data: 'mockMessage' }
      });
      expect(FsMock.ReadFileSyncSpy).toHaveBeenNthCalledWith(1, 'mock/path');
      expect(FromFileSpy).toHaveBeenNthCalledWith(1, 'mock/path');
      expect(MailComposerMock.ConstructorSpy).toHaveBeenNthCalledWith(1, {
        html: '<div>Test</div>',
        subject: 'testSubject',
        from: 'me@gmail.com',
        to: 'mock@mail.com',
        bcc: 'mock@mail.com,mock@mail.com',
        cc: 'mock@mail.com,mock@mail.com',
        text: 'text',
        replyTo: 'mock@mail.com',
        attachments: [
          { encoding: 'base64', filename: 'mockAttachments', content: 'mock/path', contentType: 'image/png' }
        ]
      });
    });

    it('Should handle mixed attachments structure', async () => {
      const transporter = new SESTransporter();

      await transporter.send({
        html: '<div>Test</div>',
        subject: 'testSubject',
        from: 'me@gmail.com',
        to: ['mock@mail.com'],
        attachments: ['mock/path.js', { name: 'test', path: 'path2' }, { path: '/path3.ext' }]
      });
      expect(MailComposerMock.ConstructorSpy).toHaveBeenNthCalledWith(1, {
        html: '<div>Test</div>',
        subject: 'testSubject',
        from: 'me@gmail.com',
        to: 'mock@mail.com',
        attachments: [
          { encoding: 'base64', filename: 'path.js', content: 'mock/path.js', contentType: 'image/png' },
          { encoding: 'base64', filename: 'test', content: 'path2', contentType: 'image/png' },
          { encoding: 'base64', filename: 'path3.ext', content: '/path3.ext', contentType: 'image/png' }
        ]
      });
    });

    it('Should return undefined type if no result is returned in attachments', async () => {
      SRC.result = false;

      const transporter = new SESTransporter();

      await transporter.send({
        html: '<div>Test</div>',
        subject: 'testSubject',
        from: 'me@gmail.com',
        to: ['mock@mail.com'],
        attachments: [
          { name: 'mockAttachments', path: 'mock/path' },
          { name: 'mockAttachments', path: 'mock/path2' }
        ]
      });

      expect(FromFileSpy).toHaveBeenCalledTimes(2);
      expect(FsMock.ReadFileSyncSpy).toHaveBeenCalledTimes(2);
      expect(SendRawEmailSpy).toHaveBeenNthCalledWith(1, {
        RawMessage: { Data: 'mockMessage' }
      });
      expect(MailComposerMock.ConstructorSpy).toHaveBeenNthCalledWith(1, {
        html: '<div>Test</div>',
        subject: 'testSubject',
        from: 'me@gmail.com',
        to: 'mock@mail.com',
        attachments: [
          { encoding: 'base64', filename: 'mockAttachments', content: 'mock/path', contentType: undefined },
          { encoding: 'base64', filename: 'mockAttachments', content: 'mock/path2', contentType: undefined }
        ]
      });
    });

    it('Should reject with error', async () => {
      const transporter = new SESTransporter();

      MailComposerMock.BuildError = 'mockError';
      try {
        await transporter.send({
          html: '<div>Test</div>',
          subject: 'testSubject',
          from: 'me@gmail.com',
          to: ['mock@mail.com']
        });
      } catch (error) {
        expect(error).toBe('mockError');
      }
    });
  });
});
