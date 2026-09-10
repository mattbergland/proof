/* eslint-disable @typescript-eslint/no-require-imports */
const http = require("http");
const WebSocket = require("next/dist/compiled/ws");

function request(method, path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: "localhost", port: 29229, path, method },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(JSON.parse(body)));
      },
    );
    req.on("error", reject);
    req.end();
  });
}

async function main() {
  const targets = await request("GET", "/json/list");
  const target = targets.find(
    (item) => item.type === "page" && item.url.includes("localhost:3000"),
  );
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  socket.on("message", (raw) => {
    const message = JSON.parse(raw.toString());
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  });
  await new Promise((resolve) => socket.once("open", resolve));
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const messageId = ++id;
      pending.set(messageId, resolve);
      socket.send(JSON.stringify({ id: messageId, method, params }));
    });
  const evaluate = async (expression, returnByValue = true) => {
    const result = await send("Runtime.evaluate", {
      expression,
      returnByValue,
      awaitPromise: true,
    });
    return result.result.result?.value;
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", {
    url: "http://localhost:3000/c/fieldline-customer-win",
  });
  await new Promise((resolve) => setTimeout(resolve, 700));
  await evaluate(
    `[...document.querySelectorAll("button")].find((button) => button.textContent.includes("Start"))?.click()`,
  );
  await new Promise((resolve) => setTimeout(resolve, 100));

  const labels = [
    "I wanted one reliable place for our deployment and incident data.",
    "Before this, the team relied on spreadsheets and scattered Slack threads.",
    "Now our weekly planning starts from a shared, current view.",
    "6",
    "I would recommend Fieldline to any team scaling its operations.",
  ];
  for (let index = 0; index < labels.length; index += 1) {
    const text = labels[index];
    await evaluate(`(() => {
      const field = document.querySelector("textarea, input");
      const prototype = field instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, "value").set;
      setter.call(field, ${JSON.stringify(text)});
      field.dispatchEvent(new Event("input", { bubbles: true }));
      if (${index} === 2) {
        [...document.querySelectorAll("button")]
          .find((button) => button.textContent.includes("Continue"))?.click();
      } else {
        field.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      }
    })()`);
    await new Promise((resolve) => setTimeout(resolve, 150));
    console.log(
      `after q${index + 1}:`,
      await evaluate("document.body.innerText.match(/\\d+ of \\d+/)?.[0]"),
    );
  }
  await evaluate(
    `[...document.querySelectorAll("button")].find((button) => button.textContent.includes("Publicly with my name"))?.click()`,
  );
  await new Promise((resolve) => setTimeout(resolve, 100));
  await evaluate(
    `[...document.querySelectorAll("button")].find((button) => button.textContent.includes("Send response"))?.click()`,
  );
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("final:", await evaluate("document.body.innerText"));
  socket.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
