export default class Card {

  constructor(object = {}) {
    this.id = object.id;
    this.row = object.row || {};
  }
}
