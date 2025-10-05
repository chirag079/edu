"use client";
import { toast } from "react-toastify";
import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AuthLayout from "@/components/Auth/AuthLayout";
import { Loader2 } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const username_regex = "^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]+$";
  const email_regex =
    /^(?=.*[a-zA-Z])[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z]+\.[a-zA-Z]+$/;
  const name_regex = /^[a-zA-Z\s]{2,30}$/;

  const [validForm, setvalidForm] = useState(false);
  const [formError, setformError] = useState("");

  const [name, setName] = useState("");
  const [isValidName, setIsValidName] = useState(false);
  const [nameError, setNameError] = useState("");

  const [username, setUsername] = useState("");
  const [isValidUsername, setisValidUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const [email, setEmail] = useState("");
  const [isValidEmail, setisValidEmail] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [password, setPassword] = useState("");
  const [isValidPassword, setisValidPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [role, setRole] = useState("explorer");

  const [isPending, startTransition] = useTransition();

  function handleNameChange(event) {
    setName(event.target.value);
  }

  function handleUsernameChange(event) {
    event.target.value = event.target.value.replace(/\s/g, "");
    setUsername(event.target.value);
  }

  function handleEmailChange(event) {
    event.target.value = event.target.value.replace(/\s/g, "");
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    event.target.value = event.target.value.replace(/\s/g, "");
    setPassword(event.target.value);
  }

  const validateName = useCallback(() => {
    if (name.length < 2 || name.length > 30) {
      setNameError("Name must be 2-30 characters long");
      setIsValidName(false);
    } else if (!name.match(name_regex)) {
      setNameError("Name can only contain letters and spaces");
      setIsValidName(false);
    } else {
      setNameError("");
      setformError("");
      setIsValidName(true);
    }
  }, [name, name_regex]);

  const validateUsername = useCallback(() => {
    if (username.length < 5 || username.length > 20) {
      setUsernameError("Username must be 5-20 characters long");
      setisValidUsername(false);
    } else if (!username.match(username_regex)) {
      setUsernameError("Username must be alphanumeric");
      setisValidUsername(false);
    } else {
      setUsernameError("");
      setformError("");
      setisValidUsername(true);
    }
  }, [username, username_regex]);

  const validateEmail = useCallback(() => {
    if (email.length < 5 || email.length > 30) {
      setEmailError("Email should be  5-35 characters Long");
      setisValidEmail(false);
    } else if (!email.match(email_regex)) {
      setEmailError("Email must be valid");
      setisValidEmail(false);
    } else {
      setEmailError("");
      setisValidEmail(true);
      setformError("");
    }
  }, [email, email_regex]);

  const validatePassword = useCallback(() => {
    if (password.length < 8 || password.length > 20) {
      setPasswordError("Password must be  8-20 characters long");
      setisValidPassword(false);
    } else {
      setPasswordError("");
      setisValidPassword(true);
    }
  }, [password]);

  useEffect(() => {
    validateName();
  }, [validateName]);

  useEffect(() => {
    validateUsername();
  }, [validateUsername]);

  useEffect(() => {
    validateEmail();
  }, [validateEmail]);

  useEffect(() => {
    validatePassword();
  }, [validatePassword]);

  useEffect(() => {
    if (isValidName && isValidEmail && isValidUsername && isValidPassword) {
      setvalidForm(true);
    } else {
      setvalidForm(false);
    }
  }, [isValidName, isValidEmail, isValidUsername, isValidPassword]);

  useEffect(() => {
    setNameError("");
    setEmailError("");
    setUsernameError("");
    setPasswordError("");
    setformError("");
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        const user = {
          name: name,
          username: username,
          email: email,
          password: password,
          role: role,
        };
        const data = JSON.stringify(user);

        const result = await axios.post("/api/register/signup", data, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        setformError("");
        setEmailError("");
        setPasswordError("");
        setUsernameError("");
        setNameError("");
        toast.success("Successfully Registered", {
          autoClose: 2000,
          theme: "colored",
        });
        router.replace("/login");
      } catch (error) {
        if (
          error?.response?.data?.Type === "authorisation error" ||
          error?.response?.data?.Type === "ZodValidationError"
        ) {
          setformError(error?.response?.data?.Message);
        } else {
          console.error(error);
        }
        return;
      }
    });
  };

  return (
    <AuthLayout type="signup">
      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
            {formError}
          </div>
        )}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Full Name
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={handleNameChange}
            className={nameError ? "border-destructive" : ""}
            maxLength={30}
          />
          {nameError && <p className="text-sm text-destructive">{nameError}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={handleUsernameChange}
            className={usernameError ? "border-destructive" : ""}
            maxLength={20}
          />
          {usernameError && (
            <p className="text-sm text-destructive">{usernameError}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            className={emailError ? "border-destructive" : ""}
            maxLength={30}
          />
          {emailError && (
            <p className="text-sm text-destructive">{emailError}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={handlePasswordChange}
            className={passwordError ? "border-destructive" : ""}
            maxLength={20}
          />
          {passwordError && (
            <p className="text-sm text-destructive">{passwordError}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium">
            Account Type
          </label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Account Types</SelectLabel>
                <SelectItem value="explorer">Explorer</SelectItem>
                <SelectItem value="advertiser">Advertiser</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!validForm || isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
