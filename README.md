## What is this?

A project written in Vanilla Javascript to simulate a Seesaw. It may look simple but how you do things
might say a lot about you and your experience with Javascript.

## Limitations

- No libraries
- No frameworks
- No CSS preprocessors
- No build tools
- No bundlers
- No canvas

## My thinking process & trade-offs

My original idea was to use canvas but since it wasn't allowed I had to use DOM

I took a different approach than the reference solution, transform was also applied to preview weight

That arose some issues with how you drag the weight, I had to make the area bigger.

I also added a ruler to show the distance to the pivot

I only used one sound effect

Without using canvas, implementing a pause button seems off because we don't have a render loop or anything like that so dealing with animations and interactions is a bit complicated and antipatterny

The reference solution wasn't responsive as it was designed for desktop and so mine isn't either i have a min-width set to one of the containers

Wasn't asked to make it responsive, so I didn't, could use media queries or something like that

I was asked to persist the state of the app so I used localStorage and properly serialize & parse the data

Data was manually checked with if statements, I could have used something like `zod` if libs were allowed

Initially, I had an `immediate approch` in calculating the torque and weight values

// Before

```js
computeAndUpdate() {
    for (const w of this.weights) {
        // left
        if (w.side == -1) {
            /* the formula : torque = weight * distance */
            left_torque += w.weight * w.distance * w.side;
            left_weight += w.weight;
        }
        //   right
        else {
            /* the formula : torque = weight * distance */
            right_torque += w.weight * w.distance * w.side;
            right_weight += w.weight;
        }
    }
}

```

But I didn't want to loop through the weights array every time I needed to update the UI so a `retained approch` worked better

// After

```js

  computeAndUpdate(w) {
    // left
    if (w.side == -1) {
      /* the formula : torque = weight * distance */
      this.left_torque += w.weight * w.distance * w.side;
      this.left_weight += w.weight;
    }
    //   right
    else {
      /* the formula : torque = weight * distance */
      this.right_torque += w.weight * w.distance * w.side;
      this.right_weight += w.weight;
    }
  }
```

But `retained approach` has its own issues, it's more error prone and harder to debug

If i was using a framework and the calculation wasn't expensive, i would have used the `immediate approach`

### Did i use AI ?

I used AI to get this emoji 🪨 and colors

```js
const COLORS = [
  '#4ade80',
  '#facc15',
  '#22d3ee',
  '#f472b6',
  '#818cf8',
  '#fb923c',
];
```

### I hope we work together in the future

### Thanks for reading
