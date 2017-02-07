function g() {
  return 24;
}

(function() {
  var x;

  function f() {
    const y = 42;
    let x;
    if(Math.random() < 0.6) {
      const z = Math.random();
      x = z * 2;
    } else if (Math.random() < 0.8){
      return 16;
    } else {
      return y;
    }
    return x + y;
  }

  console.log(f());
})();

export default g;
