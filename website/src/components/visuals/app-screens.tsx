import { Check, Circle, Home, Layers, ScanLine, Search, Shirt } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Mockups of the LinenTag app, rendered in HTML. Decorative: the surrounding <Phone> carries the label. */

const dot = (c: string) => <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: c }} />;

function ScreenTitle({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-[1.35rem] font-semibold text-ink">{children}</p>;
}

function Tile({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl border border-line bg-white p-3.5 shadow-sm', className)}>{children}</div>;
}

function TabBar({ active }: { active: number }) {
  const tabs = [Home, ScanLine, Shirt, Layers];
  return (
    <div className="mt-auto flex justify-around border-t border-line pt-3">
      {tabs.map((Icon, i) => (
        <Icon key={i} className={cn('size-5', i === active ? 'text-brand-600' : 'text-slate-400')} />
      ))}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-1 text-[0.8rem]">
      <span className="text-muted">{k}</span>
      <span className="font-medium text-ink">{v}</span>
    </div>
  );
}

export function ScanResultScreen() {
  return (
    <>
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-brand-100 px-3 py-2 text-[0.78rem] font-medium text-brand-700">
        <Check className="size-4" /> Tag read
      </div>
      <Tile>
        <p className="text-[0.72rem] font-semibold tracking-wide text-accent-700 uppercase">Master Bedroom Set</p>
        <p className="mt-0.5 text-lg font-semibold text-ink">Fitted Sheet</p>
        <p className="text-[0.8rem] text-muted">King · 100% Cotton · White</p>
        <div className="mt-2 border-t border-line pt-1.5">
          <Row k="Room" v="Master bedroom" />
          <Row k="Washes" v="23" />
          <Row k="Purchased" v="Jan 2026" />
          <Row k="Status" v="In linen closet" />
        </div>
      </Tile>
      <Tile className="mt-3">
        <p className="mb-1.5 text-[0.85rem] font-semibold text-ink">All 7 pieces</p>
        {['Fitted Sheet', 'Flat Sheet', 'Duvet Cover', 'Pillowcase × 4'].map((p, i) => (
          <p key={p} className={cn('flex items-center gap-2 py-0.5 text-[0.8rem]', i === 0 ? 'font-semibold text-ink' : 'text-body')}>
            {i === 0 ? <span className="size-2 rounded-full bg-brand-600" /> : <Circle className="size-2 text-slate-300" />}
            {p}
          </p>
        ))}
      </Tile>
      <TabBar active={1} />
    </>
  );
}

export function DashboardScreen() {
  return (
    <>
      <ScreenTitle>Hi Alex!</ScreenTitle>
      <div className="mb-3 rounded-2xl bg-brand-600 px-4 py-3.5 text-center text-[0.9rem] font-semibold text-white">
        Put away laundry
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2.5">
        <Tile>
          <p className="text-2xl font-bold text-ink">42</p>
          <p className="text-[0.75rem] text-muted">Items</p>
        </Tile>
        <Tile>
          <p className="text-2xl font-bold text-ink">7</p>
          <p className="text-[0.75rem] text-muted">Sets</p>
        </Tile>
      </div>
      <p className="mb-2 text-[0.85rem] font-semibold text-ink">Recently scanned</p>
      {[
        ['Guest Room Queen', 'Flat Sheet', '2m'],
        ['Kids Twin Set', 'Pillowcase 2', '1h'],
        ['Master Bedroom Set', 'Duvet Cover', 'Yesterday'],
      ].map(([set, item, t]) => (
        <Tile key={item + set} className="mb-2 py-2.5">
          <div className="flex justify-between text-[0.8rem]">
            <span className="font-semibold text-ink">{item}</span>
            <span className="text-muted">{t}</span>
          </div>
          <p className="text-[0.72rem] text-muted">{set}</p>
        </Tile>
      ))}
      <TabBar active={0} />
    </>
  );
}

export function InventoryScreen() {
  const rooms: [string, string[], number][] = [
    ['Master bedroom', ['#3B74C4', '#3E9A5B'], 2],
    ['Guest room', ['#E0B323', '#D9659D', '#7B57B8'], 3],
    ['Kids room', ['#E07B2E'], 1],
    ['Spare room', ['#8A8F8C'], 1],
  ];
  return (
    <>
      <ScreenTitle>Sets</ScreenTitle>
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-[0.8rem] text-muted">
        <Search className="size-4" /> Search sets
      </div>
      {rooms.map(([room, colors, n]) => (
        <Tile key={room} className="mb-2.5">
          <p className="text-[0.95rem] font-semibold text-ink">{room}</p>
          <div className="mt-1 flex items-center gap-1">
            {colors.map((c) => (
              <span key={c}>{dot(c)}</span>
            ))}
            <span className="ml-1 text-[0.75rem] text-muted">
              {n} {n === 1 ? 'set' : 'sets'}
            </span>
          </div>
        </Tile>
      ))}
      <TabBar active={3} />
    </>
  );
}

export function LaundryScreen() {
  return (
    <>
      <ScreenTitle>Put away laundry</ScreenTitle>
      <div className="mb-3 rounded-xl bg-brand-100 px-3 py-2.5 text-[0.8rem] font-medium text-ink">
        ✓ Guest Room Queen is complete! Put it in the hall closet.
      </div>
      <Tile className="mb-2.5 border-2 border-brand-600">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[0.9rem] font-semibold text-ink">
            {dot('#E0B323')} Guest Room Queen
          </span>
          <span className="text-[0.85rem] font-semibold text-brand-700">5/5</span>
        </div>
      </Tile>
      <Tile>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-2 text-[0.9rem] font-semibold text-ink">
            {dot('#3B74C4')} Master Bedroom Set
          </span>
          <span className="text-[0.85rem] font-semibold text-muted">3/7</span>
        </div>
        {[
          ['Fitted Sheet', true],
          ['Flat Sheet', true],
          ['Duvet Cover', true],
          ['Pillowcase 1', false],
          ['Pillowcase 2', false],
        ].map(([p, ok]) => (
          <p key={p as string} className={cn('py-0.5 text-[0.8rem]', ok ? 'text-ink' : 'text-muted')}>
            {ok ? '✓' : '○'} {p}
          </p>
        ))}
      </Tile>
      <p className="mt-3 text-center text-[0.75rem] text-muted">8 items scanned · washes counted</p>
      <TabBar active={0} />
    </>
  );
}
