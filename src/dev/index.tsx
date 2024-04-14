import React from "react";
import ReactDOM from "react-dom/client";
import StructuredSearch from "../components/StructuredSearch";
import { mockFilters } from "./mock";
import Wrapper from "./styles";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Wrapper>
      <ul>
        <li>
          <h2>Disabled items:</h2>
          <StructuredSearch
            filters={mockFilters()}
            dropdownStyle={{ maxWidth: 400 }}
            onSubmit={(rs) => console.log("Search result:", rs)}
          />
        </li>

        <li>
          <h2>Hidden items:</h2>
          <StructuredSearch
            filters={mockFilters(true)}
            dropdownStyle={{ maxWidth: 400 }}
            onSubmit={(rs) => console.log("Search result:", rs)}
          />
        </li>
      </ul>
    </Wrapper>
  </React.StrictMode>,
);
