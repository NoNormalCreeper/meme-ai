'use client';

import { FormEvent, KeyboardEvent, useCallback, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import ResultDisplay from '../components/ResultDisplay';
import { IconDownload, IconError, IconSend, IconSparkles } from '../components/Icons';
import type { BackendResponse, MemeResult } from '../types';

export default function HomePage() {
  const [result, setResult] = useState<MemeResult | null>(null);
  const [roast, setRoast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const content = (formData.get('content') as string)?.trim() ?? '';

    if (!content) {
      setError('Content is required');
      setRoast(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setRoast(null);

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
      setRoast(payload.roast ?? null);
      // formElement.reset();
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Unexpected error';
      setError(message);
      setResult(null);
      setRoast(null);
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

  const handleExport = useCallback(async () => {
    if (!cardRef.current) {
      return;
    }

    try {
      setIsExporting(true);
      const pixelRatio = typeof window !== 'undefined' ? Math.max(2, window.devicePixelRatio || 2) : 2;
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio,
        backgroundColor: '#f8fafc',
      });

      const image = new Image();
      image.src = dataUrl;

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('无法生成图片'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('无法获取画布上下文');
      }

      ctx.drawImage(image, 0, 0);

      const watermark = 'https://hyw.r1kka.one';
      const padding = Math.max(12, canvas.width * 0.01);
      const fontSize = Math.max(16, Math.round(canvas.width * 0.018));
      ctx.font = `${fontSize}px 'Inter', 'Noto Sans SC', sans-serif`;
      ctx.textBaseline = 'bottom';

      const metrics = ctx.measureText(watermark);
      const textWidth = metrics.width;
      const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      const boxX = canvas.width - padding - textWidth - padding;
      const boxY = canvas.height - padding - textHeight - padding * 0.5;
      const boxWidth = textWidth + padding * 2;
      const boxHeight = textHeight + padding;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(watermark, boxX + padding, canvas.height - padding * 0.5);

      const finalUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = finalUrl;
      link.download = `memeai-card-${Date.now()}.png`;
      link.click();
    } catch (exportError) {
      console.error('导出失败', exportError);
      alert('导出失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  }, []);

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

        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting || isLoading}
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors ${
            isExporting || isLoading
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50'
          }`}
        >
          <span>{isExporting ? '导出中...' : '导出图片'}</span>
          {!isExporting && <IconDownload />}
        </button>
      </header>

      <main
        ref={cardRef}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 p-6 sm:p-8 space-y-8"
      >
        <section>
          <ResultDisplay result={result} roast={roast} isLoading={isLoading} />
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
