import React, { useMemo, useState } from "react"; 

type Card = {
  id: string; 
  front: string; 
  back: string; 
  known: boolean; 
  createdAt: number; 
};

const LS_KEY = "flashcard:v1"; 

function uid() {
  return crypto.randomUUID();
}

function loadCards(): Card[] {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Card[];
  } catch {
    return [];
  }
}

export default function App() {
  const [cards, setCards] = useState<Card[]>(() => loadCards());
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [onlyUnknown, setOnlyUnknown] = useState(false);
  const [flipId, setFlipId] = useState<string | null>(null);

  const persist = (next: Card[]) => {
    setCards(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  };

  const add = () => {
    const f = front.trim(); 
    const b = back.trim();
    if (!f || !b) return alert("앞/뒤 내용을 입력해주세요"); 
    const c: Card = { id: uid(), front: f, back: b, known: false, createdAt: Date.now() };
    persist([c, ...cards]);
    setFront("");
    setBack("");
  };

  const remove = (id: string) => {
    if (flipId === id) setFlipId(null);
    persist(cards.filter((c) => c.id !== id));
  };

  const toggleKnown = (id: string) => {
    persist(cards.map((c) => (c.id === id ? { ...c, known: !c.known } : c)));
  };

  const filtered = useMemo(() => {
    return onlyUnknown ? cards.filter((c) => !c.known) : cards; 
  }, [cards, onlyUnknown]);

  const stats = useMemo(() => {
    const known = cards.filter((c) => c.known).length; 
    return { total: cards.length, known, unknown: cards.length - known };
  }, [cards]);

  return (
    <div className="wrap">
      <header className="top">
        <h1>Flashcard</h1>
        <div className="pills">
          <span className="pill">전체 {stats.total}</span>
          <span className="pill">아는 카드 {stats.known}</span>
          <span className="pill">모르는 카드 {stats.unknown}</span>
        </div>
      </header>

      <section className="card">
        <h2>카드 추가</h2>
        <div className="grid">
          <input value={front} onChange={(e) => setFront(e.target.value)} placeholder="앞면 (질문/단어)" />
          <input value={back} onChange={(e) => setBack(e.target.value)} placeholder="뒷면 (정의/답)" />
          <button className="btn" onClick={add}>추가</button>
        </div>

        <label className="check">
          <input type="checkbox" checked={onlyUnknown} onChange={(e) => setOnlyUnknown(e.target.checked)} />
          <span>모르는 카드만 보기</span>
        </label>

        <p className="muted">카드는 localStorage에 저장됩니다.</p>
      </section>

      <section className="card">
        <h2>카드</h2>
        {filtered.length === 0 ? (
          <p className="muted">표시할 카드가 없습니다.</p>
        ) : (
          <div className="cards">
            {filtered.map((c) => {
              const flipped = flipId === c.id;
              return (
                <article key={c.id} className={`flash ${flipped ? "flipped" : ""}`}>
                  <button className="face" onClick={() => setFlipId(flipped ? null : c.id)}>
                    <div className="meta">
                      <span className={`badge ${c.known ? "known" : "unknown"}`}>
                        {c.known ? "Known" : "Unknown"}
                      </span>
                      <span className="hint">클릭해서 뒤집기</span>
                    </div>

                    <div className="text">
                      {flipped ? c.back : c.front}
                    </div>
                  </button>

                  <div className="actions">
                    <button className="btn ghost" onClick={() => toggleKnown(c.id)}>
                      {c.known ? "모르는 카드로" : "아는 카드로"}
                    </button>
                    <button className="btn danger" onClick={() => remove(c.id)}>삭제</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};