import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import { startDatabase } from "./database/dexie";

const database = startDatabase({ database_name: "kderno" });

ReactDOM.render(<App database={database} />, document.getElementById("root"));
