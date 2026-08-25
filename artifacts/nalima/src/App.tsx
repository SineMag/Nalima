import { useMemo, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  Database,
  Leaf,
  Menu,
  MessageCircle,
  MoreHorizontal,
  PanelLeftClose,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Sprout,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { useChatWithNala, useHealthCheck, useListKnowledge } from '@workspace/api-client-react';
import type { ChatResponse, HealthStatus, KnowledgeItem } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

const queryClient = new QueryClient();
type HealthQuery = ReturnType<typeof useHealthCheck<HealthStatus>>;

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  response?: ChatResponse;
};

const suggestedQuestions = [
  'How can I improve maize yields with less rainfall?',
  'What should I check first when leaves turn yellow?',
  'Give me a low-cost plan for fall armyworm this week.',
  'Which crops can I plant after the short rains?',
];

function StatusPill({ health }: { health: HealthQuery }) {
  const isHealthy = health.data?.status?.toLowerCase() === 'ok' || health.data?.status?.toLowerCase() === 'healthy';
  return (
    <button type="button" onClick={() => health.refetch()} title="Check local engine status" className="flex items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent/80 px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-sidebar-foreground transition hover:border-sidebar-primary/60" data-testid="status-local-offline">
      <span className={`relative flex h-2 w-2 ${isHealthy ? '' : 'opacity-80'}`}>
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${isHealthy ? 'bg-[#d7de68]' : 'bg-[#e08c64]'}`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${isHealthy ? 'bg-[#d7de68]' : 'bg-[#e08c64]'}`} />
      </span>
      <span>LOCAL</span>
      <span className="text-sidebar-foreground/40">/</span>
      <span className={isHealthy ? 'text-[#d7de68]' : 'text-[#e08c64]'}>{isHealthy ? 'READY' : 'OFFLINE'}</span>
    </button>
  );
}

function LogoMark() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-[13px] bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_7px_0_rgba(215,222,104,0.13)]">
      <Leaf className="h-5 w-5" strokeWidth={2.4} />
      <span className="absolute bottom-[7px] right-[7px] h-1 w-1 rounded-full bg-sidebar" />
    </div>
  );
}

