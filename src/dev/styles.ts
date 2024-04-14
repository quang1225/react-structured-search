import styled from "@emotion/styled";

const Wrapper = styled.div`
  display: flex;
  flex-direction: "column";
  justify-content: "center";
  align-items: "center";
  height: "100vh";
  gap: 52;
  padding: 0 100px;

  ul {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 80px;
    list-style: none;
    padding: 0;
  }
`;

export default Wrapper;
