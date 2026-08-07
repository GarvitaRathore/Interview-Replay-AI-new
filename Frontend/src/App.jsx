import { BrowserRouter,Routes,Route } from "react-router-dom";
import Login from "./pages/Login"
import CreateInterview from "./pages/CreateInterview"
import Dashboard from "./pages/Dashboard"
import Interview from "./pages/Interview"
import Register from "./pages/Register"
import Result from "./pages/Result"
import Home from "./pages/Home"
function App(){
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create" element={<CreateInterview />} />
      <Route path="/interview/:id" element={<Interview/>} />
      <Route path="/result/:id" element={<Result/>} />
      </Routes>

    </BrowserRouter>


  );

}
export default App;