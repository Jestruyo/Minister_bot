import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, PORT } = process.env;


app.post("/webhook", async (req, res) => {
  // log incoming messages
  console.log("CubotWp app message:", JSON.stringify(req.body, null, 2));

  // check if the webhook request contains a message
  const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
  const business_phone_number_id = req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

  // Mapeo de respuestas
  const responses = {
    informe: {
      body: "*¡Hola! Espero que hayas tenido un excelente mes de servicio. 😊🙏🏻*\n\n*Marca segun lo requieras:\n1️⃣ Si eres publicador,\n2️⃣ Si eres precursor.",
    },
    bien: {
      body: "¿Cuál es tu nombre?",
    },
    default: (nombre) => ({
      body: `¡Hola ${nombre}! ¿En qué puedo ayudarte?`,
    }),
  };

  if (message && message.text) {
    const text = message.text.body.toLowerCase();
    const response = responses[text] || responses.default(text);
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
      },
      data: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: message.from,
        type: "text",
        text: response,
      },
    });
  }

  res.sendStatus(200);
});

// accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // check the mode and token sent are correct
  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    // respond with 200 OK and challenge token from the request
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    // respond with '403 Forbidden' if verify tokens do not match
    res.sendStatus(403);
  }
});

app.get("/", (req, res) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
