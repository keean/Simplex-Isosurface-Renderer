var vector = function(s) {
  var a = new Float32Array(s);
  var p = 0;

  return {
    push: function() {
        if (p + arguments.length >  a.length) {
          for (var q = a.length; p + arguments.length > q; q *= 2);
          var b = new Float32Array(q);
          b.set(a);
          a = b;
        }
        for (var i = 0; i < arguments.length; a[p++] = arguments[i++]);
      },

    length: function() {
        return p;
      },

    array: function() {
        return a;
      }
  };
};
