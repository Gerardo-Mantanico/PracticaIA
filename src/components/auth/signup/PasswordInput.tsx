"use client";

import React from "react";
import Input from "@/components/form/input/InputField";
import { EyeIcon, EyeCloseIcon } from "@/icons";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  show: boolean;
  toggle: () => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChange, show, toggle }) => {
  return (
    <div className="relative">
      <Input
        placeholder="Enter your password"
        name="password"
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
      />

      <span
        onClick={toggle}
        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
      >
        {show ? (
          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
        ) : (
          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
        )}
      </span>
    </div>
  );
};

export default PasswordInput;
