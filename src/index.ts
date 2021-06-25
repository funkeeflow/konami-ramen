type KeyPattern = Array<String>;

class Easteregg {
  callback: Function;
  pattern: KeyPattern = [];
  validator: Iterator<boolean, boolean, string>
  timer: number;
  /**
   *
   */
  constructor(pattern: KeyPattern, hook?: Function) {
    if (hook) this.callback = hook;
    if (pattern) this.pattern = pattern;
  }

  private *validatePattern(pattern: Array<String>): Iterator<boolean, boolean, string> {
    let position = 0;
    let check = false;
    // console.log("validator started")
    while (position < pattern.length) {
      // console.log("position", position, 'keystroke to hit:',  pattern[position])
      const keyStroke = yield check;
      // console.log("get keystroke", keyStroke)
      check = pattern[position] === keyStroke;
      // console.log("check keystroke", check)
      if(!check){
        position = 0
      } else{
        position++;
      }
    }
    return check;
  }

  private startValidator(): void {
    this.validator = this.validatePattern(this.pattern);
    this.validator.next();
  }

  /**
   *
   * @param event
   */
  private handleOnKeyDown(event: KeyboardEvent): void {
    const { value, done } = this.validator.next(event.key);
    if (done && value) {
        console.log("got it 🎉")
        if(this.callback) this.callback();
        this.startValidator();
    }
  }

  /**
   *
   */
  private addListeners(): void {
    if (typeof window !== 'undefined' && window.document) {
      document.addEventListener('keyup', this.handleOnKeyDown.bind(this))
    }
  }

  private removeListeners(): void {
    if (typeof window !== 'undefined' && window.document) {
      document.removeEventListener('keyup', this.handleOnKeyDown)
    }
  }

  /**
   *
   */
  start(): void{
    this.addListeners();
    this.startValidator();
  }

  /**
   * @param func: callback function
   */
  addHook(func: Function): void {
    this.callback = func;
  }

  cleanUp(): void {
    this.removeListeners();
  }
}

export default Easteregg;