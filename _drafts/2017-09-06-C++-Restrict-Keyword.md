---
layout: post
title: "C99 Restrict keyword and C++"
tags: [cpp, restrict]
comments: true
---
<!---
http://processors.wiki.ti.com/images/f/ff/Bartley%3DWiki_1.1%3DPerformance_Tuning_with_the_RESTRICT_Keyword.pdf
--->
Recently I came across a keyword I haven't seen before, the restrict keyword. As any decent programmer I googled it and found it really interesting. I also did what every programmer does when they learn something new, USE IT EVERYWHERE (and how this might have cost me a job!)!

In this post I will talk about the C99 keyword **restrict**, what problem is it solving, how to use it and more importantly should you use it in your code.

# The Problem : Pointer Aliasing

Pointer aliasing is when two pointers are pointing to the same data. For example:

```c++
int* ptrA = new int(5);
int* ptrB = ptrA;
```

So why is this a problem? Well it is not a problem if that is what you want. Problems arrive when you start involving the compiler in code you as a programmer know will not be aliased. Let us take a look at a little more involved example.

```c++
void foo(int * x, int * y, int * c) {
  *x += *c;
  *y += *c;
}
```

What we want to do is to add the value of `c` to the values of `x` and `y`, easy enough right? Let us assume that we know that there are no aliasing at all, that is `x`, `y` and `c` each points to unique memory locations. So with this knowledge let us take a look at what the compiler generates for us (using [gcc 7.2](https://gcc.gnu.org/onlinedocs/7.2.0/) with the [-O2 optimization flag](https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html) enabled).

```x86asm
foo(int*, int*, int*)
  // x is in rdi, y is in rsi, c is in rdx
  mov eax, DWORD PTR [rdx]
  add DWORD PTR [rdi], eax
  mov eax, DWORD PTR [rdx]
  add DWORD PTR [rsi], eax
  ret
```

Let us move through the assembly code in order to get a good grasp on the effects of aliasing.

* First we move the value of `c` into the registry `eax`.
* Add the value located in `eax` (value of `c`) to the value of `y`
* Move the value of `c` into the registry `eax`.
* Add the value located in `eax` (value of `c`) to the value of `x`

Do you notice the redundancy? We move the value of c into eax twice, even though it haven't changed at all, should it not be enough to only do it once? Well, yes but the compiler does not know this. For all it knows, `x`, `y`, `c` could all be pointing to the same data, so in order to handle that possibility it needs to update the value in `eax` since the first `add` operation could have updated the value of `c`.

When I saw this for the first time I thought "Just make `c` constant and the compiler should only load `c` once". So let us take a look at that case, making both the pointer AND the data `c` is pointing to constant.

```c++
void foo(int * x, int * y, const int * const c) {
  *x += *c;
  *y += *c;
}
```

```x86asm
foo(int*, int*, int const*)
  // x is in rdi, y is in rsi, c is in rdx
  mov eax, DWORD PTR [rdx]
  add DWORD PTR [rdi], eax
  mov eax, DWORD PTR [rdx]
  add DWORD PTR [rsi], eax
  ret
```

No change? Why? We still have potential pointer aliasing. So lets break it down a little.

The extra information given to the compiler is the following:
* The pointer `c` will not change
* The pointer `c` will not change the data it points to

From the compilers point of view, there can still be aliasing. If `x` and `c` are pointing to the same data, the contents of `c` will change with the first `add` operation. So in order to take this into consideration the compiler have to load the data from `c` into `eax` again.

# The Solution : C99 keyword restrict

The C99 standard (notice C not C++) introduced the keyword **restrict** in order to manage aliasing. When using the **restrict** keyword we promise the compiler the following:

* Within the scope of the declaration of pointer **P**, only **P** or expressions based on **P** will be used to access the object or subobject pointed to by **P**

So let us break the promise down in its key parts.

1. Within the scope of the declaration of pointer **P** ...

   Means that **P** is a pointer variable, all of the pointes below are valid pointers.  
```c++
p1;
s.p2;
p3[i];
p4->p5[];
```
2. only **P** or expressions based on **P** ...

   This refers to the pointer being accessed in the following way:  
```c++
*p1;
p2[i];
*(p3 +10*i +j + 3);
p4[i][j];
```

3. will be used to access ...

   Only stores and fetches are access, for example `P[i]` or `*P` is an access but `&P[i]` and `P+i` are not.

4. the object or subobject pointed to by **P**
   
   The object is self explanatory, and a subobject is part of another object (like an array). A small (contrived) example is in order:
   ```c++
   double p1[10] = {};
   double *p2;

   p2 = p1+5;
   
   for ( int i = 0; i < 5; i++ ) {
       *(p1+i) = i;
       *(p2+i) = i;
   }
   ```
   Here `p1` and `p2` does **NOT** point to the same subobject. The data accessed are unique. If for example we would initialize `p2` as `p2 = p1 + 4`, `p1` and `p2` would point to the same subobject (since both pointers would access element 4).

Now we know what we promise the compiler, but what happens if we break that promise? We get [undefined behavior](https://en.wikipedia.org/wiki/Undefined_behavior), so lets try and use **restrict** responsibly.

## Restrict, C++ and how to use it

So the **restrict** keyword is not part of the standard in C++, but is often implemented as a compiler specific keyword, using either **__restrict** or **__restrict__** syntax. So look up which compiler you are using and what flags are needed to enable this optimization.

**restrict** is a type qualifier which means it should be specified after the * like this
```c++
int * __restrict ptr;
```

## So what does it do?!

Let us take a look at the original example again, now with the introduced restrict keyword. Let us try somethings out and see if we have learned anything. So because `c` was loaded twice the compiler thought that `x` and `c` was aliased (pointing to the same memory location). That should mean that if either `x` or `c` (or both) is **restrict**ed the compiler should be able to generate more optimized code.
```c++
void foo(int * x, int * y, int * __restrict c) {
  *x += *c;
  *y += *c;
}
void foo(int * __restrict x, int * y, int * c) {
  *x += *c;
  *y += *c;
}
void foo(int * __restrict x, int * y, int *__restrict c) {
  *x += *c;
  *y += *c;
}
```
All three variants generate the following asembler code.
```x86asm
foo(int*, int*, int*):
// x is in rdi, y is in rsi, c is in rdx
  mov eax, DWORD PTR [rdx]
  add DWORD PTR [rdi], eax
  add DWORD PTR [rsi], eax
  ret
```