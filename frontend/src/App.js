import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WeightTracker from "./weight";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import Navbar from "./Navbar";
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<WeightTracker />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
      </Routes>
    </Router>
  );
}

export default App;
