const BoardsHelpers = {
  insertBoard: (boards, {board_index, new_board}) => {
    let newBoards = [...boards];
    newBoards.splice(board_index, 0, new_board);
    return newBoards;
  },
  renameBoard: (boards, {board_index, new_name}) => {
    let newBoards = [...boards];
    let updateBoard = newBoards[board_index];
    updateBoard = Object.assign(updateBoard, {name: new_name});
    newBoards[board_index] = updateBoard;
    return newBoards;
  },
  updateBoard: (boards, {board_index, new_board}) => {
    let newBoards = [...boards];
    newBoards[board_index] = new_board;
    return newBoards;
  },
  deleteBoard: (boards, {board_index}) => {
    let newBoards = [...boards];
    newBoards.splice(board_index, 1);
    return newBoards;
  }
};

export default BoardsHelpers;
