/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, PORT } = process.env;

const conversationState = {};

app.post("/webhook", async (req, res) => {
  // log incoming messages
  console.log("CubotWp app message:", JSON.stringify(req.body, null, 2));

  // check if the webhook request contains a message
  // details on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];

  // check if the incoming message contains text
  if (message?.text.body === "imagen") {
    // extract the business number to send the reply from it
    const business_phone_number_id =
      req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

    try {
      // send a reply message as per the docs here https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
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
          type: "image",
          image: {
            link: "https://cdn.glitch.global/a3dbe63d-c9a5-4497-951e-fb1bcb91c0dd/portada_cubotwp.jpeg?v=1722815022795", // reemplaza con la URL de la imagen
            caption: "Img cubotwp test", // reemplaza con el texto de la leyenda
          },
          context: {
            message_id: message.id, // shows the message as a reply to the original user message
          },
        },
      });
    } catch (error) {
      console.error("Error al enviar imagen:", error.message);
    }
  } else if (message?.text.body === "flow") {
    // extract the business number to send the reply from it
    const business_phone_number_id =
      req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

    try {
      // send a reply message as per the docs here https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
      await axios({
        method: "POST",
        url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
        headers: {
          Authorization: `Bearer ${GRAPH_API_TOKEN}`,
        },
        data: {
          recipient_type: "individual",
          messaging_product: "whatsapp",
          to: message.from,
          type: "interactive",
          interactive: {
            type: "flow",
            header: {
              type: "text",
              text: "Flow message header"
            },
            body: {
              text: "Flow message body"
            },
            footer: {
              text: "Flow message footer"
            },
            action: {
              name: "flow",
              parameters: {
                flow_message_version: "3",
                flow_token: "AQAAAAACS5FpgQ_cAAAAAD0QI3s.",
                flow_id: "1",
                flow_cta: "Book!",
                flow_action: "navigate",
                flow_action_payload: {
                  screen: "",
                  data: { 
                    product_name: "name",
                    product_description: "description",
                    product_price: 100
                  }
                }
              }
            }
          }
        },
      });
    } catch (error) {
      console.error("Error al enviar flow:", error.message);
    }
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
