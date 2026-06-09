import { ChatWidget } from './components/ChatWidget';

export default function App() {
  return (
    <main className="app-shell">
      <section className="agent-stage" aria-label="SwiftCart AI support">
        <aside className="agent-panel" aria-label="Agent overview">
          <p className="agent-kicker">AI support desk</p>
          <h1 className="agent-title">SwiftCart assistant</h1>
          <p className="agent-copy">
            A calm, focused chat experience for quick answers about orders,
            returns, payments, and store policies.
          </p>

          <div className="agent-orbit" aria-hidden="true">
            <div className="agent-core">AI</div>
            <span className="orbit-dot orbit-dot--one" />
            <span className="orbit-dot orbit-dot--two" />
            <span className="orbit-dot orbit-dot--three" />
          </div>

          <div className="agent-stats" aria-label="Support highlights">
            <div>
              <span>Live</span>
              <strong>Online</strong>
            </div>
            <div>
              <span>Focus</span>
              <strong>Support</strong>
            </div>
            <div>
              <span>Tone</span>
              <strong>Helpful</strong>
            </div>
          </div>
        </aside>

        <ChatWidget />
      </section>
    </main>
  );
}
