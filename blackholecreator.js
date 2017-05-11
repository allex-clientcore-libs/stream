function createBlackHole(lib){
  'use strict';
  function BlackHole(){
  }
  BlackHole.prototype.destroy = lib.dummyFunc;
  BlackHole.prototype.onStream = lib.dummyFunc;
  return BlackHole;
}

module.exports = createBlackHole;
