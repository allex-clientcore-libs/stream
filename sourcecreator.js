function createGenericStreamSource(lib){
  'use strict';
  return function createStreamSource(StreamCoder, nosafetybelt, bufferctor){
    function StreamSource(destroysinktoo){
      StreamCoder.call(this);
      this.destroysinktoo = destroysinktoo;
      this.sink = null;
    }
    lib.inherit(StreamSource,StreamCoder);
    function produceMethodForwarder(method,methodname){
      var scpm = StreamCoder.prototype[methodname];
      StreamSource.prototype[methodname] = function(){
        this.handleStreamItem(scpm.apply(this,arguments));
      };
    }
    lib.traverse(StreamCoder.prototype,produceMethodForwarder);
    StreamSource.prototype.destroy = function(){
      if(this.buffer){
        this.buffer.destroy();
        this.buffer = null;
      }
      if(this.destroysinktoo && this.sink){
        this.sink.destroy();
      }
      this.sink = null;
      this.destroysinktoo = null;
      StreamCoder.prototype.destroy.call(this);
    };
    StreamSource.prototype.handleStreamItem = function(item){
      if(this.sink){
        this.sink.onStream(item);
      }else{
        if (!this.buffer) {
          this.createBuffer();
        }
        if (this.buffer) {
          this.buffer.push(item);
        }
      }
    };
    StreamSource.prototype.createBuffer = function () {
      this.buffer = new (bufferctor || lib.Fifo) ();
      if (!nosafetybelt) {
        lib.runNext(this.checkOnBuffer.bind(this), 5000);
      }
    };
    if (!nosafetybelt) {
      StreamSource.prototype.checkOnBuffer = function () {
        if (this.buffer) {
          this.buffer.destroy();
          this.buffer = null;
        }
      };
    }
    function bufferItemDumper(item){
        console.log(process.pid, item);
      }
    StreamSource.prototype.dumpBufferToConsole = function () {
      this.buffer.container.traverse(bufferItemDumper);
    };
    StreamSource.prototype.onStream = StreamSource.prototype.handleStreamItem;
    function doItem(sc,path,item,itemname){
      if('object' === typeof item){
        path.push(itemname);
        sc.newCollection(path);
        lib.traverse(item,doItem.bind(null,sc,path));
        path.pop();
      }else{
        path.push(itemname);
        sc.newScalar(path,item);
        path.pop();
      }
    }
    StreamSource.prototype.doHash = function(hash){
      lib.traverseShallow(hash,doItem.bind(null,this,[]));
    };
    StreamSource.prototype.setSink = function(sink){
      this.sink = sink;
      if(this.sink && this.buffer && this.buffer.length){
        this.buffer.drain(this.sink.onStream.bind(this.sink));
      }
    };
    function chainer(chainobj,filter,index){
      if(index===0){
        chainobj.ret = filter;
        chainobj.last = filter;
        return;
      }
      if(!lib.isFunction(filter.onStream)){
        throw 'Filter chain link at index '+index+' is not a StreamSink';
      }
      if(!lib.isFunction(chainobj.last.setSink)){
        throw 'Filter chain link at index '+(index-1)+' is not a StreamSource';
      }
      chainobj.last.setSink(filter);
      chainobj.last = filter;
    }
    StreamSource.chain = function(filterarry){
      var chainobj = {ret: null, last: null}, ret;
      filterarry.forEach(chainer.bind(null, chainobj));
      ret = chainobj.ret;
      chainobj = null;
      return ret;
    };
    StreamSource.prototype.Coder = StreamCoder;
    return StreamSource;
  };
}

module.exports = createGenericStreamSource;
