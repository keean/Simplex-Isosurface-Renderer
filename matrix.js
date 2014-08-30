var asVec4 = (function() {
  function set(x, y, z, w) {
    var v = this.vec4;
    v[0] = x; v[1] = y; v[2] = z; v[3] = w;
    return this;
  }

  function pre_mul_mat4(that) {
    var v = this.vec4, m = that.mat4
    , v0 = v[0], v1 = v[1], v2 = v[2], v3 = v[3]
    ;

    v[0] = v0*m[0] + v1*m[4] + v2*m[8] + v3*m[12];
    v[1] = v0*m[1] + v1*m[5] + v2*m[9] + v3*m[13];
    v[2] = v0*m[2] + v1*m[6] + v2*m[10] + v3*m[14];
    v[3] = v0*m[3] + v1*m[7] + v2*m[11] + v3*m[15];
    return this;
  }
  
  function post_mul_mat4(that) {
    var v = this.vec4, m = that.mat4
    , v0 = v[0], v1 = v[1], v2 = v[2], v3 = v[3]
    ;

    v[0] = v0*m[0] + v1*m[1] + v2*m[2] + v3*m[3];
    v[1] = v0*m[4] + v1*m[5] + v2*m[6] + v3*m[7];
    v[2] = v0*m[8] + v1*m[9] + v2*m[10] + v3*m[11];
    v[3] = v0*m[12] + v1*m[13] + v2*m[14] + v3*m[15];
    return this;
  }

  return function() {
    this.set = set;
    this.pre_mul_mat4 = pre_mul_mat4;
    this.post_mul_mat4 = post_mul_mat4;
  };
})();

var vec4 = function() {
  this.vec4 = new Float32Array(4);
};

asVec4.call(vec4.prototype);

