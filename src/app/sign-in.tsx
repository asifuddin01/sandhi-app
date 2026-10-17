import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Body, Button, Field, Screen, TextLink, Title } from '@/components/ui';
import { Space, useColors } from '@/constants/theme';
import { request } from '@/lib/api';
import { ApiError } from '@/lib/envelope';
import { useSession } from '@/lib/session';

/** The site's own messages: neutral about which part was wrong, clear about what to do. */
function messageOf(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
}

export default function SignInScreen() {
  const colors = useColors();
  const { signIn, verify } = useSession();
  const [step, setStep] = useState<'password' | 'code'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [backup, setBackup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submitPassword() {
    setBusy(true);
    setProblem(null);
    setNotice(null);
    try {
      const outcome = await signIn(email.trim(), password);
      setPassword('');
      if (outcome === 'two-factor') setStep('code');
      else router.replace('/me');
    } catch (error) {
      setProblem(messageOf(error));
    } finally {
      setBusy(false);
    }
  }

  async function submitCode() {
    setBusy(true);
    setProblem(null);
    try {
      await verify(code.trim(), backup ? 'backup' : 'totp');
      router.replace('/me');
    } catch (error) {
      setProblem(messageOf(error));
      setCode('');
    } finally {
      setBusy(false);
    }
  }

  async function forgot() {
    setProblem(null);
    if (!email.trim()) {
      setProblem('Enter your email address first, then ask for a reset link.');
      return;
    }
    setBusy(true);
    try {
      const answer = await request<{ message: string }>('/auth/password-reset', {
        method: 'POST',
        body: { email: email.trim() },
      });
      setNotice(answer.message);
    } catch (error) {
      setProblem(messageOf(error));
    } finally {
      setBusy(false);
    }
  }

  const feedback = (
    <>
      {problem ? (
        <Body accessibilityRole="alert" style={{ color: colors.warn }}>
          {problem}
        </Body>
      ) : null}
      {notice ? <Body accessibilityLiveRegion="polite">{notice}</Body> : null}
    </>
  );

  if (step === 'code') {
    return (
      <Screen>
        <View style={{ gap: Space.s }}>
          <Title>Two-factor code</Title>
          <Body style={{ color: colors.muted }}>
            {backup
              ? 'Enter one of your backup codes, including the dash.'
              : 'Enter the six-digit code from your authenticator app.'}
          </Body>
        </View>
        <Field
          key={backup ? 'backup' : 'totp'}
          label={backup ? 'Backup code' : 'Code'}
          value={code}
          onChangeText={setCode}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={backup ? 'default' : 'number-pad'}
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={backup ? 11 : 6}
          placeholder={backup ? 'xxxxx-xxxxx' : '123456'}
          returnKeyType="done"
          onSubmitEditing={submitCode}
        />
        {feedback}
        <Button title="Verify" onPress={submitCode} busy={busy} />
        <TextLink
          title={backup ? 'Use the authenticator app instead' : 'Use a backup code instead'}
          onPress={() => {
            setBackup(!backup);
            setCode('');
            setProblem(null);
          }}
        />
        <TextLink
          title="Start again"
          onPress={() => {
            setStep('password');
            setCode('');
            setProblem(null);
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: Space.s }}>
        <Title>Sign in</Title>
        <Body style={{ color: colors.muted }}>
          For SANDHI members. Accounts are created by invitation.
        </Body>
      </View>
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="username"
        autoComplete="email"
        returnKeyType="next"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
        autoComplete="current-password"
        returnKeyType="go"
        onSubmitEditing={submitPassword}
      />
      {feedback}
      <Button title="Sign in" onPress={submitPassword} busy={busy} />
      <TextLink title="Forgot your password?" onPress={forgot} />
    </Screen>
  );
}
