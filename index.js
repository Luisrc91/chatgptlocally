import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

const $ = (el) => document.querySelector(el);

const $form = $("form");
const $input = $("input");
const $template = $("#message-template");
const $message = $("ul");
const $container = $("main");
const $button = $("button");
const $info = $("small");

let messages = [];

const SELECTED_MODEL = "gemma-2b-it-q4f32_1-MLC";
const engine = await CreateMLCEngine(SELECTED_MODEL, {
  initProgressCallback: (info) => {
    console.log("initProgressCallback", info);
    $info.textContent = `${info.text}%`;
    if (info.progress == 1) {
      $button.removeAttribute("disabled");
    }
  },
});

$form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const messageText = $input.value.trim();

  if (messageText !== "") {
    $input.value = "";
  }

  addMessage(messageText, "user");
  $button.setAttribute("disabled", "");
  const userMessage = {
    role: "user",
    content: messageText,
  };
  messages.push(userMessage);

  const chunks = await engine.chat.completions.create({
    messages,
    stream: true,
  });
  let reply = "";

  const $botMessage = addMessage("", "bot");

  for await (const chunk of chunks) {
    const choice = chunk.choices[0];
    const content = choice?.delta?.content ?? "";
    reply += content;
    $botMessage.textContent = reply;
    // console.log(chunk.choices)
  }
  $button.removeAttribute("disabled");

  messages.push({
    role: "assistant",
    content: reply,
  });
});
// console.log(chunk.choices)

//   console.log(reply.choices[0].message)
// const botMessage = reply.choices[0].message
//   const botMessage = reply.choices[0].message;
//   messages.push(botMessage);
//   addMessage(botMessage.content, "bot");
//   setTimeout(() => {
//     addMessage("Hello, How are your?", "bot");
//     $button.removeAttribute("disabled");
//   }, 200);

function addMessage(text, sender) {
  const clonedTemplate = $template.content.cloneNode(true);
  const $newMessage = clonedTemplate.querySelector(".message");

  const $who = $newMessage.querySelector("span");
  const $text = $newMessage.querySelector("p");

  $text.textContent = text;
  $who.textContent = sender === "bot" ? "GPT" : "Me";
  $newMessage.classList.add(sender);

  $message.appendChild($newMessage);
  $container.scrollTop = $container.scrollHeight;

  return $text;
}
