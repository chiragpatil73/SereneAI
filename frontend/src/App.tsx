import { Route, Routes } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResponsibleAI } from "./pages/ResponsibleAI";
import { Dashboard } from "./pages/Dashboard";
import { Chat } from "./pages/Chat";
import { Grounding } from "./pages/Grounding";
import { ExercisePlayer } from "./pages/ExercisePlayer";
import { MoodTracker } from "./pages/MoodTracker";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import { NotFound } from "./pages/NotFound";
import { AppLayout } from "./layouts/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/responsible-ai" element={<ResponsibleAI />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="chat" element={<Chat />} />
        <Route path="mood" element={<MoodTracker />} />
        <Route path="grounding" element={<Grounding />} />
        <Route path="exercise/:type" element={<ExercisePlayer />} />
        <Route path="history" element={<History />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
