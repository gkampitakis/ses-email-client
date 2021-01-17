const HLRUConstructorSpy = jest.fn();
const getSpy = jest.fn();
const setSpy = jest.fn();
const mockCache = {};

function HLRU (cacheSize) {
  HLRUConstructorSpy(cacheSize);
  return {
    get (key) {
      getSpy(key);
      return mockCache[key];
    },
    set (key, value) {
      mockCache[key] = value;
      setSpy(key, value);
    }
  }
}

module.exports = HLRU;
module.exports.getSpy = getSpy;
module.exports.setSpy = setSpy;
module.exports.HLRUConstructorSpy = HLRUConstructorSpy;
module.exports.mockCache = HLRUConstructorSpy; 
