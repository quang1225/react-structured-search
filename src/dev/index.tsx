import React from "react";
import ReactDOM from "react-dom/client";
import StructuredSearch from "../components/StructuredSearch";
import { DEFAULT_QUERY_FILTER_KEY, mockFilters } from "./mock";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <StructuredSearch
        filters={mockFilters()}
        width="50%"
        dropdownStyle={{ maxWidth: 400 }}
        onSubmit={(rs) => console.log("Search result:", rs)}
        defaultFilterKey={DEFAULT_QUERY_FILTER_KEY}
      />
    </div>
  </React.StrictMode>,
);
