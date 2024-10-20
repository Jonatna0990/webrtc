const ACTIONS = {

  //префикс S_ - команды с сервера
  GET_USER_ID: 'get-user-id',
  GET_USER_ROOMS: 'get-user-rooms',
  USER_LOGOUT: 'user-logout',


  CREATE_ROOM: 'create-room',
  DELETE_ROOM: 'delete-room',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  SHARE_ROOMS: 'share-rooms',


  ADD_PEER: 'add-peer',
  REMOVE_PEER: 'remove-peer',
  RELAY_SDP: 'relay-sdp',
  RELAY_ICE: 'relay-ice',
  ICE_CANDIDATE: 'ice-candidate',
  SESSION_DESCRIPTION: 'session-description',

  UPDATE_MEMBERS: 'update-members',//обновление списка участников

  S_NEED_OFFER: 'need-offer', //необходимость создать оффер клиенту
  S_GET_OFFER: 'get-offer', //отправка офера клиентам
  SEND_OFFER: 'send-offer',//получение офера сервером

  S_NEED_ANSWER: 'need-answer',//необходимость создать ответ клиенту
  S_GET_ANSWER: 'get-answer',//отправка ответа клиентам
  SEND_ANSWER: 'send-answer',//получение ответа сервером

  S_GET_ICE_CANDIDATE: 'get-ice-candidate',//отправка кандидата клиентам
  SEND_ICE_CANDIDATE: 'send-ice-candidate',//получение кандидата сервером

  ERROR: 'error',
  TEST: 'test'
};

export default ACTIONS;