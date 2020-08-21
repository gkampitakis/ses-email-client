const CredentialsSpy = jest.fn();
const SESSpy = jest.fn();
const SendRawEmailSpy = jest.fn();
const ConfigUpdateSpy = jest.fn();

class Credentials {
  constructor(options) {
    CredentialsSpy(options);
  }
}

class SES {
  constructor() {
    SESSpy();
  }

  sendRawEmail (message) {
    SendRawEmailSpy(message);
    return {
      promise: () => Promise.resolve(message)
    };
  }
}

const config = {
  update (options) {
    ConfigUpdateSpy(options);
  }
};

module.exports = { SES, Credentials, config, CredentialsSpy, SESSpy, SendRawEmailSpy, ConfigUpdateSpy };
