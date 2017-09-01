---
layout: post
title: "OpenGL MultiDrawIndirect with per-draw constants and textures"
tags: [OpenGL, Techniques, Tutorial]
comments: true
---

I saw an interesting talk the other day, "[High-performance, Low-Overhead Rendering with OpenGL and Vulkan](https://youtu.be/PPWysKFHq9c)" where [Mathias Schott](https://twitter.com/m_mschott) talked about two OpenGL commands called [glMultiDrawArraysIndirect](https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/glMultiDrawArraysIndirect.xhtml) and [glMultiDrawElementsIndirect](https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/glMultiDrawElementsIndirect.xhtml). These two commands give OpenGL the ability to draw multiple objects with vastly different geometries using only "one" draw call. Sounds cool right? So let's take a deeper dive into OpenGLs Multi Draw Indirect commands.

# What does it do
OpenGLs Multi Draw Indirect commands have the following structure:
```c++
void glMultiDrawArraysIndirect(
        GLenum mode,
        const void *indirect,
        GLsizei drawcount,
        GLsizei stride);

void glMultiDrawElementsIndirect(
        GLenum mode,
        GLenum type,
        const void *indirect,
        GLsizei drawcount,
        GLsizei stride);
```
* `mode` dictates what kind of primitive to draw, (GL_POINTS, GL_LINE, GL_TRIANGLES etc.)
* `type` (ONLY MultiDrawElementsIndirect) specifies the type of data bound to GL_ELEMENT_ARRAY_BUFFER (GL_UNSIGNED_INT, GL_SHORT etc)
* `indirect` is a pointer to a array of structs containing draw commands for each object, see below.
* `drawcount` is the number of objects to draw
* `stride` is the distance between each draw command. 0 means tightly packed

The struct is called a draw command and have the following structure
```c++
typedef  struct {
        unsigned int  count;
        unsigned int  instanceCount;
        unsigned int  firstIndex;
        unsigned int  baseInstance;
} DrawArraysIndirectCommand;

typedef  struct {
        unsigned int  count;
        unsigned int  instanceCount;
        unsigned int  firstIndex;
        unsigned int  baseVertex;
        unsigned int  baseInstance;
} DrawElementsIndirectCommand;
```
* `count` refers to the number of used vertices
* `instanceCount` is the number of instances to draw of the current object
* `firstIndex` is the location of the first vertex relative the current object
* `baseVertex` (ONLY DrawElementsIndirectCommand) location of current objects first vertex relative buffer
* `baseInstance` is the current instance for the indirect draw

What glMultiDrawElementsIndirect does is the following (assuming no errors generated):
```c++
GLsizei n;
for (n = 0; n < drawcount; n++)
{
        const DrawElementsIndirectCommand *cmd;
        if (stride != 0) {
                cmd = (const DrawElementsIndirectCommand  *)((uintptr)indirect + n * stride);
        } else {
                cmd = (const DrawElementsIndirectCommand  *)indirect + n;
        }

        glDrawElementsInstancedBaseVertexBaseInstance(
                mode,
                cmd->count,
                type,
                cmd->firstIndex * size-of-type,
                cmd->instanceCount,
                cmd->baseVertex,
                cmd->baseInstance);
}
```
* `mode` is what primitive to draw. Taken directly from the MultiDraw command
* `type` specifies the type of indices. Also taken directly from the MultiDraw command

glMultiDrawArraysIndirect behaves similarly.

The descriptions does not really help your understanding on how to use the glMultiDrawIndirect commands, so let's take a look at one example.

In this example I will be using glMultiDrawElementsIndirect since it models the real world application a little better, but should be trivial to change to Array drawing if that is your thing.

## The Example
In this example we will generate 50 commands to draw rectangles and 50 commands for triangles. Each object with its own transformation matrix. We will also give each object single pixel texture to have some colors to show.

The rectangle is composed of 4 triangles (to make it a little more interesting) as shown below together with the layout of the triangle.

![rectangle]({{site.url}}/images/OpenGL-MultiDrawIndirect/rectangle.jpeg) ![triangle]({{site.url}}/images/OpenGL-MultiDrawIndirect/triangle.jpeg)

The picture below is what we are going to end up with. Nothing too exiting, but it will show how to handle different objects with different amount of vertices and indices each with an individual texture.
![image]({{site.url}}/images/OpenGL-MultiDrawIndirect/result.PNG)

## The Code
The full code can be found [here](https://github.com/litasa/Advanced-OpenGL-Examples/blob/master/src/MultidrawIndirect/MultidrawIndirect.cpp).
Let us just jump right in looking at the code, starting where the action happens; the render loop.

```cpp
 glUseProgram(gProgram);

 glBindVertexArray(gVAO);

 generateDrawCommands();

 //draw
 glMultiDrawElementsIndirect(GL_TRIANGLES, //type
        GL_UNSIGNED_INT,                   //indices represented as unsigned ints
        (GLvoid*)0,                        //start with the first draw command
        100,                               //draw 100 objects
        0);                                //no stride, the draw commands are tightly packed
```
As we can see we need to use the shader program and bind the vertex array where the data is located. We then generate the draw commands, more on that shortly. One thing to note is that the draw commands can be generated on another thread, this is where the hidden power of MultiDrawIndirect comes from. But for demonstration purposes we are just going to create the draw commands right before we use them, on the same thread.

```cpp
void generateDrawCommands()
{
    //Generate draw commands
    SDrawElementsCommand vDrawCommand[100];
    GLuint baseVert = 0;
    for (unsigned i = 0; i<100; ++i)
    {
        //quad
        if (i % 2 == 0)
        {
            vDrawCommand[i].vertexCount = 12;      //4 triangles = 12 vertices
            vDrawCommand[i].instanceCount = 1      //Draw 1 instance
            vDrawCommand[i].firstIndex = 0;        //Draw from index 0 for this instance
            vDrawCommand[i].baseVertex = baseVert; //Starting from baseVert
            vDrawCommand[i].baseInstance = i;      //gl_InstanceID
            baseVert += gQuad.size();
        }
        //triangle
        else
        {
            vDrawCommand[i].vertexCount = 3;       //1 triangle = 3 vertices
            vDrawCommand[i].instanceCount = 1;     //Draw 1 instance
            vDrawCommand[i].firstIndex = 0;        //Draw from index 0 for this instance
            vDrawCommand[i].baseVertex = baseVert; //Starting from baseVert
            vDrawCommand[i].baseInstance = i;      //gl_InstanceID
            baseVert += gTriangle.size();
        }
    }

    //feed the draw command data to the gpu via the gIndirectBuffer
    glBindBuffer(GL_DRAW_INDIRECT_BUFFER, gIndirectBuffer);
    glBufferData(GL_DRAW_INDIRECT_BUFFER, sizeof(vDrawCommand), vDrawCommand, GL_DYNAMIC_DRAW);

    //feed the instance id to the shader.
    glBindBuffer(GL_ARRAY_BUFFER, gIndirectBuffer);
    glEnableVertexAttribArray(2);
    glVertexAttribIPointer(
            2,
            1,
            GL_UNSIGNED_INT,
            sizeof(SDrawElementsCommand),
            (void*)(offsetof(DrawElementsCommand, baseInstance)));
    glVertexAttribDivisor(2, 1); //only once per instance
}
```
In this particular example we are generating individual draw calls for each object, matching the layout of the objects uploaded to the GPU. The draw commands is put into a `GL_DRAW_INDIRECT_BUFFER`. We are also adding the instance id to vertex attribute 2, in order to find the correct texture for each object inside the fragment shader. 

Notice `glVertexAttribDivisor(2,1)` which tells the gpu to use the same baseInstance number until the next object, in essence recreating the `gl_InstanceID`. This is needed since `gl_InstanceID` starts at 0 for each new object. Remember that `glMultiDrawElementsIndirect` calls `glDrawElementsInstancedBaseVertexBaseInstance` once for each draw command. Since we are only drawing 1 instance of each object `gl_InstanceID` will always be `0` in this application (and in the general case, making it as good as useless).
 To work around this limitation we manually upload the instanceId to the shaders. 

```c++
void GenerateGeometry()
{
    //---
    // Generating and binding vertex buffer data
    // In this example also created matrix data (vMatrix) here
    //--
    //Setup per instance matrices using Vertex attributes and the vertex attrib divisor
    glGenBuffers(1, &gMatrixBuffer);
    glBindBuffer(GL_ARRAY_BUFFER, gMatrixBuffer);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vMatrix), vMatrix, GL_STATIC_DRAW);
    //A matrix is 4 vec4s
    glEnableVertexAttribArray(3 + 0);
    glEnableVertexAttribArray(3 + 1);
    glEnableVertexAttribArray(3 + 2);
    glEnableVertexAttribArray(3 + 3);

    glVertexAttribPointer(3 + 0, 4, GL_FLOAT, GL_FALSE, sizeof(Matrix), (GLvoid*)(offsetof(Matrix, a0)));
    glVertexAttribPointer(3 + 1, 4, GL_FLOAT, GL_FALSE, sizeof(Matrix), (GLvoid*)(offsetof(Matrix, b0)));
    glVertexAttribPointer(3 + 2, 4, GL_FLOAT, GL_FALSE, sizeof(Matrix), (GLvoid*)(offsetof(Matrix, c0)));
    glVertexAttribPointer(3 + 3, 4, GL_FLOAT, GL_FALSE, sizeof(Matrix), (GLvoid*)(offsetof(Matrix, d0)));
    //Only apply one per instance
    glVertexAttribDivisor(3 + 0, 1);
    glVertexAttribDivisor(3 + 1, 1);
    glVertexAttribDivisor(3 + 2, 1);
    glVertexAttribDivisor(3 + 3, 1);
}
```
In this example we are using attribute location 3 as a start location for the transform matrix. Since it is a matrix we need to activate 4 consecutive vertex attrib arrays and upload the data as 4 vec4. The reason for this is that glVertexAttribPointer can only handle a maximum of 4 components per vertex attribute (the second parameter). If you are wondering, Matrix is just a convenience struct that looks like this:

```c++
struct Matrix
{
    float a0, a1, a2, a3;
    float b0, b1, b2, b3;
    float c0, c1, c2, c3;
    float d0, d1, d2, d3;
};
```

It is left as an exercise to the reader to try and make one (or more) objects rotate. (hint: glMapBuffer)

```c++
void GenerateArrayTexture()
{
    //Generate an array texture
    glGenTextures(1, &gArrayTexture);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D_ARRAY, gArrayTexture);

    //Create storage for the texture. (100 layers of 1x1 texels)
    glTexStorage3D(GL_TEXTURE_2D_ARRAY,
        1,                    //No mipmaps as textures are 1x1
        GL_RGB8,              //Internal format
        1, 1,                 //width,height
        100                   //Number of layers
    );

    for (unsigned int i(0); i != 100; ++i)
    {
        //Choose a random color for the i-essim image
        GLubyte color[3] = { GLubyte(rand() % 255),GLubyte(rand() % 255),GLubyte(rand() % 255) };

        //Specify i-essim image
        glTexSubImage3D(GL_TEXTURE_2D_ARRAY,
            0,                     //Mipmap number
            0, 0, i,               //xoffset, yoffset, zoffset
            1, 1, 1,               //width, height, depth
            GL_RGB,                //format
            GL_UNSIGNED_BYTE,      //type
            color);                //pointer to data
    }

    glTexParameteri(GL_TEXTURE_2D_ARRAY, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D_ARRAY, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D_ARRAY, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D_ARRAY, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
}
```
Generating the textures are quite simple in this example. We start by creating a 3D texture storage for 100 different textures, then populate it with our generated data. What we have done here is creating a basic texture array. See below in the fragment shader to see how it is used.

Lastly we will take a look at our shaders, starting with the vertex shader

```hlsl
//Vertex Shader
#version 430 core

layout (location = 0 ) in vec2 position;
layout (location = 1 ) in vec2 texCoord;
layout (location = 2 ) in uint drawid;
layout (location = 3 ) in mat4 instanceMatrix;
//locations 4,5,6 is also take by instanceMatrix

layout (location = 0 ) out vec2 uv;
layout (location = 1 ) flat out uint drawID;

void main(void)
{
  uv = texCoord;
  drawID = drawid;
  gl_Position = instanceMatrix * vec4(position,0.0,1.0);
}
```

Only one small interesting thing is happening here and that is that we disable interpolation for drawid using the `flat` keyword.

```hlsl
//Fragment Shader
#version 430 core

layout (location = 0 ) in vec2 uv;
layout (location = 1 ) flat in uint drawID;

layout (location = 0) out vec4 color;

layout (binding = 0) uniform sampler2DArray textureArray;

void main(void)
{
  color = texture(textureArray, vec3(uv.x, uv.y, drawID) );
}
```
The fragment shader is just as uninteresting as the vertex shader. Note that we use the drawID to look into the 2D texture array to find the texture we are interested in.

## The End
So this is a small example on how to use `glMultiDrawElementsIndirect` (and indirectly how `glMultiDrawArraysIndirect`).

A small challenge for the reader would be to update the transform matrices each frame (Hint: `glMapBuffer` or similar). Doing this would make the example able to almost work as a sprite renderer.
Another challenge would to upload individual sprite textures with the same size. Sadly I have no idea at the moment on how to work with different sized sprites.

I hope that this foray into OpenGLs MultiDrawElementsIndirect have been helpful for you!

Until next time
/Jakob Törmä Ruhl