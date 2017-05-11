function createStreamSink(lib){
  'use strict';
  function StreamSink(){
  }
  StreamSink.prototype.destroy = lib.dummyFunc;
  StreamSink.prototype.onStream = function(item){
  };
  return StreamSink;
}

module.exports = createStreamSink;
