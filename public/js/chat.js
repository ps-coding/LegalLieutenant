const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('userInput');

chatForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const userMessage = userInput.value;
    userInput.value = '';

    appendMessage('user', userMessage);

    const response = await fetch('/ask-chatbot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            documentId: '<%= documentId %>',
            documentTitle: '<%= documentTitle %>',
            documentContent: '<%= documentContent %>',
            formName: '<%= formName %>',
            question: userMessage
        })
    });
    const data = await response.json();

    appendMessage('chatbot', data.answer);
});

function appendMessage(sender, message) {
    const messageElem = document.createElement('div');
    messageElem.classList.add('message', sender);
    messageElem.textContent = message;
    chatLog.appendChild(messageElem);
    chatLog.scrollTop = chatLog.scrollHeight;
}