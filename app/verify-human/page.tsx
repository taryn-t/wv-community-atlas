'use client';

import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        getResponse: (widgetId?: number) => string;
      };
    };
  }
}

export default function VerifyHumanPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);

    try {
        
      const token = window.grecaptcha?.enterprise?.getResponse();

      if (!token) {
        setError('Please complete the CAPTCHA first.');
        return;
      }

      const res = await fetch('/api/verify-human', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'site_gate' }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || 'Verification failed.');
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Unexpected error during verification.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Script
        src="https://www.google.com/recaptcha/enterprise.js"
        strategy="afterInteractive"
      />

      <h1 className="text-2xl font-semibold">Verify you’re human</h1>
      <p className="mt-2 text-sm text-gray-600">
        Complete the CAPTCHA to continue to the site.
      </p>

      <div
        className="g-recaptcha mt-6"
        data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
        data-action="site_gate"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'Enter site'}
      </button>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </main>
  );
}