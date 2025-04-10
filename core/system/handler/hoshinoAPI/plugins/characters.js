const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const router = express.Router();

function getFilePath(route) {
  const directoryPath = path.join(__dirname, 'conversations', route);
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
  return path.join(directoryPath, `${route}_Data.json`);
}

function loadConversations(route) {
  const filePath = getFilePath(route);
  try {
    if (!fs.existsSync(filePath)) {
      return {};
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function saveConversations(route, data) {
  const filePath = getFilePath(route);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function handleRoute(req, res, botId, route) {
  const userId = req.query.userid || 'defaultUser';
  const userQuery = req.query.q;

  if (!userQuery) {
    return res.status(400).json({ error: "Missing query parameter 'q'." });
  }

  const conversations = loadConversations(route);
  const userConversation = conversations[userId] || [];

  try {
    userConversation.push({ turn: 'user', message: userQuery });

    const data = JSON.stringify({
      context: userConversation.map(conv => ({
        message: conv.message,
        turn: conv.turn,
        media_id: conv.media_id || null
      })),
      strapi_bot_id: botId,
      output_audio: false,
      enable_proactive_photos: true
    });

    const config = {
      method: 'POST',
      url: 'https://api.exh.ai/chatbot/v4/botify/response',
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/json',
        'x-auth-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMGRkYzY3NS01NmU3LTQ3ZGItYmJkOS01YWVjM2Q3OWI2YjMiLCJmaXJlYmFzZV91c2VyX2lkIjoiSGU5azFzMnE3clZJZlJhUU9BU042NzFneFFVMiIsImRldmljZV9pZCI6bnVsbCwidXNlci craftingI6IkhlOWsxczJxN3JWSWZSYVFPQVNONjcxZ3hRVTIiLCJhY2Nlc3NfbGV2ZWwiOiJiYXNpYyIsInBsYXRmb3JtIjoid2ViIiwiZXhwIjoxNzM3MTY5NjY2fQ.S-fPM-PsWKeTOoxX8kNZhPtdV7AHxNuMNc9ViOgnuK0',
        'authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6ImJvdGlmeS13ZWItdjMifQ.O-w89I5aX2OE_i4k6jdHZJEDWECSUfOb1lr9UdVH4oTPMkFGUNm9BNzoQjcXOu8NEiIXq64-481hnenHdUrXfg',
      },
      data
    };

    const response = await axios.request(config);
    const botMessage = response.data.responses[0].response;

    userConversation.push({ turn: 'bot', message: botMessage });
    conversations[userId] = userConversation;
    saveConversations(route, conversations);

    res.json({
      message: botMessage,
      author: "Francis Loyd Raval"
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || "An error occurred"
    });
  }
}

router.get('/wednesday', (req, res) => {
  handleRoute(req, res, "229115", "wednesday");
});

router.get('/karai', (req, res) => {
  handleRoute(req, res, "268799", "karai");
});

router.get('/martin', (req, res) => {
  handleRoute(req, res, "286682", "martin");
});

router.get("/harley", (req, res) => {
  handleRoute(req, res, "268789", "harley");
});

router.get("/kioto", (req, res) => {
  handleRoute(req, res, "1364119", "kioto");
});

router.get("/ivan", (req, res) => {
  handleRoute(req, res, "1816847", "ivan");
});

router.get("/marko", (req, res) => {
  handleRoute(req, res, "454833", "marko");
});

router.get("/kurousagi", (req, res) => {
  handleRoute(req, res, "268782", "kurousagi");
});

router.get("/sanemi", (req, res) => {
  handleRoute(req, res, "235858", "sanemi");
});

router.get("/dazai", (req, res) => {
  handleRoute(req, res, "897042", "dazai");
});

router.get("/sukuna", (req, res) => {
  handleRoute(req, res, "345747", "sukuna");
});

router.get("/yuji", (req, res) => {
  handleRoute(req, res, "505771", "yuji");
})

module.exports = router;