# konami-ramen 🍜

A highly sophisticated **easter egg** library with zero dependancies and lots of customizations. Its written in Typescript with all ES6+ goodness there is. By default it will listen for the famouse [*Konami Code*](https://en.wikipedia.org/wiki/Konami_Code) (`↑` `↑` `↓` `↓` `←` `→` `←` `→` `a` `b`).

## Installation

```sh
npm install konami-ramen
```
## Usage

```js
import Konami from 'konami-ramen';

const konami = new Konami();
konami.start();

konami.on('success',()=>{
  console.log("Mmmmh ... tasty ramen, i like!")
})

```

 [**Have some ramen and check out the demo** 🍜 ][link-demo]

## Custom Pattern
You can pass in your own sequence like so:
```js
new Konami({ pattern: ['r','a','m','e','n'] });
```
## Timeout
You can define the max. time between two key strokes, to make it event harder to succeed. The default time is set to `600ms`. Going below `200ms` makes it almost impossible to hit the pattern in the right order and time.
```js
new Konami({ timeout: 450 }); // time in ms
```
*Note:* If the between to keystrokes the max time is exceeded, the pattern will start from the begining.

## Events
There are a couple of events, you can listen to, like so:
```js
/* press ⬆️ */
konami.on('input', (event) => {
  /* { key: 'ArrowUp', match: true, position: 0, { native KeyboardEvent } } */
  /* your magic goes here */
})
```

Removing them is quite easy:
```js
konami.off('input')
```

Here is a list of all events:

| Event | Event Object                                                                            |
|-------|-----------------------------------------------------------------------------------------|
| *start*| { position: `number` }                                                                    |
| *stop*  | `undefined`                                                                               |
| *input* | { key: `string`, match: `boolean`, position: `number`, keyboardEvent: `KeyboardEvent `} |
| *success* | { lastKey: `string`, lastPosition: `number` }                                                                                        |
| *timeout* | { lastKey: `sting`, lastPosition: `number`, lastMatch: `boolean` }                                                                                         |

**key** \
The `key` property holds the current key pressed by the user.

**postion** \
The `position` property holds the current position in the pattern. If the current button is not matched with the pattern, `position` will be `-1` instead.

**lastPosition** \
The `lastPosition` property holds last position if the pattern has been successfuly finished.

**lastKey** \
The `lastKey` property holds last key if the pattern has been successfuly finished.

**match** \
The `match` property holds the matching state of the most recent input.

**lastMatch** \
The `lastMatch` property holds the matching state of the most recent input, **after a timeout occured**.

**keyboardEvent** \
The `keyboardEvent` is the native keyboard event for the `keydown` event.

[link-demo]: https://
