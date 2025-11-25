'use client';

import { FormEvent, KeyboardEvent, useCallback, useState } from 'react';
import ResultDisplay from '../components/ResultDisplay';
import { IconError, IconSend, IconSparkles } from '../components/Icons';
import type { BackendResponse, MemeResult } from '../types';

export default function HomePage() {
  const [result, setResult] = useState<MemeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const content = (formData.get('content') as string)?.trim() ?? '';

    if (!content) {
      setError('Content is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const payload = (await response.json()) as BackendResponse;

      if (!response.ok) {
        const message = 'error' in payload ? payload.error : 'Failed to classify content';
        throw new Error(message || 'Failed to classify content');
      }

      if ('error' in payload) {
        throw new Error(payload.error || 'Failed to classify content');
      }

      setResult(payload.result ?? null);
      formElement.reset();
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Unexpected error';
      setError(message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 sm:px-6">
      <header className="w-full max-w-2xl flex justify-between items-center mb-8">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <IconSparkles />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            何意味？ <span className="text-indigo-600 font-light">MemeAI</span>
          </h1>
        </div>
      </header>

      <main className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 p-6 sm:p-8 space-y-8">
        <section>
          <ResultDisplay result={result} isLoading={isLoading} />
        </section>

        <section className="space-y-4">
          <form method="post" onSubmit={handleSubmit}>
            <div className="relative">
              <textarea
                name="content"
                onKeyDown={handleKeyDown}
                placeholder="在这里输入你想说的话、故事或情绪... (Cmd/Ctrl + Enter 提交)"
                className="w-full h-32 p-4 bg-slate-50 text-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/50 resize-none outline-none transition-all placeholder:text-slate-400 text-lg leading-relaxed"
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-500 bg-red-50 p-3 rounded-lg text-sm mt-4">
                <IconError />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 mt-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] ${
                isLoading
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300'
              }`}
            >
              <span>{isLoading ? '判定中...' : '开始判定'}</span>
              {!isLoading && <IconSend />}
            </button>
          </form>
        </section>
      </main>

      <footer className="mt-8 text-center text-slate-400 text-sm">
        <p>Powered by DeepSeek V3</p>
      </footer>
    </div>
  );
}