var asMat4 = (function() {
  "use asm";

  function transpose() {
    var m = this.mat4
    , m01 = m[1], m02 = m[2], m03 = m[3]
    , m12 = m[6], m13 = m[7], m23 = m[11]
    ;

    m[1] = m[4]; m[2] = m[8]; m[3] = m[12];
    m[4] = m01; m[6] = m[9]; m[7] = m[13];
    m[8] = m02; m[9] = m12; m[11] = m[14];
    m[12] = m03; m[13] = m13; m[14] = m23;
    return this;
  }

  function copy(that) {
    var m = this.mat4, n = that.mat4;
    m[0] = n[0]; m[1] = n[1]; m[2] = n[2]; m[3] = n[3];
    m[4] = n[4]; m[5] = n[5]; m[6] = n[6]; m[7] = n[7];
    m[8] = n[8]; m[9] = n[9]; m[10] = n[10]; m[11] = n[11];
    m[12] = n[12]; m[13] = n[13]; m[14] = n[14]; m[15] = n[15];
    return this;
  }

  function set_translate(x, y, z) {
    var m = this.mat4;
    m[12] = x; m[13] = y; m[14] = z;
    return this;
  }

  function invert() {
    var m = this.mat4
    , a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3]
    , a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7]
    , a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11]
    , a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15]
    , b00 = a00*a11 - a01*a10, b01 = a00*a12 - a02*a10
    , b02 = a00*a13 - a03*a10, b03 = a01*a12 - a02*a11
    , b04 = a01*a13 - a03*a11, b05 = a02*a13 - a03*a12
    , b06 = a20*a31 - a21*a30, b07 = a20*a32 - a22*a30
    , b08 = a20*a33 - a23*a30, b09 = a21*a32 - a22*a31
    , b10 = a21*a33 - a23*a31, b11 = a22*a33 - a23*a32
    , det = 1.0 / (b00*b11 - b01*b10 + b02*b09 + b03*b08 - b04*b07 + b05*b06)
    ;

    m[0] = (a11*b11 - a12*b10 + a13*b09) * det;
    m[1] = (a02*b10 - a01*b11 - a03*b09) * det;
    m[2] = (a31*b05 - a32*b04 + a33*b03) * det;
    m[3] = (a22*b04 - a21*b05 - a23*b03) * det;
    m[4] = (a12*b08 - a10*b11 - a13*b07) * det;
    m[5] = (a00*b11 - a02*b08 + a03*b07) * det;
    m[6] = (a32*b02 - a30*b05 - a33*b01) * det;
    m[7] = (a20*b05 - a22*b02 + a23*b01) * det;
    m[8] = (a10*b10 - a11*b08 + a13*b06) * det;
    m[9] = (a01*b08 - a00*b10 - a03*b06) * det;
    m[10] = (a30*b04 - a31*b02 + a33*b00) * det;
    m[11] = (a21*b02 - a20*b04 - a23*b00) * det;
    m[12] = (a11*b07 - a10*b09 - a12*b06) * det;
    m[13] = (a00*b09 - a01*b07 + a02*b06) * det;
    m[14] = (a31*b01 - a30*b03 - a32*b00) * det;
    m[15] = (a20*b03 - a21*b01 + a22*b00) * det;
    return this;
  }

  function set_identity() {
    var m = this.mat4;
    m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
    m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
    m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
    m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
    return this;
  }

  function set_left_identity() {
    var m = this.mat4;
    m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
    m[4] = 0; m[5] = -1; m[6] = 0; m[7] = 0;
    m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
    m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
    return this;
  }

  function set_transpose(that) {
    var m = this.mat4, n = that.mat4;
    m[1] = n[4]; m[2] = n[8]; m[3] = n[12];
    m[4] = n[1]; m[6] = n[9]; m[7] = n[13];
    m[8] = n[2]; m[9] = n[6]; m[11] = n[14];
    m[12] = n[3]; m[13] = n[7]; m[14] = n[11];
    return this;
  }

  function set_invert(that) {
    var m = this.mat4, n = that.mat4
    , a00 = n[0], a01 = n[1], a02 = n[2], a03 = n[3]
    , a10 = n[4], a11 = n[5], a12 = n[6], a13 = n[7]
    , a20 = n[8], a21 = n[9], a22 = n[10], a23 = n[11]
    , a30 = n[12], a31 = n[13], a32 = n[14], a33 = n[15]
    , b00 = a00*a11 - a01*a10, b01 = a00*a12 - a02*a10
    , b02 = a00*a13 - a03*a10, b03 = a01*a12 - a02*a11
    , b04 = a01*a13 - a03*a11, b05 = a02*a13 - a03*a12
    , b06 = a20*a31 - a21*a30, b07 = a20*a32 - a22*a30
    , b08 = a20*a33 - a23*a30, b09 = a21*a32 - a22*a31
    , b10 = a21*a33 - a23*a31, b11 = a22*a33 - a23*a32
    , det = 1.0 / (b00*b11 - b01*b10 + b02*b09 + b03*b08 - b04*b07 + b05*b06)
    ;

    m[0] = (a11*b11 - a12*b10 + a13*b09) * det;
    m[1] = (a02*b10 - a01*b11 - a03*b09) * det;
    m[2] = (a31*b05 - a32*b04 + a33*b03) * det;
    m[3] = (a22*b04 - a21*b05 - a23*b03) * det;
    m[4] = (a12*b08 - a10*b11 - a13*b07) * det;
    m[5] = (a00*b11 - a02*b08 + a03*b07) * det;
    m[6] = (a32*b02 - a30*b05 - a33*b01) * det;
    m[7] = (a20*b05 - a22*b02 + a23*b01) * det;
    m[8] = (a10*b10 - a11*b08 + a13*b06) * det;
    m[9] = (a01*b08 - a00*b10 - a03*b06) * det;
    m[10] = (a30*b04 - a31*b02 + a33*b00) * det;
    m[11] = (a21*b02 - a20*b04 - a23*b00) * det;
    m[12] = (a11*b07 - a10*b09 - a12*b06) * det;
    m[13] = (a00*b09 - a01*b07 + a02*b06) * det;
    m[14] = (a31*b01 - a30*b03 - a32*b00) * det;
    m[15] = (a20*b03 - a21*b01 + a22*b00) * det;
    return this;
  }

  function set_mul(left, right) {
    var m = this.mat4, a = left.mat4, b = right.mat4
    , a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]
    , a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7]
    , a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11]
    , a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15]
    , b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3]
    ;

    m[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    m[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    m[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    m[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    b0 = b[4], b1 = b[5], b2 = b[6], b3 = b[7];
    m[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    m[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    m[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    m[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    b0 = b[8], b1 = b[9], b2 = b[10], b3 = b[11];
    m[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    m[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    m[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    m[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    b0 = b[12], b1 = b[13], b2 = b[14], b3 = b[15];
    m[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    m[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    m[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    m[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return this;
  }

  function set_perspective(fov, aspect, near, far) {
    var m = this.mat4, f = 1 / Math.tan(fov / 2), nf = 1 / (near - far);
    m[0] = f / aspect; m[1] = 0; m[2] = 0; m[3] = 0;
    m[4] = 0; m[5] = f; m[6] = 0; m[7] = 0;
    m[8] = 0; m[9] = 0; m[10] = (far + near) * nf; m[11] = -1;
    m[12] = 0; m[13] = 0; m[14] = 2 * far * near * nf; m[15] = 0;
    return this;
  }

  function pre_mul(that) {
    var m = this.mat4, n = that.mat4
    , n00 = n[0], n01 = n[1], n02 = n[2], n03 = n[3]
    , n10 = n[4], n11 = n[5], n12 = n[6], n13 = n[7]
    , n20 = n[8], n21 = n[9], n22 = n[10], n23 = n[11]
    , n30 = n[12], n31 = n[13], n32 = n[14], n33 = n[15]
    , m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3]
    ;

    m[0] = m0*n00 + m1*n10 + m2*n20 + m3*n30;
    m[1] = m0*n01 + m1*n11 + m2*n21 + m3*n31;
    m[2] = m0*n02 + m1*n12 + m2*n22 + m3*n32;
    m[3] = m0*n03 + m1*n13 + m2*n23 + m3*n33;
    m0 = m[4], m1 = m[5], m2 = m[6], m3 = m[7];
    m[4] = m0*n00 + m1*n10 + m2*n20 + m3*n30;
    m[5] = m0*n01 + m1*n11 + m2*n21 + m3*n31;
    m[6] = m0*n02 + m1*n12 + m2*n22 + m3*n32;
    m[7] = m0*n03 + m1*n13 + m2*n23 + m3*n33;
    m0 = m[8], m1 = m[9], m2 = m[10], m3 = m[11];
    m[8] = m0*n00 + m1*n10 + m2*n20 + m3*n30;
    m[9] = m0*n01 + m1*n11 + m2*n21 + m3*n31;
    m[10] = m0*n02 + m1*n12 + m2*n22 + m3*n32;
    m[11] = m0*n03 + m1*n13 + m2*n23 + m3*n33;
    m0 = m[12], m1 = m[13], m2 = m[14], m3 = m[15];
    m[12] = m0*n00 + m1*n10 + m2*n20 + m3*n30;
    m[13] = m0*n01 + m1*n11 + m2*n21 + m3*n31;
    m[14] = m0*n02 + m1*n12 + m2*n22 + m3*n32;
    m[15] = m0*n03 + m1*n13 + m2*n23 + m3*n33;
    return this;
  }

  function pre_translate(x, y, z) {
    var m = this.mat4
    , m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3]
    , m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7]
    , m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11]
    , m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15]
    ;

    m[0] = m00 + x*m03;
    m[1] = m01 + y*m03;
    m[2] = m02 + z*m03;
    m[4] = m10 + x*m13;
    m[5] = m11 + y*m13;
    m[6] = m12 + z*m13;
    m[8] = m20 + x*m23;
    m[9] = m21 + y*m23;
    m[10] = m22 + z*m23;
    m[12] = m30 + x*m33;
    m[13] = m31 + y*m33;
    m[14] = m32 + z*m33;
    return this;
  }
  
  function pre_scale(x, y, z) {
    var m = this.mat4;
    m[0] = x*m[0]; m[1] = y*m[1]; m[2] = z*m[2];
    m[4] = x*m[4]; m[5] = y*m[5]; m[6] = z*m[6];
    m[8] = x*m[8]; m[9] = y*m[9]; m[10] = z*m[10];
    m[12] = x*m[12]; m[13] = y*m[13]; m[14] = z*m[14];
    return this;
  }

  function pre_rotx(r) {
    var m = this.mat4, s = Math.sin(r), c = Math.cos(r)
    , m01 = m[1], m02 = m[2], m11 = m[5], m12 = m[6] 
    , m21 = m[9], m22 = m[10], m31 = m[13], m32 = m[14]
    ;

    m[1] = c*m01 - s*m02; m[2] = s*m01 + c*m02;
    m[5] = c*m11 - s*m12; m[6] = s*m11 + c*m12;
    m[9] = c*m21 - s*m22; m[10] = s*m21 + c*m22;
    m[13] = c*m31 - s*m32; m[14] = s*m31 + c*m32;
    return this;
  }

  function pre_roty(r) {
    var m = this.mat4, s = Math.sin(r), c = Math.cos(r)
    , m00 = m[0], m02 = m[2], m10 = m[4], m12 = m[6]
    , m20 = m[8], m22 = m[10], m30 = m[12], m32 = m[14]
    ;
    
    m[0] = c*m00 + s*m02; m[2] = c*m02 - s*m00;
    m[4] = c*m10 + s*m12; m[6] = c*m12 - s*m10;
    m[8] = c*m20 + s*m22; m[10] = c*m22 - s*m20;
    m[12] = c*m30 + s*m32; m[14] = c*m32 - s*m30;
    return this;
  };

  function pre_rotz(r) {
    var m = this.mat4, s = Math.sin(r), c = Math.cos(r)
    , m00 = m[0], m01 = m[1], m10 = m[4], m11 = m[5]
    , m20 = m[8], m21 = m[9], m30 = m[12], m31 = m[13] 
    ;

    m[0] = c*m00 - s*m01; m[1] = s*m00 + c*m01;
    m[4] = c*m10 - s*m11; m[5] = s*m10 + c*m11;
    m[8] = c*m20 - s*m21; m[9] = s*m20 + c*m21;
    m[12] = c*m30 - s*m31; m[13] = s*m30 + c*m31;
    return this;
  }
  
  function pre_rotax(r, x, y, z) {
    var m = this.mat4, l = 1 / Math.sqrt(x*x + y*y + z*z);
    x *= l; y *= l; z *= l;

    var a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3]
    , a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7]
    , a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11]
    , s = Math.sin(r), c = Math.cos(r), t = 1 - c
    , b00 = x*x*t + c, b01 = y*x*t + z*s, b02 = z*x*t - y*s
    , b10 = x*y*t - z*s, b11 = y*y*t + c, b12 = z*y*t + x*s
    , b20 = x*z*t + y*s, b21 = y*z*t - x*s, b22 = z*z*t + c;

    m[0] = a00*b00 + a01*b10 + a02*b20;
    m[1] = a00*b01 + a01*b11 + a02*b21;
    m[2] = a00*b02 + a01*b12 + a02*b22;
    m[4] = a10*b00 + a11*b10 + a12*b20;
    m[5] = a10*b01 + a11*b11 + a12*b21;
    m[6] = a10*b02 + a11*b12 + a12*b22;
    m[8] = a20*b00 + a21*b10 + a22*b20;
    m[9] = a20*b01 + a21*b11 + a22*b21;
    m[10] = a20*b02 + a21*b12 + a22*b22;
    m[12] = a30*b00 + a31*b10 + a32*b20;
    m[13] = a30*b01 + a31*b11 + a32*b21;
    m[14] = a30*b02 + a31*b12 + a32*b22;
    return this;
  }  

  function pre_rotpnt(r, x, y, z, u, v, w) {
    var m = this.mat4, l = 1 / Math.sqrt(u*u + v*v + w*w);
    u *= l; v *= l; w *= l;

    var a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3]
    , a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7]
    , a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11]
    , a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15]
    , s = Math.sin(r), c = Math.cos(r), t = 1 - c
    , b00 = u*u + (v*v + w*w)*c, b01 = u*v*t + w*s, b02 = u*w*t - v*s
    , b10 = u*v*t - w*s, b11 = v*v + (u*u + w*w)*c, b12 = v*w*t + u*s
    , b20 = u*w*t + v*s, b21 = v*w*t - u*s, b22 = w*w + (u*u + v*v)*c
    , b30 = (x*(v*v + w*w) - u*(y*v + z*w))*t + (y*w - z*v)*s
    , b31 = (y*(u*u + w*w) - v*(x*u + z*w))*t + (z*u - x*w)*s
    , b32 = (z*(u*u + v*v) - w*(x*u + y*v))*t + (x*v - y*u)*s
    ;

    m[0] = a00*b00 + a01*b10 + a02*b20 + a03*b30;
    m[1] = a00*b01 + a01*b11 + a02*b21 + a03*b31;
    m[2] = a00*b02 + a01*b12 + a02*b22 + a03*b32;
    m[4] = a10*b00 + a11*b10 + a12*b20 + a13*b30;
    m[5] = a10*b01 + a11*b11 + a12*b21 + a13*b31;
    m[6] = a10*b02 + a11*b12 + a12*b22 + a13*b32;
    m[8] = a20*b00 + a21*b10 + a22*b20 + a23*b30;
    m[9] = a20*b01 + a21*b11 + a22*b21 + a23*b31;
    m[10] = a20*b02 + a21*b12 + a22*b22 + a23*b32;
    m[12] = a30*b00 + a31*b10 + a32*b20 + a33*b30;
    m[13] = a30*b01 + a31*b11 + a32*b21 + a33*b31;
    m[14] = a30*b02 + a31*b12 + a32*b22 + a33*b32;
    return this;
  }

  function post_mul(that) {
    var m = this.mat4, n = that.mat4
    , m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3]
    , m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7]
    , m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11]
    , m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15]
    , n0 = n[0], n1 = n[1], n2 = n[2], n3 = n[3]
    ;

    m[0] = n0*m00 + n1*m10 + n2*m20 + n3*m30;
    m[1] = n0*m01 + n1*m11 + n2*m21 + n3*m31;
    m[2] = n0*m02 + n1*m12 + n2*m22 + n3*m32;
    m[3] = n0*m03 + n1*m13 + n2*m23 + n3*m33;
    n0 = n[4], n1 = n[5], n2 = n[6], n3 = n[7];
    m[4] = n0*m00 + n1*m10 + n2*m20 + n3*m30;
    m[5] = n0*m01 + n1*m11 + n2*m21 + n3*m31;
    m[6] = n0*m02 + n1*m12 + n2*m22 + n3*m32;
    m[7] = n0*m03 + n1*m13 + n2*m23 + n3*m33;
    n0 = n[8], n1 = n[9], n2 = n[10], n3 = n[11];
    m[8] = n0*m00 + n1*m10 + n2*m20 + n3*m30;
    m[9] = n0*m01 + n1*m11 + n2*m21 + n3*m31;
    m[10] = n0*m02 + n1*m12 + n2*m22 + n3*m32;
    m[11] = n0*m03 + n1*m13 + n2*m23 + n3*m33;
    n0 = n[12], n1 = n[13], n2 = n[14], n3 = n[15];
    m[12] = n0*m00 + n1*m10 + n2*m20 + n3*m30;
    m[13] = n0*m01 + n1*m11 + n2*m21 + n3*m31;
    m[14] = n0*m02 + n1*m12 + n2*m22 + n3*m32;
    m[15] = n0*m03 + n1*m13 + n2*m23 + n3*m33;
    return this;
  }
 
  function post_translate(x, y, z) {
    var m = this.mat4
    , m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3]
    , m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7]
    , m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11]
    ;

    m[12] = x*m00 + y*m10 + z*m20 + m[12];
    m[13] = x*m01 + y*m11 + z*m21 + m[13];
    m[14] = x*m02 + y*m12 + z*m22 + m[14];
    m[15] = x*m03 + y*m13 + z*m23 + m[15];
    return this;
  }

  function post_scale(x, y, z) {
    var m = this.mat4;
    m[0] = x*m[0]; m[1] = x*m[1]; m[2] = x*m[2]; m[3] = x*m[3];
    m[4] = y*m[4]; m[5] = y*m[5]; m[6] = y*m[6]; m[7] = y*m[7];
    m[8] = z*m[8]; m[9] = z*m[9]; m[10] = z*m[10]; m[11] = z*m[11];
    return this;
  }

  function post_rotx(r) {
    var m = this.mat4, s = Math.sin(r), c = Math.cos(r)
    , m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7]
    , m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11]
    ;

    m[4] = c*m10 + s*m20; m[5] = c*m11 + s*m21; 
    m[6] = c*m12 + s*m22; m[7] = c*m13 + s*m23;
    m[8] = c*m20 - s*m10; m[9] = c*m21 - s*m11;
    m[10] = c*m22 - s*m12; m[11] = c*m23 - s*m13;
    return this;
  }

  function post_roty(r) {
    var m = this.mat4, s = Math.sin(r), c = Math.cos(r)
    , m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3]
    , m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11]
    ;

    m[0] = c*m00 - s*m20; m[1] = c*m01 - s*m21;
    m[2] = c*m02 - s*m22; m[3] = c*m03 - s*m23;
    m[8] = s*m00 + c*m20; m[9] = s*m01 + c*m21;
    m[10] = s*m02 + c*m22; m[11] = s*m03 + c*m23;
    return this;
  }

  function post_rotz(r) {
    var m = this.mat4, s = Math.sin(r), c = Math.cos(r)
    , m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3]
    , m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7]
    ;

    m[0] = c*m00 + s*m10; m[1] = c*m01 + s*m11;
    m[2] = c*m02 + s*m12; m[3] = c*m03 + s*m13;
    m[4] = c*m10 - s*m00; m[5] = c*m11 - s*m01;
    m[6] = c*m12 - s*m02; m[7] = c*m13 - s*m03;
    return this;
  }
 
  function post_rotax(r, x, y, z) {
    var m = this.mat4, l = 1 / Math.sqrt(x*x + y*y + z*z);
    x *= l; y *= l; z *= l;

    var a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3]
    , a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7]
    , a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11]
    , s = Math.sin(r), c = Math.cos(r), t = 1 - c
    , b00 = x*x*t + c, b01 = y*x*t + z*s, b02 = z*x*t - y*s
    , b10 = x*y*t - z*s, b11 = y*y*t + c, b12 = z*y*t + x*s
    , b20 = x*z*t + y*s, b21 = y*z*t - x*s, b22 = z*z*t + c;

    m[0] = a00*b00 + a10*b01 + a20*b02;
    m[1] = a01*b00 + a11*b01 + a21*b02;
    m[2] = a02*b00 + a12*b01 + a22*b02;
    m[3] = a03*b00 + a13*b01 + a23*b02;
    m[4] = a00*b10 + a10*b11 + a20*b12;
    m[5] = a01*b10 + a11*b11 + a21*b12;
    m[6] = a02*b10 + a12*b11 + a22*b12;
    m[7] = a03*b10 + a13*b11 + a23*b12;
    m[8] = a00*b20 + a10*b21 + a20*b22;
    m[9] = a01*b20 + a11*b21 + a21*b22;
    m[10] = a02*b20 + a12*b21 + a22*b22;
    m[11] = a03*b20 + a13*b21 + a23*b22;
    return this;
  }  

  function post_rotpnt(r, x, y, z, u, v, w) {
    var m = this.mat4, l = 1 / Math.sqrt(u*u + v*v + w*w);
    u *= l; v *= l; w *= l;

    var a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3]
    , a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7]
    , a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11]
    , a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15]
    , s = Math.sin(r), c = Math.cos(r), t = 1 - c
    , b00 = u*u + (v*v + w*w)*c, b01 = u*v*t + w*s, b02 = u*w*t - v*s
    , b10 = u*v*t - w*s, b11 = v*v + (u*u + w*w)*c, b12 = v*w*t + u*s
    , b20 = u*w*t + v*s, b21 = v*w*t - u*s, b22 = w*w + (u*u + v*v)*c
    , b30 = (x*(v*v + w*w) - u*(y*v + z*w))*t + (y*w - z*v)*s
    , b31 = (y*(u*u + w*w) - v*(x*u + z*w))*t + (z*u - x*w)*s
    , b32 = (z*(u*u + v*v) - w*(x*u + y*v))*t + (x*v - y*u)*s
    ;

    m[0] = a00*b00 + a10*b01 + a20*b02;
    m[1] = a01*b00 + a11*b01 + a21*b02;
    m[2] = a02*b00 + a12*b01 + a22*b02;
    m[3] = a03*b00 + a13*b01 + a23*b02;
    m[4] = a00*b10 + a10*b11 + a20*b12;
    m[5] = a01*b10 + a11*b11 + a21*b12;
    m[6] = a02*b10 + a12*b11 + a22*b12;
    m[7] = a03*b10 + a13*b11 + a23*b12;
    m[8] = a00*b20 + a10*b21 + a20*b22;
    m[9] = a01*b20 + a11*b21 + a21*b22;
    m[10] = a02*b20 + a12*b21 + a22*b22;
    m[11] = a03*b20 + a13*b21 + a23*b22;
    m[12] = a00*b30 + a10*b31 + a20*b32 + a30;
    m[13] = a01*b30 + a11*b31 + a21*b32 + a31;
    m[14] = a02*b30 + a12*b31 + a22*b32 + a32;
    m[15] = a03*b30 + a13*b31 + a23*b32 + a33;
    return this;
  }

  return function() {
    this.toString = toString;
    this.copy = copy;
    this.set_translate = set_translate;
    this.transpose = transpose;
    this.invert = invert;
    this.set_identity = set_identity;
    this.set_left_identity = set_left_identity;
    this.set_transpose = set_transpose;
    this.set_invert = set_invert;
    this.set_mul = set_mul;
    this.set_perspective = set_perspective;
    this.pre_mul = pre_mul;
    this.pre_translate = pre_translate;
    this.pre_scale = pre_scale;
    this.pre_rotx = pre_rotx;
    this.pre_roty = pre_roty;
    this.pre_rotz = pre_rotz;
    this.pre_rotax = pre_rotax;
    this.pre_rotpnt = pre_rotpnt;
    this.post_mul = post_mul;
    this.post_translate = post_translate;
    this.post_scale = post_scale;
    this.post_rotx = post_rotx;
    this.post_roty = post_roty;
    this.post_rotz = post_rotz;
    this.post_rotax = post_rotax;
    this.post_rotpnt = post_rotpnt;
  };
})();

