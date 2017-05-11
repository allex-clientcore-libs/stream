function createStreamSinkBunch(lib,StreamSink){
  'use strict';
  function StreamSinkBunch(arryofsinks){
    StreamSink.call(this);
    this.arry = arryofsinks;
  }
  lib.inherit(StreamSinkBunch,StreamSink);
  StreamSinkBunch.prototype.destroy = function(){
    this.arry = null;
  };
  StreamSinkBunch.prototype.destroyWithSinks = function(){
    lib.arryDestroyAll(this.arry);
    this.destroy();
  };
  StreamSinkBunch.prototype.onStream = function(item){
    if(!this.arry){
      return;
    }
    this.arry.forEach(function(sink){
      sink.onStream(item);
    });
    item = null;
  };
  return StreamSinkBunch;
}

module.exports = createStreamSinkBunch;
