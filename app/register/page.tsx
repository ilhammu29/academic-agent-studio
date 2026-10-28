'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthView from '@/components/AuthView';

function RegisterContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  return (
    <AuthView 
      initialMode="register" 
      redirectUrl={redirect}
    />
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090D] flex items-center justify-center text-zinc-500">Memuat...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
