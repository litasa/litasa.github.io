---
layout: post
title: "2D Collision Detection Part 1 - Circle Circle Intersection"
tags: []
comments: false
---
* TOC
{:toc}

# Circle and Problem definition
The problem is as follows:

1) We have two circles `circle 0` and `circle 1`, each defined with a centerpoint `c` and a radius `r`. We want to determine if any part of `circle 1` is touching `circle 0`.

2) In order to resolve a hit we will need to find how much `circle 1` is intersecting `circle 0` and the normal at point of contact.

# Determine Hit

```cpp
bool Intersect_Circle_Circle(vec2 c0, float r0, vec2 c1, float r1)
{
    //create a vector from the centeres
    vec2 x = c1 - c0;
    //if length of vector x is shorter then the sum of the radii we have a collision
    return (length(x) < r0 + r1? true ; false)
}
```

The comments explain the solution but let us concider a few different cases, to make sure it works.

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

<hr>
So, there we have it. How to determine a hit in 2D for two circles. Now let us take a look at the second problem, finding how much the circles intersect and the contact normal.

# Hit Resolution

```cpp
bool Intersect_Circle_Circle(vec2 c0, float r0, vec2 c1, float r1, vec2 &dir, float &dist)
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
This function is similiar to the first algorithm, but here we also collect the direction(`dir`) and distance(`dist`) needed in order to move `circle 1` to not touch `circle 0` anymore.
