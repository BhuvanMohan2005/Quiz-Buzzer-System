import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PlayerPage from "./pages/PlayerPage";
import HostPage from "./pages/HostPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/player/:room/:id" element={<PlayerPage />} />
        <Route path="/host/:room" element={<HostPage />} />
        <Route path="/player/:room/:id/:name" element={<PlayerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;