---
layout: post
title: "2D Collision Detection Part 1 - Circle Circle Intersection"
tags: []
comments: false
---
* TOC
{:toc}

So I recently came across the problem of determine if a line segment intersects an Axis Aligned Bounding Box(aabb), and while I have done this a few times I was a bit unsure about the solution so I did what every self-relient programmer would do. I googled it. And I found no sources with a good solution that handled the case of if the line segment is inside the aabb. So I decided to write a small tutorial on collision detection in 2D.

## The Basics
Collision detection is the act of finding potential collisions between different objects. A happens when the area of two objects intersects. In order to understand the math involved knowledge about basic algebra is required (dot product, cross product etc.). In this first tutorial, we will discuss circle and circle collision detection, since it has the easiest mathematics.

## Circles
Mathematically circles are defined as a point and a radius. This representation enables us to determine a hit in a few different ways.

### Determine hit

```cpp
bool IntersectCircleCircle(vec2 c0, float r0, vec2 c1, float r1)
{
    //create a vector from the centeres
    vec2 x = c1 - c0;
    //if length of vector x is shorter then the sum of the radii we have a collision
    return (length(x) < r0 + r1? true ; false)
}
```

This small snippet determines if a hit is registred by looking if the length between the centres of the circles is shorter then the sum of the radii.

Let us concider a few different cases.

#### Case 1: No collision
<div class="grid">
    <div class="unit one-third"></div>
    <div class="unit one-third image">
        <img src="{{ site.baseurl }}/images/circle-circle-intersection-1-no-collision.svg" width="300">
        <div class="image-text">
        </div>
    </div>
</div>

The distance between the centers (the length of x) is larger than the sum of the radii, we have no collision. The length of the combined radii and the x vector is showed below the image for easy reference.

#### Case 2: On the edge
<div class="grid">
    <div class="unit one-third"></div>
    <div class="unit one-third image">
        <img src="{{ site.baseurl }}/images/circle-circle-intersection-2-edge-collision.svg" width="300">
        <div class="image-text">
        </div>
    </div>
</div>

If the distance between the centers are the same length as the sum of the radii we have a potential hit, depending on the implementation. In the code snippet above, exchange the `<` symbol in the return statement to `<=` if you want to include this case in the hit.

#### Case3: Collision
<div class="grid">
    <div class="unit one-third"></div>
    <div class="unit one-third image">
        <img src="{{ site.baseurl }}/images/circle-circle-intersection-3-collision.svg" width="300">
        <div class="image-text">
        </div>
    </div>
</div>

When the distance between the centers is less than the sum of the radii we have a collision.

#### Case4: Circle inside circle
<div class="grid">
    <div class="unit one-third"></div>
    <div class="unit one-third image">
        <img src="{{ site.baseurl }}/images/circle-circle-intersection-4-extreme-collision.svg" width="300">
        <div class="image-text">
        </div>
    </div>
</div>

When one circle is inside another circle this algorithm still produces a hit since the length of x is shorter than the larger circles radius.

### Hit Resolution
So, there we have it. How to determine a hit in 2D for two circles. Ok so we know that the two circles are intersecting each other, now what? This is where collision handling comes into play, and what you want to do is totally up to you. But I will try and provide some of the more common things you would want to do in each of my tutorials.

```cpp
bool IntersectCircleCircle(vec2 c0, float r0, vec2 c1, float r1, vec2 &dir, float &dist)
{
    //create a vector from the centeres
    vec2 x = c1 - c0;
    //if length of vector x is shorter then the sum of the radii we have a collision
    if (length(x) < r0 + r1)
    {
        dir = normalize(x);
        dist = r0 + r1 - length(x);
        return true;
    }
    return false;
}
```
<div class="grid">
    <div class="unit one-third"></div>
    <div class="unit one-third image">
        <img src="{{ site.baseurl }}/images/circle-circle-intersection-5-collision-resolution.svg" width="300">
        <div class="image-text">
        </div>
    </div>
</div>
This function is similiar to the one before but here we also get the direction, `dir`, we need to move `c1` and the amount `dist`, in order to resolve the conflict. I recommend to boundle the data, `dir`, `dist` and the return value into a struct with the following structure
```cpp
struct intersect
{
    bool hit = false;
    vec2 dir = vec2(0,0);
    float dist = 0;
}
```
to make it more clear on what is going on, and what data that is available.