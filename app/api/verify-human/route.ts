import { NextRequest, NextResponse } from 'next/server';
import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';
import { SignJWT } from 'jose';

export const runtime = 'nodejs';

function getGoogleCredentials() {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) {
    throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS_JSON');
  }
  return JSON.parse(raw);
}

function getRecaptchaClient() {
  const credentials = getGoogleCredentials();

  return new RecaptchaEnterpriseServiceClient({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
    projectId: process.env.RECAPTCHA_PROJECT_ID,
  });
}

async function signVerificationCookie() {
  const secret = new TextEncoder().encode(process.env.RECAPTCHA_COOKIE_SECRET);
  return new SignJWT({ human: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret);
}

export async function POST(req: NextRequest) {
  try {
    const { token, action } = await req.json();

    if (!token || !action) {
      return NextResponse.json(
        { ok: false, error: 'Missing token or action.' },
        { status: 400 }
      );
    }

    const client = getRecaptchaClient();
    const projectID = process.env.RECAPTCHA_PROJECT_ID!;
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;

    const [assessment] = await client.createAssessment({
      parent: `projects/${projectID}`,
      assessment: {
        event: {
          token,
          siteKey,
          expectedAction: action,
          userAgent: req.headers.get('user-agent') || undefined,
          userIpAddress:
            req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
        },
      },
    });

    if (!assessment.tokenProperties?.valid) {
      return NextResponse.json(
        {
          ok: false,
          error: `Invalid token: ${assessment.tokenProperties?.invalidReason || 'unknown'}`,
        },
        { status: 403 }
      );
    }

    if (assessment.tokenProperties.action !== action) {
      return NextResponse.json(
        { ok: false, error: 'Action mismatch.' },
        { status: 403 }
      );
    }

    const cookieValue = await signVerificationCookie();

    const response = NextResponse.json({ ok: true });
    response.cookies.set('human_verified', cookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: 'Server verification failed.' },
      { status: 500 }
    );
  }
}