var mat4 = function() {
  this.mat4 = new Float32Array(16);
};

asMat4.call(mat4.prototype);

var mat3 = (function() {
  return {
    create: function(a) {
        if (a === undefined) {
          return new Float32Array(9);
        } else if (a.length === 9) {
          return new Float32Array(a);
        } else {
          throw "mat3 requires 9 elements";
        }
      }
    ,

    identity: function(m) {
        m[0] = 1; m[1] = 0; m[2] = 0;
        m[3] = 0; m[4] = 1; m[5] = 0;
        m[6] = 0; m[7] = 0; m[8] = 1;
        return m;
      }
    ,

    from_mat4: function(m3, m4) {
        m3[0] = m4[0];
        m3[1] = m4[1];
        m3[2] = m4[2];
        m3[3] = m4[4];
        m3[4] = m4[5];
        m3[5] = m4[6];
        m3[6] = m4[8];
        m3[7] = m4[9];
        m3[8] = m4[10];
        return m3;
      }
    ,

    inv: function(o, a) {
        var a00 = a[0], a01 = a[1], a02 = a[2] 
        , a10 = a[3], a11 = a[4], a12 = a[5]
        , a20 = a[6], a21 = a[7], a22 = a[8]
        , b01 = a22*a11 - a12*a21
        , b11 = a12*a20 - a22*a10
        , b21 = a21*a10 - a11*a20
        , det = 1.0 / (a00*b01 + a01*b11 + a02*b21)
        ;

        o[0] = b01 * det;
        o[1] = (a02*a21 - a22*a01) * det;
        o[2] = (a12*a01 - a02*a11) * det;
        o[3] = b11 * det;
        o[4] = (a22*a00 - a02*a20) * det;
        o[5] = (a02*a10 - a12*a00) * det;
        o[6] = b21 * det;
        o[7] = (a01*a20 - a21*a00) * det;
        o[8] = (a11*a00 - a01*a10) * det;
        return o;
      }
    ,

    normalize: function(o, a) {
        var a00 = a[0], a01 = a[1], a02 = a[2]
        , a10 = a[3], a11 = a[4], a12 = a[5]
        , a20 = a[6], a21 = a[7], a22 = a[8]
        , det = 1.0 / (a00*(a22*a11 - a12*a21)
            + a01*(a12*a20 - a22*a10)
            + a02*(a21*a10 - a11*a20)
          )
        ;

        o[0] = det*a00;
        o[1] = det*a01;
        o[2] = det*a02;
        o[3] = det*a10;
        o[4] = det*a11;
        o[5] = det*a12;
        o[6] = det*a20;
        o[7] = det*a21;
        o[8] = det*a22;
        return o;
      }
    ,

    transpose: function(o, a) {
        if (o === a) {
          var a01 = a[1], a02 = a[2], a12 = a[5];
          o[1] = a[3]; o[2] = a[6];
          o[3] = a01; o[5] = a[7];
          o[6] = a02; o[7] = a12;
        } else {
          o[0] = a[0]; o[1] = a[3]; o[2] = a[6];
          o[3] = a[1]; o[4] = a[4]; o[5] = a[7];
          o[6] = a[2]; o[7] = a[5]; o[8] = a[8];
        }
        return o;
      }
  };
})();
