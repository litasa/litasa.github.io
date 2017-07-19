---
layout: post
title: "Start to learn Vulkan - Resources"
tags: [Graphics, Vulkan, Resources]
comments: true
---

The other day I started the process of learning [Vulkan, a new graphics API by Khronos](https://www.khronos.org/vulkan/).
It have been brutal. To get a triangle to show on the screen takes around 800-900 lines of code (compare to OpenGL where about 200 lines is enough). So in this post I wanted to share some of the resources I have used as a starting point to learn Vulkan. It is just two homepages and a book, but since the API is so young resources are scarce. 

## Beginning Vulkan
[Vulkan Tutorial](https://vulkan-tutorial.com/) is a great site to start learning Vulkan, written by [Alexander Overvoorde](https://while.io/). It does not go into details on the mathematics or graphics instead focuses on the API. I think this is great since most people looking at Vulkan are already familiar with OpenGL and/or DirectX. At this page you will learn the absolute basics:

* How to setup the development environment
* Drawing a triangle
* Vertex Buffers
* Uniform Buffers
* Texture Mapping
* Depth Buffering
* Loading Models

Only thing I feel it is lacking in is how to handle multiple resources at the same time.

## From beginner to Intermediate
Next up is a [github repository](https://github.com/SaschaWillems/Vulkan) by [Sascha Willems](https://www.saschawillems.de/) containing A LOT of different examples.
I recommend starting with the [Triangle](https://github.com/SaschaWillems/Vulkan#triangle) example. The approach taken by Sascha is a little different than Alexanders, so it is a good opportunity to see another way of accomplishing the same result. After that take a look at some of the things mentioned in [Vulkan Tutorial](https://vulkan-tutorial.com/), such as [Push Constants](https://github.com/SaschaWillems/Vulkan#push-constants) and [Pipelines](https://github.com/SaschaWillems/Vulkan#pipelines). After that take a look at whatever you find interesting. A lot to learn here.

## Intermediate
The book I have to mention is [Vulkan Programming Guide: The Official Guide to Learning Vulkan](https://www.amazon.com/Vulkan-Programming-Guide-Official-Learning/dp/0134464540). It follows in the veins of [OpenGL Superbible: Comprehensive Tutorial and Reference](https://www.amazon.com/OpenGL-Superbible-Comprehensive-Tutorial-Reference/dp/0672337479). but does miss the mark on the Learning bit. Basically it is a glorified manual for the Vulkan API with not enough examples. Where it shines is when used together with the above mentioned websites. Say you have just read the code example about [Push Constants](https://github.com/SaschaWillems/Vulkan#push-constants) and want to learn more about them, then this book is what you want. It also does a great job on explaining the architecture of Vulkan, how it all fits together.

<hr>

I hope to expand this selection of helpful sites for learning Vulkan as I keep learning myself.