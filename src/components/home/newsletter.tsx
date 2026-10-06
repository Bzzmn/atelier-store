"use client";

import { useState } from "react";

// Not wired to a provider yet: submitting only shows a confirmation.
export function Newsletter() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section aria-labelledby="newsletter-title" className="bg-bg-muted">
      <div className="prose-container section-y text-center">
        <h2 id="newsletter-title" className="type-headline">
          Sign Up for Updates
        </h2>
        <p className="type-body mt-3 text-fg-muted">
          Be the first to hear about new collections, private sales and events.
        </p>

        {submitted ? (
          <p role="status" className="type-label mt-10">
            Thank you for subscribing.
          </p>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
            className="mx-auto mt-10 flex max-w-lg flex-col gap-6 sm:flex-row sm:items-end"
          >
            <label className="flex-1 text-left">
              <span className="type-micro text-fg-muted">Email address</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                className="field"
              />
            </label>
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
