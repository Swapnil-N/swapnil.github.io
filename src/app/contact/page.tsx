'use client';

import { useState, useRef, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';

const GOOGLE_FORM_ACTION =
  'https://docs.google.com/forms/d/e/1FAIpQLSfqWOc9zWGOBXC_U4fqknmhaYu4OAD2P83KS0M6KvrdclQHMw/formResponse';

const ENTRY_IDS = {
  email: 'entry.1832407109',
  phone: 'entry.420911470',
  name: 'entry.1634930124',
  reason: 'entry.2009561971',
  message: 'entry.1427964070',
} as const;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const inputClass =
    'w-full rounded-xl bg-transparent border border-border px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors';

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    // Submit via hidden iframe to avoid CORS issues entirely
    const iframe = document.createElement('iframe');
    iframe.name = 'hidden-form-target';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    if (formRef.current) {
      formRef.current.target = 'hidden-form-target';
      formRef.current.action = GOOGLE_FORM_ACTION;
      formRef.current.method = 'POST';
      formRef.current.submit();
    }

    // Google Forms doesn't send back a cross-origin response we can read,
    // so we wait a moment then show success
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      iframe.remove();
    }, 1500);
  }

  return (
    <PageTransition>
      <div className="min-h-screen max-w-xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' as const }}
              className="text-center py-20"
            >
              <h2 className="text-2xl font-heading font-bold mb-4">
                Message sent!
              </h2>
              <p className="text-muted">
                Thanks for reaching out — I&apos;ll get back to you soon.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-4xl font-heading font-bold mb-3">
                Get in Touch
              </h1>
              <p className="text-muted mb-10">
                Have a question or want to connect? Drop me a message.
              </p>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name (First and Last)
                  </label>
                  <input
                    id="name"
                    name={ENTRY_IDS.name}
                    type="text"
                    required
                    className={inputClass}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name={ENTRY_IDS.email}
                    type="email"
                    required
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name={ENTRY_IDS.phone}
                    type="tel"
                    required
                    className={inputClass}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium mb-2">
                    How did you hear about me or know me?
                  </label>
                  <input
                    id="reason"
                    name={ENTRY_IDS.reason}
                    type="text"
                    required
                    className={inputClass}
                    placeholder="Networking, collaboration, etc."
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name={ENTRY_IDS.message}
                    required
                    rows={5}
                    className={inputClass + ' resize-none'}
                    placeholder="Your message..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-primary text-white font-medium py-3 px-6 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
