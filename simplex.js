// 2D & 3D noise generator function (and gradient function)
// using Simplex-Noise.

var simplex = (function() {
  var F2 = 0.5 * (Math.sqrt(3.0) - 1.0)
  , G2 = (3.0 - Math.sqrt(3.0)) / 6.0
  , F3 = 1.0 / 3.0
  , G3 = 1.0 / 6.0
  , g3 = new Int8Array([
      1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
      1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
      0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1
    ])
  , p = new Uint8Array([151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,
      140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,
      197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,
      136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,
      122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,
      161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,
      86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,
      126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,
      213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,
      253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,
      242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,
      192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,
      138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
    ])
  , perm = new Uint8Array(512)
  , permMod12 = new Uint8Array(512)
  ;

  for (i = 0; i < 512; ++i) {
    perm[i] = p[i & 255];
    permMod12[i] = perm[i] % 12;
  }

  function noise2(xin, yin) {
    var s = (xin + yin) * F2
    , i = Math.floor(xin + s)
    , j = Math.floor(yin + s)
    , t = (i + j) * G2
    , X0 = i - t
    , Y0 = j - t
    , x0 = xin - X0
    , y0 = yin - Y0
    , i1, j1
    ;

    if (x0 > y0) {
      i1 = 1; j1 = 0;
    } else {
      i1 = 0; j1 = 1;
    }

    var x1 = x0 - i1 + G2
    , y1 = y0 - j1 + G2
    , x2 = x0 - 1.0 + 2.0 * G2
    , y2 = y0 - 1.0 + 2.0 * G2
    , ii = i & 255
    , jj = j & 255
    , t0 = 0.5 - x0 * x0 - y0 * y0
    , t1 = 0.5 - x1 * x1 - y1 * y1
    , t2 = 0.5 - x2 * x2 - y2 * y2
    , n0 = 0.0
    , n1 = 0.0
    , n2 = 0.0
    , n3 = 0.0
    ;

    if (t0 >= 0.0) {
      var gi = permMod12[ii + perm[jj]] * 3;
      t0 *= t0;
      n0 = t0 * t0 * (g3[gi] * x0 + g3[gi + 1] * y0);
    }

    if (t1 >= 0.0) {
      var gi = permMod12[ii + i1 + perm[jj + j1]] * 3;
      t1 *= t1;
      n1 = t1 * t1 * (g3[gi] * x1 + g3[gi + 1] * y1);
    }

    if (t2 >= 0.0) {
      var gi = permMod12[ii + 1.0 + perm[jj + 1.0]] * 3;
      t2 *= t2;
      n2 = t2 * t2 * (g3[gi] * x2 + g3[gi + 1] * y2);
    }

    return 70.0 * (n0 + n1 + n2);
  }

  function noise3(xin, yin, zin) {
    var s = (xin + yin + zin) * F3
    , i = Math.floor(xin + s)
    , j = Math.floor(yin + s)
    , k = Math.floor(zin + s)
    , t = (i + j + k) * G3
    , x0 = xin - i + t
    , y0 = yin - j + t
    , z0 = zin - k + t
    , i1, j1, k1, i2, j2, k2
    ;

    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0;
        i2 = 1; j2 = 1; k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0;
        i2 = 1; j2 = 0; k2 = 1;
      } else {
        i1 = 0; j1 = 0; k1 = 1;
        i2 = 1; j2 = 0; k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0; j1 = 0; k1 = 1;
        i2 = 0; j2 = 1; k2 = 1;
      } else if (x0 < z0) {
        i1 = 0; j1 = 1; k1 = 0;
        i2 = 0; j2 = 1; k2 = 1;
      } else {
        i1 = 0; j1 = 1; k1 = 0;
        i2 = 1; j2 = 1; k2 = 0;
      }
    }

    var x1 = x0 - i1 + G3
    , y1 = y0 - j1 + G3
    , z1 = z0 - k1 + G3
    , x2 = x0 - i2 + 2.0 * G3
    , y2 = y0 - j2 + 2.0 * G3
    , z2 = z0 - k2 + 2.0 * G3
    , x3 = x0 - 1.0 + 3.0 * G3
    , y3 = y0 - 1.0 + 3.0 * G3
    , z3 = z0 - 1.0 + 3.0 * G3
    , ii = i & 255 , jj = j & 255 , kk = k & 255
    , t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0
    , t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1
    , t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2
    , t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3
    , n0 = 0.0 , n1 = 0.0 , n2 = 0.0 , n3 = 0.0
    ;

    if (t0 >= 0.0) {
      var gi = permMod12[ii + perm[jj + perm[kk]]] * 3;
      t0 *= t0;
      n0 = t0 * t0 * (g3[gi] * x0 + g3[gi + 1] * y0 + g3[gi + 2] * z0);
    }

    if (t1 >= 0) {
      var gi = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
      t1 *= t1;
      n1 = t1 * t1 * (g3[gi] * x1 + g3[gi + 1] * y1 + g3[gi + 2] * z1);
    }

    if (t2 >= 0) {
      var gi = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
      t2 *= t2;
      n2 = t2 * t2 * (g3[gi] * x2 + g3[gi + 1] * y2 + g3[gi + 2] * z2);
    }

    if (t3 >= 0) {
      var gi = permMod12[ii + 1.0 + perm[jj + 1.0 + perm[kk + 1.0]]] * 3;
      t3 *= t3;
      n3 = t3 * t3 * (g3[gi] * x3 + g3[gi + 1] * y3 + g3[gi + 2] * z3);
    }

    return 32.0 * (n0 + n1 + n2 + n3);
  }

  function grad3(xin, yin, zin) {
    var s = (xin + yin + zin) * F3
    , i = Math.floor(xin + s)
    , j = Math.floor(yin + s)
    , k = Math.floor(zin + s)
    , t = (i + j + k) * G3
    , x0 = xin - i + t
    , y0 = yin - j + t
    , z0 = zin - k + t
    , i1, j1, k1, i2, j2, k2
    ;

    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0;
        i2 = 1; j2 = 1; k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0;
        i2 = 1; j2 = 0; k2 = 1;
      } else {
        i1 = 0; j1 = 0; k1 = 1;
        i2 = 1; j2 = 0; k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0; j1 = 0; k1 = 1;
        i2 = 0; j2 = 1; k2 = 1;
      } else if (x0 < z0) {
        i1 = 0; j1 = 1; k1 = 0;
        i2 = 0; j2 = 1; k2 = 1;
      } else {
        i1 = 0; j1 = 1; k1 = 0;
        i2 = 1; j2 = 1; k2 = 0;
      }
    }

    var x1 = x0 - i1 + G3
    , y1 = y0 - j1 + G3
    , z1 = z0 - k1 + G3
    , x2 = x0 - i2 + 2.0*G3
    , y2 = y0 - j2 + 2.0*G3
    , z2 = z0 - k2 + 2.0*G3
    , x3 = x0 - 1.0 + 3.0*G3
    , y3 = y0 - 1.0 + 3.0*G3
    , z3 = z0 - 1.0 + 3.0*G3
    , ii = i & 255 , jj = j & 255 , kk = k & 255
    , t0 = 0.6 - x0*x0 - y0*y0 - z0*z0
    , t1 = 0.6 - x1*x1 - y1*y1 - z1*z1
    , t2 = 0.6 - x2*x2 - y2*y2 - z2*z2
    , t3 = 0.6 - x3*x3 - y3*y3 - z3*z3
    , dx0 = 0.0, dy0 = 0.0, dz0 = 0.0 
    , dx1 = 0.0, dy1 = 0.0, dz1 = 0.0
    , dx2 = 0.0, dy2 = 0.0, dz2 = 0.0
    , dx3 = 0.0, dy3 = 0.0, dz3 = 0.0
    ;

    if (t0 >= 0.0) {
      var gi = permMod12[ii + perm[jj + perm[kk]]] * 3
      , dx = g3[gi], dy = g3[gi + 1], dz = g3[gi + 2]
      , tt = t0 * t0
      , t4 = tt * tt
      , dd = t0 * tt * (x0 * dx + y0 * dy + z0 * dz)
      ;

      dx0 += -8.0 * x0 * dd + t4 * dx;
      dy0 += -8.0 * y0 * dd + t4 * dy;
      dz0 += -8.0 * z0 * dd + t4 * dz;
    }

    if (t1 >= 0) {
      var gi = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3
      , dx = g3[gi], dy = g3[gi + 1], dz = g3[gi + 2]
      , tt = t1 * t1
      , t4 = tt * tt
      , dd = t1 * tt * (x1 * dx + y1 * dy + z1 * dz);
      ;
      
      dx1 += -8.0 * x1 * dd + t4 * dx;
      dy1 += -8.0 * y1 * dd + t4 * dy;
      dz1 += -8.0 * z1 * dd + t4 * dz;
    }

    if (t2 >= 0) {
      var gi = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3
      , dx = g3[gi], dy = g3[gi + 1], dz = g3[gi + 2]
      , tt = t2 * t2
      , t4 = tt * tt
      , dd = t2 * tt * (x2 * dx + y2 * dy + z2 * dz)
      ;

      dx2 += -8.0 * x2 * dd + t4 * dx;
      dy2 += -8.0 * y2 * dd + t4 * dy;
      dz2 += -8.0 * z2 * dd + t4 * dz;
    }

    if (t3 >= 0) {
      var gi = permMod12[ii + 1.0 + perm[jj + 1.0 + perm[kk + 1.0]]] * 3
      , dx = g3[gi], dy = g3[gi + 1], dz = g3[gi + 2]
      , tt = t3 * t3
      , t4 = tt * tt
      , dd = t3 * tt * (x3 * dx + y3 * dy + z3 * dz)
      ;

      dx3 += -8.0 * x3 * dd + t4 * dx;
      dy3 += -8.0 * y3 * dd + t4 * dy;
      dz3 += -8.0 * z3 * dd + t4 * dz;
    }

    return {
      x: 28.0 * (dx0 + dx1 + dx2 + dx3),
      y: 28.0 * (dy0 + dy1 + dy2 + dy3),
      z: 28.0 * (dz0 + dz1 + dz2 + dz3)
    };
  }

  return {
    noise2 : noise2,
    noise3 : noise3,
    grad3 : grad3
  };
})();

