---
layout: post
title: "2D Collision Detection Part 2 - Box Box Intersection"
tags: []
comments: false
---
Intersecting two Boxes is also a common test to do, for example checking if the heroes sword swing hits the big bad skeleton.

The problem is as follows:

1) We have two boxes `box 0` and `box 1`, each defined as a point `top_left` located in the top left corner, a width `width` and a height `height`. We want to determine if any part of `box 1` is touching `box 0`.

2) In order to resolve a hit we need to find out how much `box 1` is intersection `box 0`.

2 a) To have `box 1` slide against `box 0` we also need to know the direction `box 1` is traveling in.

3) Both of the boxes are axis aligned and cannot rotate.

# Determine Hit

```cpp
bool Intersect_Box_Box(vec2 top_left0, float width0, float height0, vec2 top_left1, float width1, float height0)
{
    if(top_left1.x + width1 < top_left0)
    {
        //box1 is to the left of box0
        return false;
    }
    if(top_left0.x + width0 < top_left1)
    {
        //box1 is to the right of box0
        return false;
    }
    if(top_left1.y + height1 < top_left0.y)
    {
        //box1 is above box0
        return false;
    }
    if(top_left0.y + height0 < top_left1.y)
    {
        //box1 is below box0
        return false;
    }
    //box1 is not above, below, left or right of box0. Must be inside
    return true;
}
```

#### Case 1: Box 1 is to the right of Box 0
<div class="grid">
    <div class="unit one-third"></div>
    <div class="unit one-third image">
        <img src="{{ site.baseurl }}/images/circle-circle-intersection-1-no-collision.svg" width="300">
        <div class="image-text">
        </div>
    </div>
</div>


#### Case 2: Box 1 is to the left of Box 0


#### Case 3: Box 1 is above Box 0

#### Case 4: Box 1 is below Box 0

#### Extreme Case: Box 1 is inside Box 0

# Hit Resolution

```cpp
bool Intersect_Box_Box(vec2 top_left0, float width0, float height0, vec2 top_left1, float width1, float height0)
{
    if(top_left1.x + width1 < top_left0.x)
    {
        //box1 is to the left of box0
        return false;
    }
    if(top_left0.x + width0 < top_left1.x)
    {
        //box1 is to the right of box0
        return false;
    }
    if(top_left1.y + height1 < top_left0.y)
    {
        //box1 is above box0
        return false;
    }
    if(top_left0.y + height0 < top_left1.y)
    {
        //box1 is below box0
        return false;
    }
    //box1 is not above, below, left or right of box0. Must be inside or touching box0

    return true;
}
```