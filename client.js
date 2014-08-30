var get_shader = function(src, onsuccess) {
  var request = new XMLHttpRequest();
  request.open('GET', src, true);
    request.onreadystatechange = function() {
    if (request.readyState == 4) {
      onsuccess(request.responseText);
    }
  };
  request.send();
};

var prj = new mat4
, fps_count = 100
, fps_history = new Float32Array(fps_count)
, fps_idx = 0
, fps_end = 0
, fps_time = (new Date).getTime()
, w = window.innerWidth
, h = window.innerHeight
, canvas = document.getElementById('view')
, gl = WebGLDebugUtils.makeDebugContext(
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
, anim = true // false
, t0 = (new Date).getTime()
, text = document.getElementById('text')
, round3dp = function(x) {
    return Math.round(x * 1000) / 1000;
  }
, cam = (new mat4).set_identity()
, mod = (new mat4).set_identity().post_translate(0, 0, -3.0005)
, mvp = new mat4
, mmd = new mat4
, ipm = new mat4
, prf = (new mat4).set_perspective(0.5 * Math.PI, 1.0, 0.001, 100.0)
, rt, skybox
, draw = function() {
      mmd.set_mul(cam, mod);
      mvp.copy(cam).set_translate(0, 0, 0).pre_mul(prj).invert();
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      ipm.set_invert(prf);
      skybox.update(ipm);
      //skybox.update(ipm);
      gl.viewport(0, 0, w, h);
      rt.draw({cam:mmd, prj:prj});
      skybox.draw(mvp); // draw skybox last

      if (anim) {
        mod.post_rotx(-0.01);
        var t = (new Date).getTime();
        fps_history[fps_idx++] = t - fps_time;
        if (fps_idx > fps_end) {
          fps_end = fps_idx;
        }
        if (fps_idx >= fps_count) {
          fps_idx = 0;
        }
        fps_time = t;
        var fps = 0;
        for (var i = 0; i < fps_end; ++i) {
          fps += fps_history[i];
        }
        text.textContent=Math.round(1000 * fps_end / fps) + " fps";
        requestAnimationFrame(draw);
      } else {
        text.textContent = '[';
        for (var i = 0; i < 15; ++i) {
          text.textContent += round3dp(cam.mat4[i]) + ' ';
        }
        text.textContent += round3dp(cam.mat4[i]) + ']';
      }
    }
, resize = function() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      //gl.viewport(0, 0, w, h);
      prj.set_perspective(0.5 * Math.PI, w / h, 0.001, 100.0);
      if (!anim) {
        requestAnimationFrame(draw);
      }
    }
;

WebGLDebugUtils.init(gl);
canvas.width = w;
canvas.height = h;
gl.viewport(0, 0, w, h);
prj.set_perspective(0.5 * Math.PI, w / h, 0.001, 100.0);
gl.clearColor(0, 0, 0, 1);
gl.enable(gl.DEPTH_TEST);

//get_shader('client.vert', function(vs) {
//get_shader('client.frag', function(fs) {
    //rt = webgl.raytracer(vs, fs);
    skybox = webgl.skybox();

    var s = 128;
    var start = new Date().getTime();

    rt = webgl.mesh(webgl.per_vertex_shader(), s, isosurface.marching_cubes(0, s
    //, function(x, y, z) {x=2*x-s; y=2*y-s; z=2*z-s; return x*x + y*y + z*z - s*s;}
    //, function(x, y, z) {return {x: 2*x-s, y: 2*y-s, z: 2*z-s};}
    , function(x, y, z) {return simplex.noise3(2 * x / s, 2 * y / s, 2 * z / s);}
    , function(x, y, z) {return simplex.grad3(2 * x / s, 2 * y / s, 2 * z / s);}
    ));

    console.log((new Date().getTime() - start) / 1000.0);
    requestAnimationFrame(draw);
//  });
//});

window.addEventListener('keydown', function(k) {
  console.log("keydown\n");
  switch(String.fromCharCode(k.keyCode)) {
    case 'O':
      cam.pre_translate(0, 0, 0.01);
      if (!anim) {
        draw();
      }
      break;
    case 'P':
      cam.pre_translate(0, 0, -0.01);
      if (!anim) {
        draw();
      }
      break;
    case 'K':
      cam.pre_translate(0, 0.01, 0);
      if (!anim) {
        draw();
      }
      break;
    case 'L':
      cam.pre_translate(0, -0.01, 0);
      if (!anim) {
        draw();
      }
      break;
    case 'N':
      cam.pre_translate(0.01, 0, 0);
      if (!anim) {
        draw();
      }
      break;
    case 'M':
      cam.pre_translate(-0.01, 0, 0);
      if (!anim) {
        draw();
      }
      break;
    case 'Q':
      mod.post_rotx(-0.1);
      if (!anim) {
        draw();
      }
      break;
    case 'W':
      mod.post_rotx(0.1);
      if (!anim) {
        draw();
      }
      break;
    case 'A':
      mod.post_roty(0.1);
      if (!anim) {
        draw();
      }
      break;
    case 'S':
      mod.post_roty(-0.1);
      if (!anim) {
        draw();
      }
      break;
    case 'Z':
      mod.post_rotz(0.1);
      if (!anim) {
        draw();
      }
      break;
    case 'X':
      mod.post_rotz(-0.1);
      if (!anim) {
        draw();
      }
      break;
    case 'E':
      cam.pre_rotx(0.1);
      if (!anim) {
        draw();
      }
      break;
    case 'R':
      cam.pre_rotx(-0.1);
      if (!anim) {
        draw();
      }
      break;
    case 'D':
      cam.pre_roty(0.1);
      if (!anim) {
        draw();
      }
      break;
    case 'F':
      cam.pre_roty(-0.1);
      if (!anim) {
        draw();
      }
      break;
    case 'C':
      cam.pre_rotz(0.1);
      if (!anim) {
        draw();
      }
      break;
    case 'V':
      cam.pre_rotz(-0.1);
      if (!anim) {
        draw();
      }
      break;
  } 
  k.preventDefault();
}, true);

window.addEventListener('resize', resize, false);
window.addEventListener('orientationchange', resize, false);

