export default class Board {

  constructor(object = {}) {
    this._id = object._id;
    this.name = object.name || '';
    this.lists = object.list || [];
  }
}
