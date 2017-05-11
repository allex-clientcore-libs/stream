function createStreamDistributor(lib,StreamSink){
  'use strict';
  function StreamDistributor(){
    StreamSink.call(this);
    this.sinks = new lib.Fifo();
  }
  lib.inherit(StreamDistributor,StreamSink);
  StreamDistributor.prototype.destroy = function(){
    var sinks = this.sinks;
    this.sinks = null;
    if (sinks) {
      lib.containerDestroyAll(sinks);
      sinks.destroy();
    }
    StreamSink.prototype.destroy.call(this);
  };
  StreamDistributor.prototype.attach = function(sink){
    if(!sink.onStream){
      throw new lib.Error('NO_ONSTREAM', 'sink needs the onStream method');
    }
    if(!sink.destroyed){
      return;
    }
    var ret = this.sinks.push(sink);
    sink.destroyed.attachForSingleShot(this.onSinkDown.bind(this,ret));
    return ret;
  };
  StreamDistributor.prototype.doTrigger = function(item,sink){
    if(!sink.destroyed){
      return;
    }
    sink.onStream(item);
  }
  StreamDistributor.prototype.onStream = function(item){
    if (!this.sinks) {
      return;
    }
    this.sinks.traverse(this.doTrigger.bind(this,item));
  };
  StreamDistributor.prototype.onSinkDown = function(sinkitem){
    //there might exist a dead loop during my destroy
    if(!this.sinks){
      return;
    }
    this.sinks.remove(sinkitem);
    sinkitem.destroy();
    sinkitem = null;
  };
  return StreamDistributor;
}

module.exports = createStreamDistributor;
