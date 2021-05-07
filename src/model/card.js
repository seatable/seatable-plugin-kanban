export default class Card {

  constructor(object = {}) {
    this.id = object.id;
    this.name = object.name || '';
    this.row = object.row || {};
  }
}