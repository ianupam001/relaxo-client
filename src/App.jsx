import Auth from "./Auth";
import { Route, Routes } from "react-router-dom";
import DigitalBillViewer from "./DigitalBillViewer";
import "../src/index.css";
function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<Auth />} />
        <Route exact path="/bill" element={<DigitalBillViewer />} />
        <Route exact path="/bill" element={<DigitalBillViewer />} />
      </Routes>
    </div>
  );
}

export default App;
