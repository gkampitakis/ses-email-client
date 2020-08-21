'use strict';

const SESEmailClient = require('./SESEmailClient');

jest.mock('../SESTransporter/SESTransporter');
jest.mock('fs');
jest.mock('handlebars');
jest.mock('mjml');
jest.mock('ejs');

describe('SESEmailClient', () => {
  const SESTransporterMock = jest.requireMock('../SESTransporter/SESTransporter').SESTransporter;
  const FsMock = jest.requireMock('fs');
  const HbsMock = jest.requireMock('handlebars');
  const MjmlMock = jest.requireMock('mjml');
  const EjsMock = jest.requireMock('ejs');

  beforeEach(() => {
    SESTransporterMock.constructorSpy.mockClear();
    SESTransporterMock.sendSpy.mockClear();
    FsMock.ReadFileSyncSpy.mockClear();
    MjmlMock.TemplateSpy.mockClear();
    HbsMock.CompileSpy.mockClear();
    HbsMock.TemplateSpy.mockClear();
    EjsMock.CompileSpy.mockClear();
    EjsMock.TemplateSpy.mockClear();
  });

  describe('When instantiate', () => {
    it('Should throw error if not supported template language provided', () => {
      try {
        new SESEmailClient({ // eslint-disable-line
          accessKeyId: 'mockAccessKey',
          secretAccessKey: 'mockSecretKey',
          region: 'mockRegion',
          templateLanguage: 'test'
        });
      } catch (error) {
        expect(error.message).toBe('Unsupported template language');
      }
    });

    it('Should instantiate SESTransport', () => {
      const client = new SESEmailClient({
        accessKeyId: 'mockAccessKey',
        secretAccessKey: 'mockSecretKey',
        region: 'mockRegion',
        templateLanguage: 'ejs'
      });

      expect(SESTransporterMock.constructorSpy).toHaveBeenCalledWith('mockAccessKey', 'mockSecretKey', 'mockRegion');
      expect(client.templateLanguage).toBe('ejs');
      expect(client.transporter).toBeInstanceOf(SESTransporterMock);
    });
  });

  describe('When call send method', () => {
    it('Should construct message', async () => {
      const client = new SESEmailClient({
        accessKeyId: 'mockAccessKey',
        secretAccessKey: 'mockSecretKey',
        region: 'mockRegion'
      });

      await client.send({
        from: 'mock@email.com',
        to: 'mock@email.com',
        cc: 'test@mail.com',
        bcc: ['test@mail.com']
      });

      expect(SESTransporterMock.sendSpy).toHaveBeenNthCalledWith(1, {
        from: 'mock@email.com',
        to: ['mock@email.com'],
        cc: ['test@mail.com'],
        bcc: ['test@mail.com']
      });
      expect(FsMock.ReadFileSyncSpy).not.toHaveBeenCalled();
    });

    it('Should compile ejs template', async () => {
      const client = new SESEmailClient({
        accessKeyId: 'mockAccessKey',
        secretAccessKey: 'mockSecretKey',
        region: 'mockRegion',
        templateLanguage: 'ejs'
      });

      await client.send({
        from: 'mock@email.com',
        to: 'mock@email.com',
        cc: 'test@mail.com',
        bcc: ['test@mail.com'],
        template: '/mock/path',
        data: { mock: 'data' }
      });

      expect(SESTransporterMock.sendSpy).toHaveBeenNthCalledWith(1, {
        from: 'mock@email.com',
        to: ['mock@email.com'],
        cc: ['test@mail.com'],
        bcc: ['test@mail.com'],
        html: 'htmlEJS'
      });
      expect(FsMock.ReadFileSyncSpy).toHaveBeenCalledWith('/mock/path', { encoding: 'utf-8' });
      expect(EjsMock.CompileSpy).toHaveBeenCalledWith('/mock/path');
      expect(EjsMock.TemplateSpy).toHaveBeenCalledWith({ mock: 'data' });
    });

    it('Should compile hbs template', async () => {
      const client = new SESEmailClient({
        accessKeyId: 'mockAccessKey',
        secretAccessKey: 'mockSecretKey',
        region: 'mockRegion',
        templateLanguage: 'handlebars'
      });

      await client.send({
        from: 'mock@email.com',
        to: 'mock@email.com',
        cc: 'test@mail.com',
        bcc: ['test@mail.com'],
        template: '/mock/path',
        data: { mock: 'data' }
      });

      expect(SESTransporterMock.sendSpy).toHaveBeenNthCalledWith(1, {
        from: 'mock@email.com',
        to: ['mock@email.com'],
        cc: ['test@mail.com'],
        bcc: ['test@mail.com'],
        html: 'htmlHBS'
      });
      expect(FsMock.ReadFileSyncSpy).toHaveBeenCalledWith('/mock/path', { encoding: 'utf-8' });
      expect(HbsMock.CompileSpy).toHaveBeenCalledWith('/mock/path');
      expect(HbsMock.TemplateSpy).toHaveBeenCalledWith({ mock: 'data' });
    });

    it('Should compile mjml template', async () => {
      const client = new SESEmailClient({
        accessKeyId: 'mockAccessKey',
        secretAccessKey: 'mockSecretKey',
        region: 'mockRegion',
        templateLanguage: 'mjml'
      });

      await client.send({
        from: 'mock@email.com',
        to: 'mock@email.com',
        template: '/mock/path',
        data: { mock: 'data' }
      });

      expect(SESTransporterMock.sendSpy).toHaveBeenNthCalledWith(1, {
        from: 'mock@email.com',
        to: ['mock@email.com'],
        html: 'htmlMJML'
      });
      expect(FsMock.ReadFileSyncSpy).toHaveBeenCalledWith('/mock/path', { encoding: 'utf-8' });
      expect(HbsMock.CompileSpy).toHaveBeenCalledWith('/mock/path');
      expect(MjmlMock.TemplateSpy).toHaveBeenCalledWith('htmlHBS');
    });
  });
});
