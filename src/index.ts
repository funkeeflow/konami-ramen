export default class KonamiRamen {
  pattern: Array<String> = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  validator: Iterator<boolean, any, any>
  timeout: number = 300;
  enableSound: boolean = true;
  listeners: any = {};
  /**
   *
   */
  constructor(pattern?: Array<String>, timeout?: number) {
    if (pattern) this.pattern = pattern;
    if (timeout) this.timeout = timeout;
  }

  /**
   *
   * @param pattern
   * @returns
   */
  private *patternValidator(pattern: Array<String>): Generator<any, any, any> {
    let timer: number;
    let position = 0;
    let match = false;
    while (pattern.length > position) {
      const { key, callback } = yield { match, position: position - 1 };
      clearTimeout(timer)
      timer = setTimeout(() => { position = 0; callback() }, this.timeout);
      match = pattern[position] === key;
      if (match) { position++ } else { position = 0 };
    }
    clearTimeout(timer);
    return { match, position: position - 1 };
  }

  /**
   *
   */
  private startValidator(): void {
    this.validator = this.patternValidator(this.pattern);
    this.validator.next();
    this.emitEvent('start', { position: 0 })
  }

  /**
   *
   */
  private stopValidator(): void {
    this.validator.return();
    this.emitEvent('stop')
  }

  private emitEvent(type: string, event?: any): void {
    if (this.listeners[type]) this.listeners[type](event)
  }

  /**
   *
   * @param event
   */
  private handleOnKeyDown = (event: KeyboardEvent): void => {
    const { value: { match, position }, done } =
      this.validator.next({
        key: event.key,
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
      this.handleOnSuccess()
    }
  }

  private handleOnSuccess(): void {
    this.startValidator();
  }

  /**
   *
   */
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
   */
  start(): void {
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
  of(type: string) {
    delete this.listeners[type];
  }

  /**
   *
   * @param time
   */
  setTimeout(time: number): void {
    if (time) this.timeout = time;
  }
}