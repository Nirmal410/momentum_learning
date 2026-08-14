import { BrowserRouter, Routes, Route } from "react-router-dom";

import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";
import Leetcode from "../pages/Leetcode";
import Progress from "../pages/Progress";
import History from "../pages/History";
import Admin from "../pages/Admin";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";

export default function AppRouter() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Auth />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/leetcode"
                    element={
                        <ProtectedRoute>
                            <Leetcode />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/progress"
                    element={
                        <ProtectedRoute>
                            <Progress />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/history"
                    element={
                        <ProtectedRoute>
                            <History />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <Admin />
                        </AdminRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}