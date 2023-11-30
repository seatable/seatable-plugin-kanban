export const generatorBase64Code = (keyLength = 4) => {
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < keyLength; i++) {
    key += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return key;
};

export const generatorBoardId = (boards) => {
  let board_id, isUnique = false;
  while (!isUnique) {
    board_id = generatorBase64Code(4);

    // eslint-disable-next-line
    isUnique = boards.every(item => {return item._id !== board_id;});
    if (isUnique) {
      break;
    }
  }
  return board_id;
};

export const generateOptionID = (options) => {
  if (options.length === 1) return '' + Math.floor(Math.random() * Math.pow(10, 6));
  let optionID;
  let isIDUnique = false;
  while (!isIDUnique) {
    optionID =  '' + Math.floor(Math.random() * Math.pow(10, 6));

    // eslint-disable-next-line
    isIDUnique = options.every((option) => {
      return option.id !== optionID;
    });
    if (isIDUnique) {
      break;
    }
  }
  return optionID;
};

export const getDtableUuid = () => {
  return window.dtable.dtableUuid;
};

export const getMediaUrl = () => {
  return window.dtable.mediaUrl;
};

export const getValueFromPluginConfig = (attribute) => {
  return window.dtable[attribute];
};

export const isValidEmail = (email) => {
  const reg = /^[A-Za-zd]+([-_.][A-Za-zd]+)*@([A-Za-zd]+[-.])+[A-Za-zd]{2,6}$/;
  return reg.test(email);
};

export const getEventClassName = (e) => {
  // svg mouseEvent event.target.className is an object
  if (!e || !e.target) return '';
  return e.target.getAttribute('class') || '';
};
