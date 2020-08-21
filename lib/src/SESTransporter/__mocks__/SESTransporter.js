class SESTransporter {

  static constructorSpy = jest.fn();
  static sendSpy = jest.fn();
  constructor (...args) {
    SESTransporter.constructorSpy(...args);
  }

  send (...args) {
    SESTransporter.sendSpy(...args);
    return Promise.resolve(...args);
  }
}

module.exports = { SESTransporter };
