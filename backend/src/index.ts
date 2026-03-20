import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, "../data/funds_data.json");

app.use(cors());
app.use(express.json());

// Helper
const readFunds = (): any[] => JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
const writeFunds = (data: any[]) =>
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

// GET all funds
app.get("/api/funds", (req: Request, res: Response) => {
  res.json(readFunds());
});

// GET single fund by index
app.get("/api/funds/:index", (req: Request, res: Response) => {
  const funds = readFunds();
  const fund = funds[Number(req.params.index)];
  if (!fund) {
    res.status(404).json({ error: "Not found" });
  } else {
    res.json({ ...fund, index: Number(req.params.index) });
  }
});

// PUT update fund
app.put("/api/funds/:index", (req: Request, res: Response) => {
  const funds = readFunds();
  const idx = Number(req.params.index);
  if (!funds[idx]) {
    res.status(404).json({ error: "Not found" });
  } else {
    funds[idx] = { ...funds[idx], ...req.body };
    writeFunds(funds);
    res.json(funds[idx]);
  }
});

// DELETE fund
app.delete("/api/funds/:index", (req: Request, res: Response) => {
  const funds = readFunds();
  const idx = Number(req.params.index);
  if (!funds[idx]) {
    res.status(404).json({ error: "Not found" });
  } else {
    funds.splice(idx, 1);
    writeFunds(funds);
    res.json({ success: true });
  }
});

app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`),
);
