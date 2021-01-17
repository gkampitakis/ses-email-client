'use strict';

const SESEmailClient = require('./SESEmailClient');

jest.mock('../SESTransporter/SESTransporter');
jest.mock('fs');
jest.mock('handlebars');
jest.mock('mjml');
jest.mock('ejs');
jest.mock('hashlru');

describe('SESEmailClient', () => {
  const SESTransporterMock = jest.requireMock('../SESTransporter/SESTransporter').SESTransporter;
  const FsMock = jest.requireMock('fs');
  const HbsMock = jest.requireMock('handlebars');
  const MjmlMock = jest.requireMock('mjml');
  const EjsMock = jest.requireMock('ejs');
  const { getSpy, setSpy, HLRUConstructorSpy, clearCache } = jest.requireMock('hashlru');

  beforeEach(() => {
    SESTransporterMock.constructorSpy.mockClear();
    SESTransporterMock.sendSpy.mockClear();
    FsMock.ReadFileSyncSpy.mockClear();
    MjmlMock.TemplateSpy.mockClear();
    HbsMock.CompileSpy.mockClear();
    HbsMock.TemplateSpy.mockClear();
    EjsMock.CompileSpy.mockClear();
    EjsMock.TemplateSpy.mockClear();
    getSpy.mockClear();
    setSpy.mockClear();
    HLRUConstructorSpy.mockClear();
    clearCache();
    process.env.NODE_ENV = 'test';
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
      new SESEmailClient({ //eslint-disable-line
        accessKeyId: 'mockAccessKey',
        secretAccessKey: 'mockSecretKey',
        region: 'mockRegion',
        templateLanguage: 'ejs',
        production: false,
        attCacheSize: 50,
        tmpltCacheSize: 20
      });

      expect(HLRUConstructorSpy).toHaveBeenCalledWith(20);
      expect(SESTransporterMock.constructorSpy).toHaveBeenCalledWith(false, 50, 'mockAccessKey', 'mockSecretKey', 'mockRegion');
    });

    it('Should infer production mode from env', () => {
      process.env.NODE_ENV = 'production';
      new SESEmailClient(); //eslint-disable-line

      expect(SESTransporterMock.constructorSpy).toHaveBeenCalledWith(true, 100, undefined, undefined, undefined);
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

    it('Should print warning if template provided without template language', async () => {
      const client = new SESEmailClient();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await client.send({
        from: 'mock@email.com',
        to: 'mock@email.com',
        template: '/mock/template'
      });

      expect(warnSpy).toHaveBeenCalledWith('Missing template language,templates will not be compiled!');
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

    it('Should ignore template if html attribute is provided', async () => {
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
        html: '<div>Hello World</div>',
        data: { mock: 'data' }
      });

      expect(FsMock.ReadFileSyncSpy).not.toHaveBeenCalled();
      expect(SESTransporterMock.sendSpy).toHaveBeenNthCalledWith(1, {
        from: 'mock@email.com',
        to: ['mock@email.com'],
        html: '<div>Hello World</div>'
      });
    });

    it('Should cache templates in production [ejs]', async () => {
      const client = new SESEmailClient({
        production: true,
        templateLanguage: 'ejs'
      });

      await client.send({
        from: 'mock@email.com',
        to: 'mock@email.com',
        cc: 'test@mail.com',
        bcc: ['test@mail.com'],
        template: '/mock/path/cache',
        data: { mock: 'data' }
      });

      await client.send({
        from: 'mock@email.com',
        to: 'mock@email.com',
        cc: 'test@mail.com',
        bcc: ['test@mail.com'],
        template: ['/mock/path/cache'],
        data: { mock: 'data' }
      });

      expect(getSpy).toHaveBeenCalledTimes(2);
      expect(setSpy).toHaveBeenCalledTimes(1);
      expect(SESTransporterMock.sendSpy).toHaveBeenNthCalledWith(1, {
        from: 'mock@email.com',
        to: ['mock@email.com'],
        cc: ['test@mail.com'],
        bcc: ['test@mail.com'],
        html: 'htmlEJS'
      });
      expect(FsMock.ReadFileSyncSpy).toHaveBeenCalledTimes(1);
      expect(EjsMock.CompileSpy).toHaveBeenCalledWith('/mock/path/cache');
      expect(EjsMock.TemplateSpy).toHaveBeenCalledWith({ mock: 'data' });
    });

    it('Should cache templates in production [hbs]', async () => {
      const client = new SESEmailClient({
        production: true,
        templateLanguage: 'handlebars'
      });

      await client.send({
        from: 'mock@email.com',
        to: 'mock@email.com',
        cc: 'test@mail.com',
        bcc: ['test@mail.com'],
        template: '/mock/path/cache',
        data: { mock: 'data' }
      });

      await client.send({
        from: 'mock@email.com',
        to: 'mock@email.com',
        cc: 'test@mail.com',
        bcc: ['test@mail.com'],
        template: ['/mock/path/cache'],
        data: { mock: 'data' }
      });

      expect(getSpy).toHaveBeenCalledTimes(2);
      expect(setSpy).toHaveBeenCalledTimes(1);
      expect(SESTransporterMock.sendSpy).toHaveBeenNthCalledWith(1, {
        from: 'mock@email.com',
        to: ['mock@email.com'],
        cc: ['test@mail.com'],
        bcc: ['test@mail.com'],
        html: 'htmlHBS'
      });
      expect(FsMock.ReadFileSyncSpy).toHaveBeenCalledTimes(1);
      expect(HbsMock.CompileSpy).toHaveBeenCalledWith('/mock/path/cache');
      expect(HbsMock.TemplateSpy).toHaveBeenCalledWith({ mock: 'data' });
    });

    it('Should cache templates in production [mjml]', async () => {
      const client = new SESEmailClient({
        production: true,
        templateLanguage: 'mjml'
      });

      await client.send({
        from: 'mock@email.com',
        to: 'mock@email.com',
        cc: 'test@mail.com',
        bcc: ['test@mail.com'],
        template: '/mock/path/cache',
        data: { mock: 'data' }
      });

      await client.send({
        from: 'mock@email.com',
        to: 'mock@email.com',
        cc: 'test@mail.com',
        bcc: ['test@mail.com'],
        template: ['/mock/path/cache'],
        data: { mock: 'data' }
      });

      expect(getSpy).toHaveBeenCalledTimes(2);
      expect(setSpy).toHaveBeenCalledTimes(1);
      expect(SESTransporterMock.sendSpy).toHaveBeenNthCalledWith(1, {
        from: 'mock@email.com',
        to: ['mock@email.com'],
        cc: ['test@mail.com'],
        bcc: ['test@mail.com'],
        html: 'htmlMJML'
      });
      expect(FsMock.ReadFileSyncSpy).toHaveBeenCalledTimes(1);
      expect(HbsMock.CompileSpy).toHaveBeenCalledWith('/mock/path/cache');
      expect(MjmlMock.TemplateSpy).toHaveBeenCalledWith('htmlHBS');
      expect(MjmlMock.TemplateSpy).toHaveBeenCalledWith('htmlHBS');
    });
  });
});
