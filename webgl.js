var webgl = (function() {
  //var prj = (new mat4).indentity();

  var add_shader = function(prog, type, shader) {
    //console.log(shader);
    var s = gl.createShader(type);
    gl.shaderSource(s, shader);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      var tstr = (type === gl.VERTEX_SHADER) ? "vertex"
        : (type == gl.FRAGMENT_SHADER) ? "fragment"
        : "unknown";
      throw "could not compile " + tstr +" shader:\n\n" + gl.getShaderInfoLog(s);
    }
    gl.attachShader(prog, s);
  };

  var shader_program = function(vs, fs) {
    var prog = gl.createProgram();
    add_shader(prog, gl.VERTEX_SHADER, vs);
    add_shader(prog, gl.FRAGMENT_SHADER, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw "could not link the shader program:\n\n" + gl.getProgramInfoLog(prog);
    }
    return prog;
  }

  function checkerboard(x, y, c0, c1) {
    var ix = 0, c = new Uint8Array(4 * x * y);
    for (var j = 0; j < y; ++j) {
      for (var i = 0; i < x; ++i) {
        if ((i + j) % 2) {
          c.set(c0, ix);
        } else {
          c.set(c1, ix);
        }
        ix += 4;
      }
    }
    return c;
  }

  return {
    viewport: function(x, y, w, h) {
        gl.viewport(x, y, w, h);
        prj.perspective(0.8, w / h, 0.1, 100.0);
      }


    , init: function() {
      }   

    , per_vertex_shader: function() {
        return shader_program(
          "uniform mat4 mod;\n"
          + "uniform mat4 prj;\n"
          + "uniform mat3 nmt;\n"
          + "uniform vec3 light;\n"
          + "attribute vec3 position;\n"
          + "attribute vec3 normal;\n"
          + "varying vec3 colour;\n"
          + "const vec3 ambient_colour = vec3(0.01, 0.01, 0.01);\n"
          + "const vec3 diffuse_colour = vec3(0.6, 0.6, 0.6);\n"
          + "void main() {\n"
          + "  vec4 mp = mod * vec4(position, 1.0);\n"
          + "  vec3 tn = normalize(normal * nmt);\n"
          + "  vec3 dl = normalize(light - mp.xyz);\n"
          //+ "  float nl = max(dot(tn, dl), 0.0);\n"
          + "  float nl = abs(dot(tn, dl));\n"
          + "  colour = ambient_colour + diffuse_colour * nl;\n"
          + "  gl_Position = prj * mp;\n"
          + "}\n"
          ,

          "precision mediump float;"
          + "varying vec3 colour;\n"
          + "void main() {\n"
          + "  gl_FragColor = vec4(colour, 1.0);\n"
          //+ "  vec3 x0 = max(vec3(0.0), colour - 0.004);\n"
          //+ "  vec3 x1 = 6.2 * x0;\n"
          //+ "  gl_FragColor = vec4((x0 * (x1 + 0.5)) / (x0 * (x1 + 1.7) + 0.06), 1.0);\n"
          + "}\n"
        );
      }

    , per_pixel_shader: function() {
        return shader_program(
          "uniform mat4 mod;\n"
          + "uniform mat4 prj;\n"
          + "uniform mat3 nmt;\n"
          + "uniform vec3 light;\n"
          + "attribute vec3 position;\n"
          + "attribute vec3 normal;\n"
          + "varying vec3 vertex_normal;\n"
          + "varying vec3 vertex_light;\n"
          + "void main() {\n"
          + "  vec4 mp = mod * vec4(position, 1.0);\n"
          + "  vertex_normal = normalize(normal * nmt);\n"
          + "  vertex_light = normalize(light - mp.xyz);\n"
          + "  gl_Position = prj * mp;\n"
          + "}\n"
          ,

          "precision mediump float;\n"
          + "varying vec3 vertex_normal;\n"
          + "varying vec3 vertex_light;\n"
          + "const vec3 ambient_colour = vec3(0.2, 0.2, 0.2);\n"
          + "const vec3 directional_colour = vec3(0.6, 0.6, 0.6);\n"
          + "void main() {\n"
          + "  vec3 colour = ambient_colour + directional_colour * max(dot(vertex_normal, vertex_light), 0.0);\n"
          + "  gl_FragColor = vec4(colour, 1.0);\n"
          + "}\n"
        );
      }

    , mesh: function(prg, size, vertices) {
        var len = vertices.length() / 6;
        console.log(len / 3 + " triangles.");

        var s = 1.0 / size;
        var mod = (new mat4).set_identity();
        mod.post_translate(-0.5, -0.5, -0.5);
        mod.post_scale(s, s, s);
        var mvp = new mat4;

        var pos_attr = gl.getAttribLocation(prg, "position");
        var nrm_attr = gl.getAttribLocation(prg, "normal");
        var mod_unif = gl.getUniformLocation(prg, "mod");
        var prj_unif = gl.getUniformLocation(prg, "prj");
        var nmt_unif = gl.getUniformLocation(prg, "nmt"); 
        var lgt_unif = gl.getUniformLocation(prg, "light");

        var vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices.array(), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        var light = new Float32Array([0, 0, 3]);

        var nm = mat3.create();

        return {
          draw: function(world) {
            mvp.set_mul(world.cam, mod);

            gl.useProgram(prg);
            gl.uniformMatrix3fv(nmt_unif, false,
              mat3.inv(nm, mat3.from_mat4(nm, mvp.mat4))
            );
            gl.uniformMatrix4fv(mod_unif, false, mvp.mat4);
            gl.uniformMatrix4fv(prj_unif, false, world.prj.mat4)
            gl.uniform3fv(lgt_unif, light);

            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
            gl.vertexAttribPointer(pos_attr, 3, gl.FLOAT, false, 24, 0);
            gl.vertexAttribPointer(nrm_attr, 3, gl.FLOAT, false, 24, 12);
            gl.enableVertexAttribArray(pos_attr);
            gl.enableVertexAttribArray(nrm_attr);

            gl.drawArrays(gl.TRIANGLES, 0, len);

            gl.disableVertexAttribArray(pos_attr);
            gl.disableVertexAttribArray(nrm_attr);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.useProgram(null);
          }
        };
      }

    , skybox: function() {
        var prg = shader_program(
          "uniform mat4 nmt;\n"
          + "attribute vec3 pos;\n"
          + "varying vec3 tex_coord;\n"
          + "void main() {\n"
          + "  tex_coord = vec3(nmt * vec4(pos, 1.0));\n"
          + "  gl_Position = vec4(pos.xy, 1.0, 1.0);\n"
          + "}\n"
          ,

          "precision mediump float;\n"
          + "uniform samplerCube tex;\n"
          + "varying vec3 tex_coord;\n"
          + "void main() {\n"
          + "  gl_FragColor = textureCube(tex, tex_coord);\n"
          + "}\n"
        );

        var pos_attr = gl.getAttribLocation(prg, "pos");
        var nmt_unif = gl.getUniformLocation(prg, "nmt");
        var tex_unif = gl.getUniformLocation(prg, "tex");

        var pr2 = shader_program(
          "uniform mat4 nmt;\n"
          + "attribute vec3 pos;\n"
          + "varying vec3 eye_vector;\n"
          + "void main() {\n"
          + "  vec4 h = vec4(pos, 1.0);\n"
          + "  eye_vector = (nmt * h).xyz;\n"
          + "  gl_Position = h;\n"
          + "}\n"
          ,
    
          /*
          "precision mediump float;\n" 
          + "uniform vec3 light_dir;\n" 
          + "varying vec3 eye_vector;\n"

          + "float rayleigh_phase(in float c2t) {\n"
          + "  return 0.75 + 0.75 * c2t;\n"
          + "}\n"

          + "const float mie_phase1 = -0.7;\n"
          + "const float mie_phase2 = mie_phase1 * mie_phase1;\n"

          + "float mie_phase(in float c1t, in float c2t) {\n"
          + "  return ((3.0 - 3.0 * mie_phase2) * (1.0 + c2t))\n"
          + "    / ((4.0 + 2.0 * mie_phase2) * pow(1.0 + mie_phase2 - 2.0 * mie_phase1 * c1t, 1.5));\n"
          + "}\n"

          + "float far_ray_sphere(in vec3 pos, in vec3 dir, in float dist2, in float rad2) {\n"
          + "  float b = 2.0 * dot(pos, dir);\n"
          + "  float c = dist2 - rad2;\n"
          + "  float d = max(0.0,  b*b - 4.0 * c);\n"
          + "  return 0.5 * (-b + sqrt(d));\n"
          + "}\n"

          + "float near_ray_sphere(in vec3 pos, in vec3 dir, in float dist2, in float rad2) {\n"
          + "  float b = 2.0 * dot(pos, dir);\n"
          + "  float c = dist2 - rad2;\n"
          + "  float d = max(0.0,  b*b - 4.0 * c);\n"
          + "  return 0.5 * (-b - sqrt(d));\n"
          + "}\n"

          + "bool ray_sphere(in vec3 pos, in vec3 dir, in float dist2, in float rad2) {\n"
          + "  float b = 2.0 * dot(pos, dir);\n"
          + "  float c = dist2 - rad2;\n"
          + "  float d = max(0.0,  b*b - 4.0 * c);\n"
          + "  return d > 0.0 && b > 0.0;\n"
          + "}\n"

          + "const float outer_radius2 = 121.0;\n"
          + "const int samples = 10;\n"
          + "const vec3 rayleigh_colour = vec3(0.18867780, 0.49784430, 0.66160656);\n"

          + "void main() {\n"
          + "  vec3 eye_dir = normalize(eye_vector);\n"
          + "  float angle = max(0.0, dot(eye_dir, light_dir));\n"
          + "  float rayleigh_factor = rayleigh_phase(angle);\n"
          + "  float mie_factor = mie_phase(angle, angle * angle);\n"
          + "  vec3 eye_pos = vec3(0.0, -10.1, 0.0);\n"
          + "  float eye_height = length(eye_pos);\n"
          + "  float eye_depth = far_ray_sphere(eye_pos, eye_dir, eye_height * eye_height, outer_radius2);\n"
          + "  float sample_length = eye_depth / float(samples);\n"
          + "  float sample_dist = 0.5 * sample_length;\n"
          + "  vec3 sample_dir = eye_dir * sample_length;\n"
          + "  vec3 sample_pos = eye_pos + 0.5 * sample_dir;\n"
          + "  vec3 rayleigh = vec3(0.0);\n"
          + "  vec3 mie = vec3(0.0);\n"
          + "  for (int i = 0; i < samples; ++i) {\n"
          + "    float sample_height = length(sample_pos);\n"
          + "    float sample_depth = far_ray_sphere(sample_pos, light_dir, sample_height * sample_height, outer_radius2);\n"
          + "    vec3 influx = 1.0 - pow(rayleigh_colour, vec3(2.0 / sample_depth));\n"
          + "    rayleigh += 1.0 - pow(rayleigh_colour * influx, vec3(2.0 / sample_dist));\n"
          + "    mie += 1.0 - pow(influx, vec3(1.0 / sample_dist));\n"
          + "    sample_dist += sample_length;\n"
          + "    sample_pos += sample_dir;\n"
          + "  }\n"
          + "  rayleigh /= float(samples);\n"
          + "  mie /= float(samples);\n"
          //+ "  float c = float(ray_sphere(eye_pos, eye_dir, eye_height * eye_height, inner_radius2));\n"
          //+ "  float c = rayleigh.b;\n"
          //+ "  gl_FragColor = vec4(c , c / 256.0, c / 65536.0, 1.0);\n"
          + "  gl_FragColor = vec4(rayleigh * mie, 1.0);\n"
          + "}\n"
          */

          /*
          "precision mediump float;\n" 
          + "uniform vec3 light_vector;\n" 
          + "varying vec3 eye_vector;\n"

          + "const int num_samples_eye = 16;\n"
          + "const int num_samples_light = 8;\n"
          + "const float PI = 3.141592654;\n"
          + "const float g = 0.76;\n"
          + "const float g2 = g * g;\n"

          + "struct atmosphere {\n"
          + "  vec3 beta_rayleigh;\n"
          + "  vec3 beta_mie;\n"
          + "  float scale_height_rayleigh;\n"
          + "  float scale_height_mie;\n"
          + "  float planet_radius;\n"
          + "  float atmosphere_radius;\n"
          + "};\n"
          
          + "struct ray {\n"
          + "  vec3 pos;\n"
          + "  vec3 dir;\n"
          + "  float t0;\n"
          + "  float t1;\n"
          + "};\n"

          + "void intersect_to(inout ray r, in float rad2) {\n"
          + "  vec3 omc = -r.pos;\n"
          + "  float b = dot(omc, r.dir);\n"
          + "  float d = b * b - dot(omc, omc) + rad2;\n"
          + "  float t0 = b - sqrt(max(0.0, d));\n"
          + "  r.t1 = (d >= 0.0) ? ((t0 >= r.t0) ? min(t0, r.t1) : r.t1) : r.t1;\n"
          + "}\n"

          + "void intersect_in(inout ray r, in float rad2) {\n"
          + "  vec3 omc = -r.pos;\n"
          + "  float b = dot(omc, r.dir);\n"
          + "  float d = b * b - dot(omc, omc) + rad2;\n"
          + "  float e = sqrt(max(0.0, d));\n"
          + "  float t0 = b - e;\n"
          + "  float t1 = b + e;\n"
          + "  bool dgez = (d >= 0.0);\n"
          + "  r.t0 = dgez ? ((r.t1 >= t0) ? max(t0, r.t0) : r.t0) : r.t0;\n"
          + "  r.t1 = dgez ? ((t1 >= r.t0) ? min(t1, r.t1) : r.t1) : r.t1;\n"
          + "}\n"
          
          + "void intersect_from(inout ray r, in float rad2) {\n"
          + "  vec3 omc = -r.pos;\n"
          + "  float b = dot(omc, r.dir);\n"
          + "  float d = b * b - dot(omc, omc) + rad2;\n"
          + "  float t1 = b + sqrt(max(0.0, d));\n"
          + "  r.t0 = (d >= 0.0) ? ((r.t1 >= t1) ? max(t1, r.t0) : r.t0) : r.t0;\n"
          + "}\n"

          + "vec3 ray_t(in ray r, in float t) {\n"
          + "  return r.pos + t * r.dir;\n"
          + "}\n"

          + "vec3 incident_light(in ray eye, in vec3 light_dir, in atmosphere a) {\n"
          + "  float segment_length_eye = (eye.t1 - eye.t0) / float(num_samples_eye);\n"
          + "  float t = eye.t0;\n"
          + "  vec3 sum_rayleigh = vec3(0.0), sum_mie = vec3(0.0);\n"
          + "  float optical_depth_rayleigh = 0.0;\n"
          + "  float optical_depth_mie = 0.0;\n"
          + "  float mu = dot(eye.dir, light_dir);\n"
          + "  float mu2 = mu * mu;\n"
          + "  float phase_rayleigh = 3.0 / (16.0 * PI) * (1.0 + mu2);\n"
          + "  float phase_mie = 3.0 / (8.0 * PI) * ((1.0 - g2) * (1.0 + mu2)) / ((2.0 + g2) * pow(1.0 + g2 - 2.0 * g * mu, 1.5));\n"
          + "  for (int i = 0; i < num_samples_eye; ++i) {\n"
          + "    vec3 sample_pos = ray_t(eye, t + 0.5 * segment_length_eye);\n"
          + "    float height = length(sample_pos) - a.planet_radius;\n"
          + "    float hr = exp(-height / a.scale_height_rayleigh) * segment_length_eye;\n"
          + "    float hm = exp(-height / a.scale_height_mie) * segment_length_eye;\n"
          + "    optical_depth_rayleigh += hr;\n"
          + "    optical_depth_mie += hm;\n"
          + "    ray l = ray(sample_pos, light_dir, 0.0, 10.0 * a.atmosphere_radius);\n"
          + "    intersect_in(l, a.atmosphere_radius * a.atmosphere_radius);\n"
          + "    float segment_length_light = (l.t1 - l.t0) / float(num_samples_light);\n"
          + "    float t_light = l.t0;\n"
          + "    float optical_depth_light_rayleigh = 0.0;\n"
          + "    float optical_depth_light_mie = 0.0;\n"
          + "    for(int j = 0; j < num_samples_light; ++j) {\n"
          + "      vec3 sample_pos_light = ray_t(l, t_light + 0.5 * segment_length_light);\n"
          + "      float height_light = length(sample_pos_light) - a.planet_radius;\n"
          + "      optical_depth_light_rayleigh += exp(-height_light / a.scale_height_rayleigh) * segment_length_light;\n"
          + "      optical_depth_light_mie += exp(-height_light / a.scale_height_mie) * segment_length_light;\n"
          + "      t_light += segment_length_light;\n"
          + "    }\n"
          + "    vec3 tau = a.beta_rayleigh * (optical_depth_rayleigh + optical_depth_light_rayleigh) + a.beta_mie * (optical_depth_mie + optical_depth_light_mie);\n"
          + "    vec3 attenuation = exp(-tau);\n"
          + "    sum_rayleigh += hr * attenuation;\n"
          + "    sum_mie += hm * attenuation;\n"
          + "    t += segment_length_eye;\n"
          + "  }\n"
          + "  return 20.0 * (sum_rayleigh * phase_rayleigh * a.beta_rayleigh + sum_mie * phase_mie * a.beta_mie);\n"
          + "}\n"

          + "  const atmosphere a = atmosphere("
          + "    vec3(5.5e-6, 13.0e-6, 22.4e-6),"
          + "    vec3(21e-6),"
          + "    7994.0,"
          + "    1200.0,"
          + "    6360.0e3,"
          + "    6420.0e3"
          + "  );\n"

          + "void main() {\n"
          + "  ray eye = ray(vec3(0.0, 9371.0e3, 0.0), normalize(eye_vector), 0.0, 10.0 * a.atmosphere_radius);\n"
          + "  intersect_in(eye, a.atmosphere_radius * a.atmosphere_radius);\n"
          + "  intersect_to(eye, a.planet_radius * a.planet_radius);\n"
          //+ "  float t = eye.t1 / 2000.0; // incident_light(eye, normalize(light_vector), a);\n"
          //+ "  gl_FragColor = vec4(t, t == 0.0, -t, 1.0);\n"
          + "  gl_FragColor = vec4(incident_light(eye, normalize(light_vector), a), 1.0);\n"
          + "}\n"
          */

          "precision mediump float;\n" 
          + "uniform vec3 light_vector;\n" 
          + "varying vec3 eye_vector;\n"

          + "float rayleigh_phase(in float c2t) {\n"
          + "  return 0.75 + 0.75 * c2t;\n"
          + "}\n"

          + "const float mie_phase1 = -0.98;\n"
          + "const float mie_phase2 = mie_phase1 * mie_phase1;\n"

          + "float mie_phase(in float c1t, in float c2t) {\n"
          + "  return 1.5 * ((1.0 - mie_phase2) / (2.0 + mie_phase2)) * (1.0 + c2t) / pow(1.0 + mie_phase2 - 2.0 * mie_phase1 * c1t, 1.5);\n"
          + "}\n"

          + "float far_intersection(in vec3 pos, in vec3 dir, in float dist2, in float rad2) {\n"
          + "  float b = 2.0 * dot(pos, dir);\n"
          + "  float c = dist2 - rad2;\n"
          + "  float d = max(0.0,  b*b - 4.0 * c);\n"
          + "  return 0.5 * (-b + sqrt(d));\n"
          + "}\n"

          + "bool near_intersection(in vec3 pos, in vec3 dir, in float dist2, in float rad2, out float t) {\n"
          + "  float b = 2.0 * dot(pos, dir);\n"
          + "  float c = dist2 - rad2;\n"
          + "  float d = max(0.0, b*b - 4.0 * c);\n"
          + "  t = 0.5 * (-b - sqrt(d));\n"
          + "  return d > 0.0 && b < 0.0;\n"
          + "}\n"

          + "bool ray_sphere(in vec3 pos, in vec3 dir, in float dist2, in float rad2) {\n"
          + "  float b = 2.0 * dot(pos, dir);\n"
          + "  float c = dist2 - rad2;\n"
          + "  float d = max(0.0, b * b - 4.0 * c);\n"
          + "  return d > 0.0 && b < 0.0;\n"
          + "}\n"

          + "const float scale_depth = 0.25;\n"

          + "float scale_angle(in float c1a) {\n"
          + "  float x = 1.0 - c1a;\n"
          + "  return scale_depth * exp(-0.00287 + x * (0.459 + x * (3.83 + x * (-6.8 + x * 5.25))));\n"
          + "}\n"

          + "const int samples = 5;\n"
          + "const float pi4 = 4.0 * 3.141592654;\n"
          + "const float inner_radius = 10.0;\n"
          + "const float outer_radius = 10.25;\n"
          + "const vec3 sun_colour = vec3(1.0, 0.957, 0.929);\n"
          + "const float esun = 20.0;\n"
          + "const float rayleigh_scatter = 0.0025;\n"
          + "const float rayleigh_scatter4 = rayleigh_scatter * pi4;\n"
          + "const float rayleigh_scatter_esun = rayleigh_scatter * esun;\n"
          + "const float mie_scatter = 0.0010;\n"
          + "const float mie_scatter4 = mie_scatter * pi4;\n"
          + "const float mie_scatter_esun = mie_scatter * esun;\n"
          + "const vec3 inv_wavelength = vec3(5.602044746, 9.473284438, 19.64380261);\n"
          + "const float scale = 1.0 / (outer_radius - inner_radius);\n"
          + "const float scale_over_scale_depth = scale / scale_depth;\n"
          + "const float exposure = 2.0;\n"

          + "void main() {\n"
          + "  vec3 eye_pos = inner_radius * vec3(0.0, 1.015, 0.0);\n"
          + "  vec3 eye_dir = normalize(eye_vector);\n"
          + "  float eye_height = length(eye_pos);\n"
          + "  float far = far_intersection(eye_pos, eye_dir, eye_height * eye_height,\n"
          + "    outer_radius * outer_radius);\n"
          + "  float near;\n"
          + "  bool ground = near_intersection(eye_pos, eye_dir, eye_height * eye_height,\n"
          + "    inner_radius * inner_radius, near);\n"
          + "  far = mix(far, near, float(ground));\n"

          + "  vec3 start = eye_pos;\n"
          + "  float height = length(start);\n"
          + "  float depth = exp(scale_over_scale_depth * (inner_radius - eye_height));\n"
          + "  float start_angle = dot(eye_dir, start) / height;\n"
          + "  float start_offset = depth * scale_angle(start_angle);\n"

          + "  float sample_length = far / float(samples);\n"
          + "  float scaled_length = sample_length * scale;\n"
          + "  vec3 sample_dir = eye_dir * sample_length;\n"
          + "  vec3 sample_pos = start + sample_dir * 0.5;\n"
          + "  vec3 light_dir = normalize(light_vector);\n"

          + "  vec3 front_colour = vec3(0.0, 0.0, 0.0);\n"
          + "  vec3 attenuate;\n"
          + "  float scatter;\n"
          + "  for (int i = 0; i < samples; ++i) {\n"
          + "    height = length(sample_pos);\n"
          //+ "    vec3 sample_pos_over_height = sample_pos / height;\n"
          + "    vec3 sample_normal = normalize(sample_pos);\n"
          + "    depth = exp(scale_over_scale_depth * (inner_radius - height));\n"
          + "    float camera_angle = dot(eye_dir, sample_normal); //sample_pos_over_height);\n"
          + "    float light_angle = dot(light_dir, sample_normal); //sample_pos_over_height);\n"
          + "    scatter = start_offset + depth * (scale_angle(light_angle) - scale_angle(camera_angle));\n"
          + "    attenuate = exp(-scatter * (inv_wavelength * rayleigh_scatter4 + mie_scatter4));\n"
          + "    front_colour += attenuate * (depth * scaled_length);\n"
          + "    sample_pos += sample_dir;\n"
          + "  }\n"

          + "  front_colour *= sun_colour;\n"
          + "  vec3 rayleigh_colour = front_colour * (inv_wavelength * rayleigh_scatter_esun);\n"
          + "  vec3 mie_colour = front_colour * mie_scatter_esun;\n"

          + "  vec3 dir = -eye_dir * far;\n"
          + "  float c1t = dot(light_dir, dir) / length(dir);\n"
          + "  float c2t = c1t * c1t;\n"
          //+ "  vec3 col = rayleigh_phase(c2t) * rayleigh_colour + mie_phase(c1t, c2t) * mie_colour;\n"
          + "  vec3 col = rayleigh_phase(c2t) * rayleigh_colour;\n"
          //+ "  vec3 col = mie_phase(c1t, c2t) * mie_colour;\n"
          //+ "  vec3 col = attenuate;\n"
          //+ "  gl_FragColor = vec4(1.0 - exp(-2.0 * col), 1.0);\n"
          //+ "  gl_FragColor = vec4(vec3((1.0 - exp(-2.0 *col)) * (1.0 - float(ray_sphere(eye_pos, eye_dir, eye_height * eye_height, inner_radius * inner_radius)))), 1.0);\n"
          //+ "  gl_FragColor = vec4(vec3(ray_sphere(eye_pos, eye_dir, eye_height * eye_height, inner_radius * inner_radius)), 1.0);\n"
          //+ "  float c = scatter;\n"
          //+ "  gl_FragColor = vec4(c , 0, -c, 1.0);\n"
          //+ "  gl_FragColor = vec4(abs(sample_dir), 1.0);\n"
          + "}\n"
        );

        var po2_attr = gl.getAttribLocation(pr2, "pos");
        var nm2_unif = gl.getUniformLocation(pr2, "nmt");

        var lgt_unif = gl.getUniformLocation(pr2, "light_vector");

        var vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
          -1, -1, 1, 1, -1, 1, -1, 1, 1, 1, 1, 1 
        ]), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        var width = 128, height = 128;
        //var width = 512, height = 512;

        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA
          , width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA
          , width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA
          , width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA
          , width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA
          , width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA
          , width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        var fb = new Array(6);
        fb[0] =  gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb[0]);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0
          , gl.TEXTURE_CUBE_MAP_POSITIVE_X, tex, 0, 0);

        fb[1] =  gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb[1]);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0
          , gl.TEXTURE_CUBE_MAP_NEGATIVE_X, tex, 0, 1);

        fb[2] =  gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb[2]);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0
          , gl.TEXTURE_CUBE_MAP_POSITIVE_Y, tex, 0, 2);

        fb[3] =  gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb[3]);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0
          , gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, tex, 0, 3);

        fb[4] =  gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb[4]);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0
          , gl.TEXTURE_CUBE_MAP_POSITIVE_Z, tex, 0, 4);

        fb[5] =  gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb[5]);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0
          , gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, tex, 0, 5);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

        var light_vector = (new vec4).set(0, 0, -1, 1);
        var light_mat = (new mat4).set_identity().post_rotx(-0.001);

        function sky_begin() {
          gl.disable(gl.DEPTH_TEST);
          gl.depthMask(false);
          gl.useProgram(pr2);
          gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
          gl.vertexAttribPointer(po2_attr, 3, gl.FLOAT, false, 0, 0);
          light_vector.post_mul_mat4(light_mat);
          gl.uniform3fv(lgt_unif, light_vector.vec4.subarray(0, 3));
          gl.enableVertexAttribArray(po2_attr);
        }

        function sky(ipm) {
          gl.uniformMatrix4fv(nm2_unif, false, ipm.mat4);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        function sky_end() {
          gl.disableVertexAttribArray(po2_attr);
          gl.bindBuffer(gl.ARRAY_BUFFER, null);
          gl.useProgram(null);
          gl.depthMask(true);
          gl.enable(gl.DEPTH_TEST);
        }

        return {
          update: function() {
            var m = (new mat4).set_left_identity();
            sky_begin();
            gl.viewport(0, 0, width, height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb[0]);
            m.post_roty(0.5 * Math.PI);
            sky(m);

            gl.bindFramebuffer(gl.FRAMEBUFFER, fb[1]);
            m.post_roty(Math.PI);
            sky(m);

            gl.bindFramebuffer(gl.FRAMEBUFFER, fb[2]);
            m.post_rotx(0.5 * Math.PI);
            m.post_rotz(-0.5 * Math.PI);
            sky(m);

            gl.bindFramebuffer(gl.FRAMEBUFFER, fb[3]);
            m.post_rotx(Math.PI);
            sky(m);

            gl.bindFramebuffer(gl.FRAMEBUFFER, fb[4]);
            m.post_rotx(0.5 * Math.PI);
            sky(m);

            gl.bindFramebuffer(gl.FRAMEBUFFER, fb[5]);
            m.post_roty(Math.PI);
            sky(m)

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            sky_end();

            //gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
            //gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            //gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
          },

          draw: function(mvp) {
            //gl.disable(gl.DEPTH_TEST);
            //gl.depthMask(false);
            gl.depthFunc(gl.LEQUAL)
            gl.useProgram(prg);
            gl.uniformMatrix4fv(nmt_unif, false, mvp.mat4);
            gl.uniform1i(tex_unif, 0);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
            gl.vertexAttribPointer(pos_attr, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(pos_attr);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.disableVertexAttribArray(pos_attr);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
            gl.useProgram(null);
            gl.depthFunc(gl.LESS)
            //gl.depthMask(true);
            //gl.enable(gl.DEPTH_TEST);
          }
        };
      }
  };
})();
