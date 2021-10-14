export const konamiCode = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
];

/**
 * Sequence should be composed of KeyboardEvent.key values
 * See the full list here:
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
 */
export type Sequence = Array<string>;

/**
 * Options to be passed to the constructor
 */
export interface KonamiRamenOptions {
  /**
   * Optional timeout value in ms, default is 800ms
   */
  timeout?: number,
  /**
   * Optional sequence, default is the konami code sequence
   */
  sequence?: Sequence,
};

/**
 * Name: konami-ramen
 * Author: Florian Berg (@funkeeflow)
 * Licence: MIT
 *
 * A class to listen to keyboard input events and match them against a set KeyboardEvent key values.
 *
 */
class KonamiRamen {

  private sequence: Sequence;
  private validator: Iterator<any, any, any>
  private timeout: number;
  private listeners: any = {};
  /**
   * You can pass in a custom timeout value or a custom pattern
   * @param {KonamiRamenOptions}
   */
  constructor(options: KonamiRamenOptions = {}) {
    const { timeout = 800, sequence = konamiCode } = options;
    if (timeout) this.timeout = timeout;
    if (sequence) this.sequence = sequence;
  }

  /**
   * This generator function will match the input key step by step against the sequence.
   * A timeout is set for each validation step. If the timeout exceeds, the validation will be reset
   * to the first position in the sequence.
   *
   * @param {sequence}
   * @returns {Iterator<any, any, any>}
   */
  private *sequenceValidator(sequence: Sequence): Iterator<any, any, any> {
    /* setTimeout reference */
    let timer: number;
    /* current position in the sequence */
    let position = 0;
    /* hold the last match state */
    let match = false;
    /* We will step through the sequence here */
    while (sequence.length > position) {
      /* we pass in the keyboard event and a callback function to be called by our timeout. */
      /* Note: position output is -1 if we did not have a match */
      const { event, callback } = yield { match, position: position - 1 };
      /* first we clear any existing timeout */
      clearTimeout(timer)
      /* and set a new one right after. If this exceeds, we will call our passed in callback */
      timer = setTimeout(() => { position = 0; if (callback) callback() }, this.timeout);
      /* lets validate the current event against the postion in the sequence here */
      match = this.validate(sequence[position], event);
      /* if we have a match, we advance the position pointer, if not, we start from the begining */
      if (match) { position++ } else { position = 0 };
    }
    /* if the we stepped through, or the function returns, we clear any existing timeout */
    clearTimeout(timer);
    /* and return our latest match state and the position.  */
    /* Note: position output is -1 if we did not have a match */
    return { match, position: position - 1 };
  }

  /**
   * Validation function. This will validate if the current key is matched with the input
   * @param key
   * @param event
   * @returns
   */
  private validate(key: string, event: KeyboardEvent): boolean {
    return key === event.key;
  }

  /** Starts the validation and emits the associated event */
  private startValidator(): void {
    this.validator = this.sequenceValidator(this.sequence);
    this.validator.next();
    this.emitEvent('start', { position: 0 })
  }

  /** Stop the validation and emits the associated event */
  private stopValidator(): void {
    this.validator.return();
    this.emitEvent('stop')
  }

  /**
   * @param event
   */
  private handleOnKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Shift' || event.key === 'Alt') return;

    const { value: { match, position }, done } =
      this.validator.next({
        event,
        callback: () => {
          this.emitEvent('timeout', {
            lastKey: event.key, lastPosition: position, lastMatch: match
          })
        }
      });
    this.emitEvent("input", {
      key: event.key, match, position, keyboardEvent: event
    })
    if (done && match) {
      this.emitEvent("success", {
        lastKey: event.key, lastPosition: position
      })
      this.startValidator();
    }
  }

  /** */
  private addListeners(): void {
    if (typeof window !== 'undefined' && window.document) {
      document.addEventListener('keydown', this.handleOnKeyDown)
    }
  }

  /**
   *
   */
  private removeListeners(): void {
    if (typeof window !== 'undefined' && window.document) {
      document.removeEventListener('keydown', this.handleOnKeyDown)
    }
  }

  /**
   *
   * @param type
   * @param event
   */
  private emitEvent(type: string, event?: any): void {
    if (this.listeners[type]) this.listeners[type](event)
  }

  /**
   * Depracated: will be removed soon.
   */
  start(): void {
    this.listen();
  }

  /**
   *
   */
  listen(): void {
    this.addListeners();
    this.startValidator();
  }

  /**
   *
   */
  stop(): void {
    this.stopValidator()
    this.removeListeners();
  }

  /**
   *
   * @param func
   */
  on(type: string, func: Function): void {
    if (func) this.listeners[type] = func;
  }

  /**
   *
   * @param type
   */
  off(type: string) {
    delete this.listeners[type];
  }

  /**
   *
   * @param time
   */
  setTimeout(time: number): void {
    if (time) this.timeout = time;
  }

  /**
   *
   * @param sequence
   */
  setsequence(sequence: Array<string>) {
    if (sequence) this.sequence = sequence;
  }
}

export default KonamiRamen;