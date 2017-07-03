---
layout: post
title: "2D Collision Detection Part 0 - Introduction"
tags: []
comments: false
---

So I recently came across the problem of determine if a line segment intersects an Axis Aligned Bounding Box(aabb), and while I have done this a few times I was a bit unsure about the solution. So I did what every self-relient programmer would do. I googled it... And found nothing 

So I decided to write a series of small tutorials on collision detection in 2D. My hope is to have code that can be copy pasted into any project, while also providing more information on how it works with detailed pictures and text. The code will be written in C++, but should easily be translated into whatever language needed

## Collision Detection
Collision detection is the act of finding potential collisions between different objects. In this tutorial a collision is defined as two objects touching or intersecting. How to resolve a collision (collision handling) is up to the implementation, but collecting some relevant data will be discussed, when it is not provided in the collision checking. 

Most of the algorithms discussed will easily translate to 3D, I will leave that up to the reader as an exercise to implement for the time being (I might revisit this subject in the future).

# Prerequisites
Since a lot of vectors and angles will be part of the course, a firm grasp on linjear algebra (dot product, cross product, vectors) and trigonomitry will make understanding what is happening a brease. I will try and explain as good as I can with picures and words in order to make the algorithms as easy to understand as possible.

I will use [glm](http://glm.g-truc.net/0.9.8/index.html) as my math library. The code should be easily translatable to whatever math library you are using.

<hr>

I hope someone will find these tutorials helpful. 

In the first tutorial we will take a look at circle and circle intersection.
