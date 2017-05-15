---
layout: post
title: "2D Collision Detection Part 2 - Ray Ray Intersection"
tags: []
comments: false
---

* TOC
{:toc}

# Ray and Problem definition
The problem is as follows:

1) We have two circles `circle 0` and `circle 1`, each defined with a centerpoint `c` and a radius `r`. We want to determine if any part of `circle 1` is touching `circle 0`.

2) In order to resolve a hit we will need to find how much `circle 1` is intersecting `circle 0` and the normal at point of contact.

# Determine Hit

```cpp
bool Intersect_Ray_Ray(vec2 c0, float r0, vec2 c1, float r1)
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

