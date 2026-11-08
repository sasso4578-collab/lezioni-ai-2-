:root {
  font-family: Inter, 'Segoe UI', sans-serif;
  line-height: 1.5;
  font-weight: 500;
  color: #e2e8f0;
  background: #020817;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color-scheme: dark;
}

* { box-sizing: border-box; }

html, body, #root {
  margin: 0;
  min-height: 100%;
  background: #020817;
}

body {
  min-height: 100vh;
}

button, input {
  font: inherit;
}

button {
  border: none;
  cursor: pointer;
}

p, h1, h2, h3, dl, dd, dt {
  margin: 0;
}

.app-shell {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
  background: linear-gradient(180deg, #020817 0%, #0f172a 100%);
}

.sidebar {
  border-right: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(15, 23, 42, 0.8);
  padding: 24px 16px;
}

.brand-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 16px;
  background: rgba(30, 41, 59, 0.8);
  margin-bottom: 24px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #38bdf8, #8b5cf6);
  font-weight: 700;
}

.eyebrow {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #7dd3fc;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-item {
  width: 100%;
  text-align: left;
  border-radius: 12px;
  background: transparent;
  color: #cbd5e1;
  padding: 12px 14px;
}

.nav-item.active {
  background: rgba(56, 189, 248, 0.12);
  color: #f8fafc;
  border: 1px solid rgba(56, 189, 248, 0.25);
}

.main-panel {
  padding: 28px 32px 40px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.top-bar h1 {
  font-size: clamp(1.8rem, 4vw, 2.4rem);
}

.status-pill, .chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.08);
  color: #bbf7d0;
  border: 1px solid rgba(34, 197, 94, 0.2);
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.18);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-card span {
  color: #94a3b8;
  font-size: 13px;
}

.stat-card strong {
  font-size: 2rem;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(280px, 360px) 1fr;
  gap: 20px;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel {
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.14);
  padding: 18px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.import-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.import-panel input {
  background: rgba(15, 23, 42, 0.8);
  border: 1px dashed rgba(125, 211, 252, 0.5);
  border-radius: 14px;
  padding: 12px;
  color: #e2e8f0;
}

button.primary {
  background: linear-gradient(135deg, #38bdf8, #8b5cf6);
  color: #f8fafc;
  font-weight: 700;
  border-radius: 12px;
  padding: 12px 18px;
}

.helper-text {
  color: #94a3b8;
  font-size: 0.82rem;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.queue-item {
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.14);
  padding: 12px;
}

.queue-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(135deg, #38bdf8, #8b5cf6);
}

.recordings-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.recording-card {
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.72);
  padding: 16px;
}

.recording-card__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.recording-card__header h3 {
  margin-bottom: 6px;
}

.recording-card__header p {
  color: #94a3b8;
  font-size: 0.8rem;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(80px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.meta-grid dt {
  color: #94a3b8;
  font-size: 0.72rem;
  margin-bottom: 4px;
}

.meta-grid dd {
  font-weight: 700;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.card-actions button {
  flex: 1;
  height: 40px;
  border-radius: 10px;
  background: rgba(148, 163, 184, 0.12);
  color: #f8fafc;
}

.card-actions .danger {
  background: rgba(239, 68, 68, 0.12);
  color: #fecaca;
}

.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  text-transform: capitalize;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.tag--queued,
.tag--importing,
.tag--processing {
  background: rgba(250, 204, 21, 0.12);
  color: #fef3c7;
}

.tag--ready,
.tag--completed {
  background: rgba(34, 197, 94, 0.12);
  color: #bbf7d0;
}

.tag--failed {
  background: rgba(239, 68, 68, 0.12);
  color: #fecaca;
}

.empty-state {
  color: #94a3b8;
  padding: 24px 12px;
}

@media (max-width: 980px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    border-right: none;
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .main-panel {
    padding: 18px 14px 26px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }

  .top-bar {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
}
