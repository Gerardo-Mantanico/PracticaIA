"use client";
import React, { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import TextCongreso from "../input/TextArea";
import Label from "../Label";

export default function TextCongresoInput() {
  const [message, setMessage] = useState("");
  const [messageTwo, setMessageTwo] = useState("");
  return (
    <ComponentCard title="Textcongreso input field">
      <div className="space-y-6">
        {/* Default TextCongreso */}
        <div>
          <Label>Description</Label>
          <TextCongreso
            value={message}
            onChange={(value) => setMessage(value)}
            rows={6}
          />
        </div>

        {/* Disabled TextCongreso */}
        <div>
          <Label>Description</Label>
          <TextCongreso rows={6} disabled />
        </div>

        {/* Error TextCongreso */}
        <div>
          <Label>Description</Label>
          <TextCongreso
            rows={6}
            value={messageTwo}
            error
            onChange={(value) => setMessageTwo(value)}
            hint="Please enter a valid message."
          />
        </div>
      </div>
    </ComponentCard>
  );
}
