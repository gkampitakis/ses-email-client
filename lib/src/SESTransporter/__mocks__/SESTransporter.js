class SESTransporter {
  constructor (...args) {
    SESTransporter.constructorSpy(...args);
  }

  send (...args) {
    SESTransporter.sendSpy(...args);
    return Promise.resolve(...args);
  }
}

SESTransporter.constructorSpy = jest.fn();
SESTransporter.sendSpy = jest.fn();

module.exports = { SESTransporter };
