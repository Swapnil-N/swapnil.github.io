'use client';

import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
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

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const COUNTRY_CODES = [
  { code: '+1', label: 'US +1', flag: '🇺🇸' },
  { code: '+44', label: 'UK +44', flag: '🇬🇧' },
  { code: '+91', label: 'IN +91', flag: '🇮🇳' },
  { code: '+33', label: 'FR +33', flag: '🇫🇷' },
  { code: '+49', label: 'DE +49', flag: '🇩🇪' },
  { code: '+81', label: 'JP +81', flag: '🇯🇵' },
  { code: '+86', label: 'CN +86', flag: '🇨🇳' },
  { code: '+61', label: 'AU +61', flag: '🇦🇺' },
  { code: '+55', label: 'BR +55', flag: '🇧🇷' },
  { code: '+52', label: 'MX +52', flag: '🇲🇽' },
  { code: '+82', label: 'KR +82', flag: '🇰🇷' },
  { code: '+39', label: 'IT +39', flag: '🇮🇹' },
  { code: '+34', label: 'ES +34', flag: '🇪🇸' },
  { code: '+971', label: 'AE +971', flag: '🇦🇪' },
  { code: '+65', label: 'SG +65', flag: '🇸🇬' },
];

function formatUSPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function getPhoneDigits(formatted: string): string {
  return formatted.replace(/\D/g, '');
}

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const inputClass =
    'w-full rounded-xl bg-transparent border border-border px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors';

  const errorInputClass =
    'w-full rounded-xl bg-transparent border border-red-500 px-4 py-3 text-foreground focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors';

  function handlePhoneChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (countryCode === '+1') {
      setPhone(formatUSPhone(raw));
    } else {
      setPhone(raw.replace(/[^\d\s-]/g, ''));
    }
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  }

  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!EMAIL_REGEX.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    const phoneDigits = getPhoneDigits(phone);
    if (countryCode === '+1' && phoneDigits.length !== 10) {
      newErrors.phone = 'US phone numbers must be 10 digits.';
    } else if (phoneDigits.length < 6) {
      newErrors.phone = 'Please enter a valid phone number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

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

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      iframe.remove();
    }, 1500);
  }

  const fullPhone = `${countryCode} ${phone}`;

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
                    Name (First and Last) <span className="text-primary">*</span>
                  </label>
                  <input
                    id="name"
                    name={ENTRY_IDS.name}
                    type="text"
                    required
                    minLength={2}
                    className={inputClass}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email <span className="text-primary">*</span>
                  </label>
                  <input
                    id="email"
                    name={ENTRY_IDS.email}
                    type="email"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    className={errors.email ? errorInputClass : inputClass}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number <span className="text-primary">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => {
                        setCountryCode(e.target.value);
                        setPhone('');
                      }}
                      className="rounded-xl bg-transparent border border-border px-3 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-sm w-28 shrink-0"
                    >
                      {COUNTRY_CODES.map((cc) => (
                        <option key={cc.code} value={cc.code} className="bg-surface">
                          {cc.flag} {cc.code}
                        </option>
                      ))}
                    </select>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      className={errors.phone ? errorInputClass : inputClass}
                      placeholder={countryCode === '+1' ? '555-123-4567' : 'Phone number'}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.phone}</p>
                  )}
                  {/* Hidden input sends the full phone with country code to Google Forms */}
                  <input type="hidden" name={ENTRY_IDS.phone} value={fullPhone} />
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium mb-2">
                    How did you hear about me or know me? <span className="text-primary">*</span>
                  </label>
                  <input
                    id="reason"
                    name={ENTRY_IDS.reason}
                    type="text"
                    required
                    minLength={2}
                    className={inputClass}
                    placeholder="Networking, collaboration, etc."
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message <span className="text-primary">*</span>
                  </label>
                  <textarea
                    id="message"
                    name={ENTRY_IDS.message}
                    required
                    minLength={10}
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