function Sidebar({
  health,
  mobileOpen,
  onClose,
}: {
  health: HealthQuery;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {mobileOpen && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-30 bg-[#102b25]/40 backdrop-blur-sm lg:hidden" onClick={onClose} data-testid="button-close-navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[276px] flex-col bg-sidebar px-5 py-6 text-sidebar-foreground transition-transform duration-300 lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`} data-testid="navigation-sidebar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <div className="font-display text-[21px] font-bold tracking-[-0.04em] text-sidebar-foreground">nalima</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-sidebar-foreground/45">field intelligence</div>
            </div>
          </div>
          <button type="button" className="rounded-lg p-2 text-sidebar-foreground/50 transition hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden" onClick={onClose} aria-label="Close navigation" data-testid="button-sidebar-close"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-12">
          <div className="mb-3 px-3 font-mono text-[9px] uppercase tracking-[0.22em] text-sidebar-foreground/40">Workspace</div>
          <nav className="space-y-1" aria-label="Workspace navigation">
            <button type="button" className="flex w-full items-center gap-3 rounded-xl bg-sidebar-primary px-3 py-3 text-left text-sm font-semibold text-sidebar-primary-foreground shadow-[0_8px_20px_rgba(0,0,0,0.12)]" data-testid="button-nav-ask-nala">
              <MessageCircle className="h-[17px] w-[17px]" />
              Ask Nala
              <span className="ml-auto rounded-md bg-sidebar-primary-foreground/10 px-1.5 py-0.5 font-mono text-[9px]">01</span>
            </button>
            <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-sidebar-foreground/60 transition hover:bg-sidebar-accent hover:text-sidebar-foreground" onClick={() => document.getElementById('knowledge-library')?.scrollIntoView({ behavior: 'smooth' })} data-testid="button-nav-knowledge">
              <BookOpen className="h-[17px] w-[17px]" />
              Knowledge library
              <span className="ml-auto font-mono text-[10px] text-sidebar-foreground/35">LOCAL</span>
            </button>
          </nav>
        </div>

        <div className="mt-10 border-t border-sidebar-border pt-5">
          <div className="mb-3 px-3 font-mono text-[9px] uppercase tracking-[0.22em] text-sidebar-foreground/40">Nala is running</div>
          <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/45 p-4">
            <div className="flex items-center gap-2 text-xs font-medium">
              <ShieldCheck className="h-4 w-4 text-sidebar-primary" />
              No cloud required
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-sidebar-foreground/48">Questions stay on this device. Advice is grounded in the knowledge packed for your region.</p>
            <div className="mt-4 flex items-center justify-between border-t border-sidebar-border pt-3 font-mono text-[9px] uppercase tracking-[0.12em]">
              <span className="text-sidebar-foreground/40">Connection</span>
              <span className="text-[#d7de68]">{health.isFetching ? 'checking' : 'local only'}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto border-t border-sidebar-border pt-5">
          <StatusPill health={health} />
          <div className="mt-3 flex items-center justify-between px-1 font-mono text-[9px] uppercase tracking-[0.15em] text-sidebar-foreground/35">
            <span>v0.8.4</span>
            <span>device 04</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function TopBar({ health, onMenu }: { health: HealthQuery; onMenu: () => void }) {
  return (
    <header className="flex min-h-[76px] items-center justify-between border-b border-border/80 bg-background/75 px-5 py-4 backdrop-blur-md sm:px-8 lg:px-10" data-testid="header-dashboard">
      <div className="flex items-center gap-3">
        <button type="button" className="rounded-xl border border-border bg-card p-2.5 text-muted-foreground transition hover:bg-muted lg:hidden" onClick={onMenu} aria-label="Open navigation" data-testid="button-open-navigation"><Menu className="h-5 w-5" /></button>
        <div className="hidden items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Field console
          <span className="text-border">/</span>
          East Africa workspace
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:hidden">Nalima / Console</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden items-center gap-2 text-[11px] text-muted-foreground md:flex"><Database className="h-3.5 w-3.5" /> Knowledge synced</div>
        <button type="button" className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 text-left transition hover:bg-muted" data-testid="button-user-menu">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dfb08b] font-display text-xs font-bold text-[#3c2a20]">AM</span>
          <span className="hidden pr-1 text-xs font-semibold text-foreground sm:block">Amina M.</span>
          <ChevronDown className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <div className="hidden sm:block"><StatusPill health={health} /></div>
      </div>
    </header>
  );
}

function Greeting({ health }: { health: HealthQuery }) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dateLabel = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#cbd0a7]/50 bg-[#dfe4ad] px-6 py-7 sm:px-8 sm:py-8" data-testid="section-greeting">
      <div className="relative z-10 max-w-[610px]">
        <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#53634c]">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f2edc8]"><Sparkles className="h-3 w-3 text-[#657336]" /></span>
          {dateLabel}
        </div>
        <h1 className="font-display text-[clamp(2.05rem,4vw,3.55rem)] font-bold leading-[0.98] tracking-[-0.065em] text-[#1b392f]">{greeting}, Amina.</h1>
        <p className="mt-4 max-w-[500px] text-sm leading-relaxed text-[#53634c] sm:text-[15px]">Your local knowledge base is ready. Ask a practical question and Nala will work through it with you.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-[#f2edc8]/75 px-3 py-2 text-[11px] font-semibold text-[#53634c]"><span className="h-1.5 w-1.5 rounded-full bg-[#668440]" /> {health.data?.status ? `Engine ${health.data.status}` : 'Engine ready'}</div>
          <div className="flex items-center gap-2 rounded-full border border-[#9eaa78]/50 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#53634c]"><Clock3 className="h-3.5 w-3.5" /> local response</div>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border-[24px] border-[#eef0c7]/60" />
      <div className="pointer-events-none absolute -right-2 bottom-[-78px] h-48 w-48 rounded-full bg-[#c9d281]/50" />
      <div className="pointer-events-none absolute right-10 top-12 hidden h-24 w-24 rounded-[28px] border border-[#95a469]/50 sm:block" />
      <Sprout className="pointer-events-none absolute right-16 bottom-8 h-20 w-20 rotate-[-16deg] text-[#789052]/60 sm:right-24" strokeWidth={1} />
    </section>
  );
}

function SkeletonCards() {
  return (
    <div className="space-y-3" data-testid="loading-knowledge">
      {[1, 2, 3].map((item) => <div key={item} className="animate-pulse rounded-2xl border border-border bg-card p-4"><div className="h-2.5 w-20 rounded bg-muted" /><div className="mt-3 h-4 w-4/5 rounded bg-muted" /><div className="mt-2 h-3 w-full rounded bg-muted" /><div className="mt-1 h-3 w-2/3 rounded bg-muted" /></div>)}
    </div>
  );
}

function KnowledgeCard({ item, index }: { item: KnowledgeItem; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className="group rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-[#a6b07d] hover:shadow-[0_10px_30px_rgba(54,76,57,0.07)]" data-testid={`card-knowledge-${item.id || index}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-[#ecedcf] px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.13em] text-[#56643b]">{item.topic}</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{item.region}</span>
        </div>
        <button type="button" className="rounded-lg p-1 text-muted-foreground opacity-60 transition hover:bg-muted hover:text-foreground group-hover:opacity-100" onClick={() => setExpanded((value) => !value)} aria-label={`${expanded ? 'Collapse' : 'Expand'} ${item.title}`} data-testid={`button-toggle-knowledge-${item.id || index}`}><MoreHorizontal className="h-4 w-4" /></button>
      </div>
      <h3 className="mt-3 font-display text-[15px] font-bold leading-snug tracking-[-0.02em] text-foreground">{item.title}</h3>
      <p className={`mt-2 text-xs leading-[1.65] text-muted-foreground ${expanded ? '' : 'line-clamp-2'}`}>{item.content}</p>
      <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
        <span className="max-w-[68%] truncate font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground" title={item.source}>{item.source}</span>
        <span className="flex items-center gap-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-[#668440]"><Check className="h-3 w-3" /> {item.confidence}</span>
      </div>
    </article>
  );
}

function KnowledgePanel({ knowledge, isLoading, isError, onRetry }: { knowledge: KnowledgeItem[] | undefined; isLoading: boolean; isError: boolean; onRetry: () => void }) {
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('All topics');
  const topics = useMemo(() => ['All topics', ...Array.from(new Set((knowledge ?? []).map((item) => item.topic).filter(Boolean)))], [knowledge]);
  const filtered = useMemo(() => (knowledge ?? []).filter((item) => {
    const haystack = `${item.title} ${item.topic} ${item.region} ${item.content}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) && (topic === 'All topics' || item.topic === topic);
  }), [knowledge, search, topic]);

  return (
    <section id="knowledge-library" className="min-w-0" data-testid="section-knowledge">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"><BookOpen className="h-3.5 w-3.5 text-primary" /> Local library</div><h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.045em] text-foreground">Knowledge on hand</h2></div>
        <span className="rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] text-muted-foreground" data-testid="text-knowledge-count">{knowledge?.length ?? 0} entries</span>
      </div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search local guidance" className="h-10 w-full rounded-xl border border-border bg-card px-3.5 pr-9 text-xs text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10" data-testid="input-search-knowledge" />{search && <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-3 text-muted-foreground" aria-label="Clear knowledge search" data-testid="button-clear-knowledge-search"><X className="h-3.5 w-3.5" /></button>}</div>
        <select value={topic} onChange={(event) => setTopic(event.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-xs text-foreground outline-none focus:border-primary" aria-label="Filter by topic" data-testid="select-knowledge-topic">{topics.map((entry) => <option key={entry}>{entry}</option>)}</select>
      </div>
      {isLoading && <SkeletonCards />}
      {!isLoading && isError && <div className="rounded-2xl border border-[#e6c1a7] bg-[#fbefe7] p-5" data-testid="error-knowledge"><CircleAlert className="h-5 w-5 text-[#bd6847]" /><p className="mt-3 text-sm font-semibold text-[#704333]">The local library could not be opened.</p><p className="mt-1 text-xs leading-relaxed text-[#8c604e]">Nala can still receive a question, but source context may be limited.</p><button type="button" onClick={onRetry} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#704333] px-3 py-2 text-xs font-semibold text-[#fff4ec] transition hover:bg-[#583328]" data-testid="button-retry-knowledge"><RefreshCw className="h-3.5 w-3.5" /> Try again</button></div>}
      {!isLoading && !isError && filtered.length === 0 && <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center" data-testid="empty-knowledge"><BookOpen className="mx-auto h-6 w-6 text-muted-foreground/60" /><p className="mt-3 text-sm font-semibold text-foreground">{knowledge?.length ? 'No matching guidance' : 'No local guidance yet'}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{knowledge?.length ? 'Try another word or topic.' : 'The knowledge pack is empty on this device.'}</p></div>}
      <div className="space-y-3">{!isLoading && !isError && filtered.map((item, index) => <KnowledgeCard key={`${item.id}-${index}`} item={item} index={index} />)}</div>
    </section>
  );
}

function SourceStrip({ sources }: { sources: KnowledgeItem[] }) {
  if (!sources.length) return null;
  return (
    <div className="mt-5 border-t border-border/80 pt-4" data-testid="panel-response-sources">
      <div className="mb-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.17em] text-muted-foreground"><Database className="h-3 w-3 text-[#668440]" /> Grounded in {sources.length} local {sources.length === 1 ? 'source' : 'sources'}</div>
      <div className="grid gap-2 sm:grid-cols-2">{sources.map((source, index) => <div key={`${source.id}-${index}`} className="rounded-xl bg-muted/60 px-3 py-2.5" data-testid={`source-${source.id || index}`}><div className="truncate text-[11px] font-semibold text-foreground">{source.title}</div><div className="mt-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground"><span>{source.region}</span><span className="text-border">•</span><span>{source.confidence}</span></div></div>)}</div>
    </div>
  );
}

function AssistantMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex gap-3.5" data-testid={`message-assistant-${message.id}`}>
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground"><Leaf className="h-4 w-4" /></div>
      <div className="min-w-0 max-w-[760px] flex-1"><div className="mb-1.5 flex items-center gap-2"><span className="font-display text-xs font-bold text-foreground">Nala</span><span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">local analyst</span></div><div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3.5 text-[13px] leading-[1.75] text-foreground shadow-[0_4px_16px_rgba(54,76,57,0.03)] sm:px-5">{message.content.split('\n').map((paragraph, index) => <p key={index} className={index ? 'mt-3' : ''}>{paragraph}</p>)}<SourceStrip sources={message.response?.sources ?? []} /></div>{message.response?.runtime && <RuntimeLine runtime={message.response.runtime} />}</div>
    </div>
  );
}

function RuntimeLine({ runtime }: { runtime: ChatResponse['runtime'] }) {
  return <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 pl-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground" data-testid="text-runtime-info"><span className="flex items-center gap-1.5 text-[#668440]"><Zap className="h-3 w-3" /> {runtime.mode}</span><span>{runtime.elapsed_ms} ms</span><span>{runtime.tokens} tokens</span><span>{runtime.tokens_per_second} tok/s</span><span className={runtime.model_available ? 'text-[#668440]' : 'text-[#bd6847]'}>{runtime.model_available ? 'model ready' : 'model unavailable'}</span></div>;
}

function ChatPanel({ knowledge }: { knowledge: KnowledgeItem[] | undefined }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const chat = useChatWithNala();

  const sendQuestion = (question: string, retry = false) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || chat.isPending) return;
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: cleanQuestion };
    const conversationMessages = retry && messages[messages.length - 1]?.role === 'user' ? messages.slice(0, -1) : messages;
    const conversation = conversationMessages.slice(-12).map((message) => ({ role: message.role, content: message.content }));
    if (!retry) setMessages((current) => [...current, userMessage]);
    setDraft('');
    chat.mutate({ data: conversation.length ? { question: cleanQuestion, conversation } : { question: cleanQuestion } }, {
      onSuccess: (response) => {
        setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', content: response.answer, response }]);
      },
    });
  };

  const clearConversation = () => {
    if (chat.isPending) return;
    setMessages([]);
    setDraft('');
  };

  return (
    <section className="flex min-h-[620px] min-w-0 flex-col rounded-[24px] border border-border bg-card p-4 shadow-[0_18px_50px_rgba(54,76,57,0.05)] sm:p-6" data-testid="section-chat">
      <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-5">
        <div><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"><MessageCircle className="h-3.5 w-3.5 text-primary" /> Consultation room</div><h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.05em] text-foreground">Ask Nala</h2><p className="mt-1 text-xs text-muted-foreground">Clear, grounded answers from your local model.</p></div>
        <button type="button" disabled={!messages.length || chat.isPending} onClick={clearConversation} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35" data-testid="button-clear-conversation"><Trash2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Clear</span></button>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        {messages.length === 0 && <div className="flex min-h-[360px] flex-col justify-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#edf0d3] text-[#668440]"><Sprout className="h-7 w-7" strokeWidth={1.6} /></div><div className="mx-auto mt-5 max-w-[440px] text-center"><h3 className="font-display text-xl font-bold tracking-[-0.04em] text-foreground">Start with what you see in the field.</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Nala can help you reason through crops, pests, soil, and timing using the guidance stored here.</p></div><div className="mx-auto mt-7 grid w-full max-w-[610px] gap-2 sm:grid-cols-2">{suggestedQuestions.map((question, index) => <button type="button" key={question} onClick={() => sendQuestion(question)} className="group flex items-start justify-between gap-3 rounded-xl border border-border bg-background px-3.5 py-3 text-left text-xs leading-relaxed text-muted-foreground transition hover:border-[#a6b07d] hover:bg-[#f6f5df] hover:text-foreground" data-testid={`button-suggested-question-${index}`}><span>{question}</span><ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" /></button>)}</div></div>}
        {messages.length > 0 && <div className="space-y-6">{messages.map((message) => message.role === 'user' ? <div key={message.id} className="flex justify-end" data-testid={`message-user-${message.id}`}><div className="max-w-[78%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3.5 text-[13px] leading-relaxed text-primary-foreground shadow-[0_7px_20px_rgba(49,108,89,0.12)] sm:max-w-[68%]">{message.content}</div></div> : <AssistantMessage key={message.id} message={message} />)}{chat.isPending && <div className="flex gap-3.5" data-testid="loading-chat"><div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground"><Leaf className="h-4 w-4" /></div><div className="rounded-2xl rounded-tl-sm border border-border bg-background px-5 py-4"><div className="flex gap-1.5"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#789052]" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#789052] [animation-delay:150ms]" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#789052] [animation-delay:300ms]" /></div></div></div>}{chat.isError && <div className="ml-11 flex flex-wrap items-center gap-2 rounded-xl border border-[#e6c1a7] bg-[#fbefe7] px-3.5 py-3 text-xs text-[#704333]" data-testid="error-chat"><CircleAlert className="h-4 w-4 shrink-0" /><span className="flex-1">Nala could not answer this time. Check that the local model is available, then try again.</span><button type="button" onClick={() => sendQuestion(messages[messages.length - 1]?.content ?? '', true)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#704333] px-2.5 py-1.5 font-semibold text-[#fff4ec] transition hover:bg-[#583328]" data-testid="button-retry-chat"><RefreshCw className="h-3 w-3" /> Retry</button></div>}</div>}
      </div>

      <div className="border-t border-border/80 pt-4">
        <form onSubmit={(event) => { event.preventDefault(); sendQuestion(draft); }} className="relative" data-testid="form-ask-nala">
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} disabled={chat.isPending} maxLength={4000} rows={2} placeholder="Ask about your crop, soil, or next field decision..." className="min-h-[82px] w-full resize-none rounded-2xl border border-border bg-background px-4 py-3.5 pr-14 text-sm leading-relaxed text-foreground outline-none transition placeholder:text-muted-foreground/65 focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-70" data-testid="input-ask-nala" />
          <button type="submit" disabled={!draft.trim() || chat.isPending} aria-label="Send question to Nala" className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition hover:-translate-y-0.5 hover:bg-[#ebd85e] disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-send-question"><Send className="h-4 w-4" /></button>
        </form>
        <div className="mt-2 flex items-center justify-between px-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground"><span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-[#668440]" /> stays on device</span><span>{draft.length}/4000</span></div>
        {knowledge && knowledge.length > 0 && <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#f1f0da] px-3 py-2 text-[10px] text-[#65704d]" data-testid="text-chat-context"><Activity className="h-3.5 w-3.5" /> Nala has {knowledge.length} local references available for context.</div>}
      </div>
    </section>
  );
}

function OverviewRail({ knowledge, health }: { knowledge: KnowledgeItem[] | undefined; health: HealthQuery }) {
  const topics = Array.from(new Set((knowledge ?? []).map((item) => item.topic).filter(Boolean))).slice(0, 4);
  return (
    <aside className="space-y-4" data-testid="aside-overview">
      <div className="rounded-[22px] border border-border bg-[#f3e8c9] p-5">
        <div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#786742]">System pulse</span><Activity className="h-4 w-4 text-[#aa8751]" /></div>
        <div className="mt-5 flex items-end gap-3"><span className="font-display text-4xl font-bold tracking-[-0.07em] text-[#3e4d35]">{health.isError ? '—' : '100'}</span><span className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[#786742]">local health</span></div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e1d3aa]"><div className="h-full w-full rounded-full bg-[#789052]" /></div>
        <div className="mt-3 flex justify-between text-[10px] text-[#786742]"><span>{health.isFetching ? 'Checking engine' : 'All local services ready'}</span><span>01 / 01</span></div>
      </div>
      <div className="rounded-[22px] border border-border bg-card p-5">
        <div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.17em] text-muted-foreground">Knowledge map</span><span className="font-mono text-[10px] text-[#668440]">{knowledge?.length ?? 0}</span></div>
        <div className="mt-5 space-y-3">{topics.length ? topics.map((topic, index) => <div key={topic} className="flex items-center gap-3"><span className={`h-2 w-2 rounded-full ${['bg-[#789052]', 'bg-[#d3ad56]', 'bg-[#c87856]', 'bg-[#8e9e63]'][index]}`} /><span className="flex-1 truncate text-xs text-foreground">{topic}</span><span className="font-mono text-[9px] text-muted-foreground">{(knowledge ?? []).filter((item) => item.topic === topic).length}</span></div>) : <p className="text-xs leading-relaxed text-muted-foreground">Topics will appear when the local pack is available.</p>}</div>
        <div className="mt-5 border-t border-border pt-4 text-[10px] leading-relaxed text-muted-foreground">Every answer includes its local references and runtime details.</div>
      </div>
      <div className="rounded-[22px] border border-[#bdc998] bg-[#e6e9c4] p-5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.17em] text-[#56643b]"><RotateCcw className="h-3.5 w-3.5" /> Designed for the field</div>
        <p className="mt-4 font-display text-[17px] font-bold leading-snug tracking-[-0.03em] text-[#30442e]">Useful beats impressive.</p>
        <p className="mt-2 text-xs leading-relaxed text-[#65704d]">Nala works without a connection, so advice is available when the signal is not.</p>
      </div>
    </aside>
  );
}

function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const health = useHealthCheck<HealthStatus>();
  const knowledge = useListKnowledge();
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="flex min-h-[100dvh]">
        <Sidebar health={health} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="min-w-0 flex-1">
          <TopBar health={health} onMenu={() => setMobileOpen(true)} />
          <main className="mx-auto max-w-[1540px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            <Greeting health={health} />
            <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_286px]">
              <div className="min-w-0"><ChatPanel knowledge={knowledge.data} /><div className="mt-10"><KnowledgePanel knowledge={knowledge.data} isLoading={knowledge.isLoading} isError={knowledge.isError} onRetry={() => knowledge.refetch()} /></div></div>
              <OverviewRail knowledge={knowledge.data} health={health} />
            </div>
          </main>
          <footer className="mx-auto flex max-w-[1540px] flex-col gap-2 border-t border-border/70 px-5 py-6 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10"><span>Nalima / local agricultural intelligence</span><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#789052]" /> no cloud connection</span></footer>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
