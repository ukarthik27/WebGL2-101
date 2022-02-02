// Identify canvas element, create webgl context, create and compile shaders, link shaders to program, setup state and supply data to buffers or webgl resources as defined in shaders, create/resize canvas, tell gl context use program, draw using gl methods

// webgl is just a raterization api. rasterization ? a process to take input (here vector graphics?) and convert the data into grid of pixels and rendering everything in between. This produces raster image -> displayed on a screen.

// vector graphics - defining points, lines and many more "geometric shapes" on a coordinate system to represent an image/scene 

var canvas = document.getElementById('c');
console.log(canvas)

var gl = canvas.getContext("webgl2");
if(!gl) {
  console.error("webgl 2 not supported");
  alert("webgl 2 not supported");
}
/*
webgGL resources
Attributes, Buffers, Vertex Arrays- this demo
Uniforms - global variables, executed before we set shader program
Textures - data arrays, can access in shader programs
Varyings - Used to pass data from vertex shader to fragment shader
*/


vertexShaderSource = `#version 300 es

in vec4 a_position;

void main() {
  gl_Position = a_position;
}
`;

fragmentShaderSource = `#version 300 es

precision highp float;

out vec4 outColor;
void main() {
  outColor = vec4(1,0,0.5,1);
}`;


/*
create shader, compile -> link shaders to program -> 
*/
function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader,source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader,gl.COMPILE_STATUS);
  if(success) {
    return shader;
  }
  
  console.log("createShaderFailed",gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

var vertexShader = createShader(gl,gl.VERTEX_SHADER,vertexShaderSource);
var fragShader = createShader(gl,gl.FRAGMENT_SHADER,fragmentShaderSource);

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
 
  console.log("createProgram",gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

var program = createProgram(gl,vertexShader,fragShader);

// Initialization and rendering
// majority of webgl api is to setup state to supply data to GLSL programs. ( intialization)

// here only input is a_position which is an attribute

/*
lookup location of attribute, if we define uniform we should lookup its location as well
*/

var positionAttributeLocation = gl.getAttribLocation(program,"a_position");

// attributes get data from buffer
// a. Create buffer and put data
var positionBuffer = gl.createBuffer();

// manipulate webGL resources using global bind points (like internal global variables)
// here the resource is positionBuffer, bindppint is gl array buffer
gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
// now put data in buffer using bindpoint
var positions = [
  0,0,
  0,0.5,
  0.7, 0,
]
/*
webGL is strongly typed (lol) , hence second arg to 32 bit create float array (why? idk yet). this is copied to positionBuffer on GPU (how? look above). STATIC_DRAW denote data wont change, so webgl can optimize
*/
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);

// b. tell attribute to get data from buffer
// b.1 link attribute and buffer using collectionof attribute state. here we can use VertexArrayObject
var vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(positionAttributeLocation);
// b.2 tell how we pull the data out

var size = 2; // 2 components per iteration
// a_position is a vec4 float value like {x:0,y:0,z:0,w:0} in JS
// size 2 access only x,y. z,w set to default 0,1
var type=gl.FLOAT; // data is 32bit float
var normalize = false; //dk what
var stride = 0;        // get the next position in each iteration, 0 = move forward size 
// move forward size * sizeof(type) 
var offset = 0;        // start at the beginning of the buffer
gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset)

// now array_buffer bind point is free as attribute(a_position) is now bound to positionBuffer

// setting up canvas to render
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
//  -1 +1 clip space maps to 0 <-> gl.canvas.width for x and 0 <-> gl.canvas.height for y.

// Clear the canvas
// rgba , a alpha dk what
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

// render
// Tell it to use our program (pair of shaders)
gl.useProgram(program);
              
// Bind the attribute/buffer set we want.
gl.bindVertexArray(vao);
/* At init time we bind a vao to set the attribute state. At render time we bind the vao to use the state we setup at init time.
*/

var primitiveType = gl.TRIANGLES;
var offset = 0;
var count = 3;
gl.drawArrays(primitiveType, offset, count);

/*
https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html#toc
*/