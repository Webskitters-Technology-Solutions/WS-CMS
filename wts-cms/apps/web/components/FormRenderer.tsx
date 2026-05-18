/**
 * ================================================================
 *  __        __ _____ ____  ____  _  _____ _____ _____ _____ ____  ____
 *  \ \      / /| ____| __ )/ ___|| |/ /_ _|_   _|_   _| ____|  _ \/ ___|
 *   \ \ /\ / / |  _| |  _ \\___ \| ' / | |  | |   | | |  _| | |_) \___ \
 *    \ V  V /  | |___| |_) |___) | . \ | |  | |   | | | |___|  _ < ___) |
 *     \_/\_/   |_____|____/|____/|_|\_\___| |_|   |_| |_____|_| \_\____/
 *
 *  Project      : WTS CMS
 *  Powered By   : Webskitters Technology Solutions Pvt. Ltd.
 *  Website      : https://www.webskitters.com
 *  Description  : Enterprise-ready lightweight CMS starter platform
 *
 *  Copyright © Webskitters Technology Solutions Pvt. Ltd.
 * ================================================================
 */
"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

interface FormField {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export function FormRenderer({ slug = "contact-us" }: { slug?: string }) {
  const [form, setForm] = useState<any>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/forms/${slug}`)
      .then((response) => response.json())
      .then((body) => setForm(body.data))
      .catch(() => setMessage("Unable to load this WTS CMS form."));
  }, [slug]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch(`${API_BASE_URL}/api/public/forms/${slug}/submit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ values })
    });
    const body = await response.json().catch(() => ({}));
    setMessage(body.data?.message || body.message || "Thank you. Your submission has been received.");
    if (response.ok) {
      setValues({});
    }
  }

  if (!form) {
    return <p className="meta">{message || "Loading WTS CMS form..."}</p>;
  }

  return (
    <form className="public-form" onSubmit={submit}>
      <h2>{form.name}</h2>
      {form.description ? <p>{form.description}</p> : null}
      <input
        aria-hidden="true"
        className="form-honeypot"
        name={form.honeypotField || "companyWebsite"}
        tabIndex={-1}
        value={values[form.honeypotField || "companyWebsite"] || ""}
        onChange={(event) => setValues({ ...values, [event.target.name]: event.target.value })}
      />
      {(form.fields || []).map((field: FormField) => (
        <label key={field.id}>
          <span>{field.label}{field.required ? " *" : ""}</span>
          {field.type === "textarea" ? (
            <textarea
              required={field.required}
              placeholder={field.placeholder}
              value={values[field.id] || ""}
              onChange={(event) => setValues({ ...values, [field.id]: event.target.value })}
            />
          ) : field.type === "select" ? (
            <select
              required={field.required}
              value={values[field.id] || ""}
              onChange={(event) => setValues({ ...values, [field.id]: event.target.value })}
            >
              <option value="">Select</option>
              {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : (
            <input
              required={field.required}
              type={field.type === "phone" ? "tel" : field.type}
              placeholder={field.placeholder}
              value={values[field.id] || ""}
              onChange={(event) => setValues({ ...values, [field.id]: event.target.value })}
            />
          )}
        </label>
      ))}
      <button type="submit">Submit to Webskitters</button>
      {message ? <p className="meta">{message}</p> : null}
    </form>
  );
}
