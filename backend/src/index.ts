import express, { Request, Response } from "express"; // Import Express and API tpyes
import fs from "fs"; // Import file system module for reading/writing JSON data
import path from "path"; // Import fil epath module for handling file paths
import cors from "cors"; // Import cross origin resource sharing middleware

const app = express(); // Start the express application
const port = process.env.PORT || 3000; // Define port to be PORT or fallback to 3000
const DATA_PATH = path.join(__dirname, "../data/funds_data.json"); // Define path to JSON file

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies in requests

// Helper
const readFunds = (): any[] => JSON.parse(fs.readFileSync(DATA_PATH, "utf-8")); // Helper to read funds data from JSON file
const writeFunds = (data: any[]) =>
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2)); // Helper to write funds data to JSON file

// GET all funds reads full array from disk and sends it as JSON response. Automatically converts to JSON and sets content-type header
app.get("/api/funds", (req: Request, res: Response) => {
  res.json(readFunds());
});

// GET single fund by index
app.get("/api/funds/:index", (req: Request, res: Response) => { // :index is route parameter that can be accessed via req.params.index
  const funds = readFunds();
  const fund = funds[Number(req.params.index)]; // Conversion to number since route parameters are strings by default
  if (!fund) { // Catches out of bounds access and returns 404 if fund doesn't exist at given index
    res.status(404).json({ error: "Not found" });
  } else {
    res.json({ ...fund, index: Number(req.params.index) }); // Spreads all fund fields and adds index field to response for easier client-side handling
  }
});

// PUT update fund
app.put("/api/funds/:index", (req: Request, res: Response) => {
  const funds = readFunds();
  const idx = Number(req.params.index); // Convert index from route parameter to number
  if (!funds[idx]) { // Check if fund exists at given index, return 404 if not found
    res.status(404).json({ error: "Not found" });
  } else {
    funds[idx] = { ...funds[idx], ...req.body }; // Spreads existing fund data and overwrites with any fields provided in request body, allowing for partial updates
    writeFunds(funds); // Write updated funds array back to JSON file
    res.json(funds[idx]); // Return the updated fund as JSON response
  }
});

// DELETE fund
app.delete("/api/funds/:index", (req: Request, res: Response) => {
  const funds = readFunds();
  const idx = Number(req.params.index);
  if (!funds[idx]) {
    res.status(404).json({ error: "Not found" });
  } else {
    funds.splice(idx, 1); // Removes exactly 1 element at position idx and shifts everything after it left, effectively deleting the fund at that index
    writeFunds(funds); // Write updated funds array back to JSON file
    res.json({ success: true }); // Return success message as JSON response
  }
});

app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`),
); // Starts HTTP server and listens on defined port, logging a message to console when server is ready
