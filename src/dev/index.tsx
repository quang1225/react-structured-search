import React from "react";
import ReactDOM from "react-dom/client";
import StructuredSearch from "../components/StructuredSearch";
import { MOCK_FILTERS } from "./mock";
import Wrapper from "./styles";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Wrapper>
      <ul>
        <li>
          <h2>structured-search</h2>
          <StructuredSearch
            filters={MOCK_FILTERS}
            dropdownStyle={{ maxWidth: 400 }}
            onSubmit={(rs) => console.log("Search result:", rs)}
          />
        </li>
      </ul>
    </Wrapper>
  </React.StrictMode>,
);
