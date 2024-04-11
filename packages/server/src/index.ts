import express from "express";
import cors from "cors"; // Import cors

// get methods
import statusRoute from "./get/statusRoute";

// post methods
import requestKYC_Route from "./post/requestKYC_Route";
import submitVoteRoute from "./post/submitVoteRoute";

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for all routes
// You can also customize CORS options if needed
app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("/zk-kyc api status nominal");
});

app.use(statusRoute);
app.use(requestKYC_Route);
app.use(submitVoteRoute);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
