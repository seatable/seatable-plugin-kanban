export default class List {

  constructor(object = {}) {
    this.name = object.name || null;
    this.cards = object.cards || [];
  }
}
