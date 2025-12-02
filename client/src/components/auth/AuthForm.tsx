import React, { useState } from "react";
import api from "@/axios";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

interface AuthFormProps {
    isLogin: boolean;
    onAuthSuccess?: () => void;       // for login
    onRegisterSuccess?: () => void;   // for registration
}


const AuthForm = ({ isLogin, onAuthSuccess, onRegisterSuccess }: AuthFormProps) => {
    const [form, setForm] = useState({
        name: "",
        surname: "",
        username: "",
        password: "",
    });
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"error" | "success">("success");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            if (isLogin) {
                // Validate login fields
                if (!form.username.trim() || !form.password.trim()) {
                    setMessageType("error");
                    setMessage("Username and password are required");
                    setLoading(false);
                    return;
                }

                const res = await api.post("/login", {
                    username: form.username,
                    password: form.password,
                });
                
                if (res.data.token) {
                    localStorage.setItem("token", res.data.token);
                    setMessageType("success");
                    setMessage("Login successful!");
                    onAuthSuccess?.();
                }
            } else {
                // Validate registration fields
                if (!form.name.trim() || !form.surname.trim() || !form.username.trim() || !form.password.trim()) {
                    setMessageType("error");
                    setMessage("All fields are required");
                    setLoading(false);
                    return;
                }

                if (form.password.length < 6) {
                    setMessageType("error");
                    setMessage("Password must be at least 6 characters");
                    setLoading(false);
                    return;
                }

                const res = await api.post("/register", {
                    name: form.name,
                    surname: form.surname,
                    username: form.username,
                    password: form.password,
                });
                
                setMessageType("success");
                setMessage(res.data.message || "Registered successfully!");
                setForm({ name: "", surname: "", username: "", password: "" });
                setTimeout(() => {
                    onRegisterSuccess?.();
                    setMessage('');
                }, 2000);
            }
        } catch (err: any) {
            setMessageType("error");
            setMessage(err.response?.data?.error || "Something went wrong");
            console.error("Auth error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-white shadow-lg rounded-2xl p-6 w-[430px]">
            <CardHeader>
                <CardTitle className="text-center text-2xl font-semibold">
                    {isLogin ? "Welcome back" : "Create your account"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <div className="space-y-1">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="John" required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="surname">Surname</Label>
                                <Input id="surname" name="surname" value={form.surname} onChange={handleChange} placeholder="Doe" required />
                            </div>
                        </>
                    )}

                    <div className="space-y-1">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" name="username" value={form.username} onChange={handleChange} placeholder="Enter your username" required />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
                    </div>

                    {message && (
                        <p className={`text-center text-sm px-3 py-2 rounded-md ${
                            messageType === "error" 
                                ? "bg-red-100 text-red-700" 
                                : "bg-green-100 text-green-700"
                        }`}>
                            {message}
                        </p>
                    )}

                    <Button type="submit" disabled={loading} className="w-full cursor-pointer bg-purple-700 hover:bg-purple-800 text-white font-medium">
                        {loading ? (isLogin ? "Logging in..." : "Registering...") : isLogin ? "Login" : "Register"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default AuthForm;
