// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// =========  Endpoints  =========

// 1️⃣ Get the current grid layout (ordered)
app.get("/api/grid", async (req, res) => {
  try {
    const grid = await prisma.gridLayout.findMany({
      include: { post: true },
      orderBy: { position: "asc" },
    });
    res.json(grid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2️⃣ Update (or insert) a post’s position in the grid
app.post("/api/grid/update", async (req, res) => {
  const { postId, position } = req.body;
  try {
    const updated = await prisma.gridLayout.upsert({
      where: { postId },
      update: { position },
      create: { postId, position },
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3️⃣ Get unorganized posts (those not in the grid)
app.get("/api/posts/unorganized", async (req, res) => {
  try {
    const used = await prisma.gridLayout.findMany({ select: { postId: true } });
    const usedIds = used.map((u) => u.postId);
    const posts = await prisma.post.findMany({
      where: { id: { notIn: usedIds } },
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4️⃣ Upload a new post record (expects an already-uploaded image URL)
app.post("/api/posts/upload", async (req, res) => {
  const { imageUrl, caption, hashtags } = req.body;
  try {
    const post = await prisma.post.create({
      data: { imageUrl, caption, hashtags },
    });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// =========  Start server  =========
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
