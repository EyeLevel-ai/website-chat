window.chat.text = function(data) {
  return escapeString(data);
}

window.chat.button = function(data) {
  return `<button class="chat-button" onclick="window.chat.sendButton(this, '${data.intent}')">${data.label}</button>`;
}

window.chat.buttons = function(data) {
  var html = '';
  for (var i in data) {
    html += window.chat.button(data[i]);
  }
  return html;
}
window.chat.sendButton = function(e, intent) {
  e.parentElement.parentElement.removeChild(e.parentElement);
  console.log(intent);
}
