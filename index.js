function createStreamLib (lib) {
  'use strict';
  var StreamSink = require('./sinkcreator')(lib);

  return {
    streamSourceCreator: require('./sourcecreator')(lib),
    StreamSink: StreamSink,
    StreamBlackHole: require('./blackholecreator')(lib),
    StreamSinkBunch: require('./sinkbunchcreator')(lib,StreamSink),
    StreamDistributor: require('./distributorcreator')(lib,StreamSink)
  };
}

module.exports = createStreamLib;
