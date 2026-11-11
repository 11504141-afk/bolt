import { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, BarChart3, ChevronDown, Database, MapPin, Minus, RefreshCw, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

type VisitorRow = {
  month: string;
  attraction_name: string;
  visitor_count: number;
};

type MonthKey = '2025-12-01' | '2026-01-01';

type SortKey = 'visitor_count' | 'change' | 'name';

const fallbackRows: VisitorRow[] = [
  ['2025-12-01', '八仙洞遊憩區', 14389], ['2025-12-01', '三仙台遊憩區及周邊地區', 93653], ['2025-12-01', '東部海岸國家風景區及加路蘭休憩區', 185623], ['2025-12-01', '太麻里金針山', 1000], ['2025-12-01', '水陸生活研究館', 1445], ['2025-12-01', '卑南遺址公園', 31987], ['2025-12-01', '東管處都歷本部', 14885], ['2025-12-01', '知本森林遊樂區', 15320], ['2025-12-01', '知本溫泉', 60271], ['2025-12-01', '南湖初鹿地區', 120163], ['2025-12-01', '國立臺灣史前文化博物館', 8458], ['2025-12-01', '鹿野高臺及周邊地區', 84750], ['2025-12-01', '綠島遊憩區', 5139], ['2025-12-01', '蘭嶼', 1628], ['2025-12-01', '客家文化園區', 0], ['2025-12-01', '臺東森林公園', 84181], ['2025-12-01', '都蘭遊憩區及周邊地區', 146918], ['2025-12-01', '池上大坡池及周邊地區', 99732], ['2025-12-01', '關山小鎮地區', 94494], ['2025-12-01', '台東美術館', 11283], ['2025-12-01', '台東波浪屋', 50726], ['2025-12-01', '總遊客人次', 1126045],
  ['2026-01-01', '八仙洞遊憩區', 9595], ['2026-01-01', '三仙台遊憩區及周邊地區', 62722], ['2026-01-01', '東部海岸國家風景區及加路蘭休憩區', 51306], ['2026-01-01', '太麻里金針山', 1700], ['2026-01-01', '水陸生活研究館', 1718], ['2026-01-01', '卑南遺址公園', 21952], ['2026-01-01', '東管處都歷本部', 12917], ['2026-01-01', '知本森林遊樂區', 15175], ['2026-01-01', '知本溫泉', 53988], ['2026-01-01', '南湖初鹿地區', 55653], ['2026-01-01', '國立臺灣史前文化博物館', 10812], ['2026-01-01', '鹿野高臺及周邊地區', 68569], ['2026-01-01', '綠島遊憩區', 4411], ['2026-01-01', '蘭嶼', 1787], ['2026-01-01', '客家文化園區', 0], ['2026-01-01', '臺東森林公園', 13920], ['2026-01-01', '都蘭遊憩區及周邊地區', 95261], ['2026-01-01', '池上大坡池及周邊地區', 72317], ['2026-01-01', '關山小鎮地區', 99289], ['2026-01-01', '台東美術館', 8775], ['2026-01-01', '台東波浪屋', 51471], ['2026-01-01', '總遊客人次', 713338],
].map(([month, attraction_name, visitor_count]) => ({ month: month as string, attraction_name: attraction_name as string, visitor_count: visitor_count as number }));

const monthLabels: Record<MonthKey, string> = { '2025-12-01': '2025 年 12 月', '2026-01-01': '2026 年 1 月' };
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const formatNumber = (value: number) => new Intl.NumberFormat('zh-TW').format(value);
const formatPercent = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

function App() {
  const [rows, setRows] = useState<VisitorRow[]>(fallbackRows);
  const [selectedMonth, setSelectedMonth] = useState<MonthKey>('2026-01-01');
  const [sortKey, setSortKey] = useState<SortKey>('visitor_count');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadRows = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      const { data, error } = await supabase.from('taitung_visitor_statistics').select('month, attraction_name, visitor_count');
      if (!error && data && data.length > 0 && isMounted) setRows(data as VisitorRow[]);
      if (isMounted) setIsLoading(false);
    };
    void loadRows();
    return () => { isMounted = false; };
  }, []);

  const reloadData = async () => {
    if (!supabase) return;
    setIsRefreshing(true);
    const { data, error } = await supabase.from('taitung_visitor_statistics').select('month, attraction_name, visitor_count');
    if (!error && data && data.length > 0) setRows(data as VisitorRow[]);
    setIsRefreshing(false);
  };

  const currentRows = useMemo(() => rows.filter((row) => row.month === selectedMonth && row.attraction_name !== '總遊客人次'), [rows, selectedMonth]);
  const previousMonth: MonthKey = selectedMonth === '2026-01-01' ? '2025-12-01' : '2026-01-01';
  const previousRows = useMemo(() => rows.filter((row) => row.month === previousMonth && row.attraction_name !== '總遊客人次'), [rows, previousMonth]);
  const total = rows.find((row) => row.month === selectedMonth && row.attraction_name === '總遊客人次')?.visitor_count ?? currentRows.reduce((sum, row) => sum + row.visitor_count, 0);
  const previousTotal = rows.find((row) => row.month === previousMonth && row.attraction_name === '總遊客人次')?.visitor_count ?? previousRows.reduce((sum, row) => sum + row.visitor_count, 0);
  const totalChange = ((total - previousTotal) / previousTotal) * 100;

  const comparison = useMemo(() => currentRows.map((row) => {
    const previous = previousRows.find((item) => item.attraction_name === row.attraction_name)?.visitor_count ?? 0;
    return { ...row, previous, change: row.visitor_count - previous, changePercent: previous === 0 ? 0 : ((row.visitor_count - previous) / previous) * 100 };
  }), [currentRows, previousRows]);

  const sortedRows = [...comparison].sort((a, b) => {
    if (sortKey === 'name') return a.attraction_name.localeCompare(b.attraction_name, 'zh-Hant');
    return sortKey === 'change' ? b.change - a.change : b.visitor_count - a.visitor_count;
  });
  const topFive = [...comparison].sort((a, b) => b.visitor_count - a.visitor_count).slice(0, 5);
  const biggestGrowth = [...comparison].sort((a, b) => b.changePercent - a.changePercent)[0];
  const biggestDrop = [...comparison].sort((a, b) => a.changePercent - b.changePercent)[0];
  const topFiveShare = topFive.reduce((sum, row) => sum + row.visitor_count, 0) / total * 100;

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><BarChart3 size={20} /></div><div><p className="eyebrow">TAITUNG TOURISM INSIGHT</p><h1>台東觀光數據觀測站 <span className="brand-number">11504141</span></h1></div></div>
        <div className="header-actions"><span className="data-status"><span className="status-dot" />資料已更新</span><button className="icon-button" onClick={() => void reloadData()} aria-label="重新整理資料"><RefreshCw size={17} className={isRefreshing ? 'spin' : ''} /></button></div>
      </header>

      <section className="hero-grid">
        <div className="hero-copy"><p className="kicker"><Sparkles size={15} /> 月度觀光分析</p><h2>看見台東旅遊<br /><em>流動的風景</em></h2><p className="hero-text">掌握熱門景點變化，從人流數據讀出台東的旅遊脈動。</p><div className="month-switcher"><button className={selectedMonth === '2025-12-01' ? 'active' : ''} onClick={() => setSelectedMonth('2025-12-01')}>2025.12</button><button className={selectedMonth === '2026-01-01' ? 'active' : ''} onClick={() => setSelectedMonth('2026-01-01')}>2026.01</button></div></div>
        <div className="hero-visual"><div className="orbit orbit-large" /><div className="orbit orbit-small" /><div className="visual-center"><MapPin size={28} /><strong>{formatNumber(total)}</strong><span>本月總遊客人次</span></div><div className="floating-label label-one"><span>01</span><strong>{topFive[0]?.attraction_name ?? '—'}</strong></div><div className="floating-label label-two"><span>02</span><strong>{topFive[1]?.attraction_name ?? '—'}</strong></div></div>
      </section>

      <section className="metric-grid">
        <article className="metric-card metric-featured"><div className="metric-top"><span>本月總人次</span><span className="metric-icon"><MapPin size={16} /></span></div><strong>{formatNumber(total)}</strong><div className="metric-change"><span className={totalChange >= 0 ? 'positive' : 'negative'}>{totalChange >= 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}{formatPercent(totalChange)}</span><small>較 {monthLabels[previousMonth]}</small></div></article>
        <article className="metric-card"><div className="metric-top"><span>景點平均人次</span><span className="metric-icon soft"><BarChart3 size={16} /></span></div><strong>{formatNumber(Math.round(total / currentRows.length))}</strong><div className="metric-caption">涵蓋 {currentRows.length} 個景點</div></article>
        <article className="metric-card"><div className="metric-top"><span>最高成長景點</span><span className="metric-icon green"><TrendingUp size={16} /></span></div><strong className="metric-name">{biggestGrowth?.attraction_name ?? '—'}</strong><div className="metric-change"><span className="positive"><ArrowUpRight size={15} />{formatPercent(biggestGrowth?.changePercent ?? 0)}</span><small>月對月變化</small></div></article>
        <article className="metric-card"><div className="metric-top"><span>最大降幅景點</span><span className="metric-icon coral"><TrendingDown size={16} /></span></div><strong className="metric-name">{biggestDrop?.attraction_name ?? '—'}</strong><div className="metric-change"><span className="negative"><ArrowDownRight size={15} />{formatPercent(biggestDrop?.changePercent ?? 0)}</span><small>月對月變化</small></div></article>
      </section>

      <section className="content-grid">
        <article className="panel ranking-panel"><div className="panel-heading"><div><p className="section-label">POPULARITY RANKING</p><h3>景點熱度排行</h3></div><span className="period-pill">{monthLabels[selectedMonth]}</span></div><div className="ranking-list">{topFive.map((row, index) => <div className="rank-row" key={row.attraction_name}><span className={`rank-number rank-${index + 1}`}>{String(index + 1).padStart(2, '0')}</span><div className="rank-info"><div className="rank-label"><strong>{row.attraction_name}</strong><span>{formatNumber(row.visitor_count)}</span></div><div className="progress-track"><div className="progress-fill" style={{ width: `${topFive[0] ? row.visitor_count / topFive[0].visitor_count * 100 : 0}%` }} /></div></div></div>)}</div><div className="share-note"><div className="share-ring"><span>{topFiveShare.toFixed(0)}<small>%</small></span></div><p><strong>前五大景點</strong>貢獻本月總人次的 {topFiveShare.toFixed(1)}%，觀光人流集中度明顯。</p></div></article>
        <article className="panel trend-panel"><div className="panel-heading"><div><p className="section-label">MONTHLY COMPARISON</p><h3>月度人流對比</h3></div><div className="legend"><span><i className="dot current" />{monthLabels[selectedMonth]}</span><span><i className="dot previous" />{monthLabels[previousMonth]}</span></div></div><div className="bar-chart">{topFive.map((row) => { const max = Math.max(row.visitor_count, row.previous); return <div className="bar-group" key={row.attraction_name}><div className="bars"><div className="bar previous-bar" style={{ height: `${row.previous / max * 100}%` }} /><div className="bar current-bar" style={{ height: `${row.visitor_count / max * 100}%` }} /></div><span>{row.attraction_name.replace('及周邊地區', '').replace('遊憩區', '')}</span></div> })}</div><div className="trend-footer"><TrendingDown size={17} /><span>整體人流較上月減少 <strong>{formatNumber(previousTotal - total)}</strong> 人次，降幅主要來自東部海岸與南湖初鹿地區。</span></div></article>
      </section>

      <section className="panel table-panel"><div className="panel-heading table-heading"><div><p className="section-label">ALL DESTINATIONS</p><h3>完整景點數據</h3></div><div className="table-tools"><span className="data-source"><Database size={14} />公開觀光統計</span><label className="select-wrap"><select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}><option value="visitor_count">依本月人次</option><option value="change">依成長幅度</option><option value="name">依景點名稱</option></select><ChevronDown size={15} /></label></div></div><div className="table-scroll"><table><thead><tr><th>排名 / 景點</th><th>{monthLabels[selectedMonth]}</th><th>{monthLabels[previousMonth]}</th><th>差異人次</th><th>變化率</th></tr></thead><tbody>{sortedRows.map((row, index) => <tr key={row.attraction_name}><td><span className="table-rank">{String(index + 1).padStart(2, '0')}</span><strong>{row.attraction_name}</strong></td><td>{formatNumber(row.visitor_count)}</td><td className="muted-number">{formatNumber(row.previous)}</td><td className={row.change >= 0 ? 'positive' : 'negative'}>{row.change >= 0 ? '+' : ''}{formatNumber(row.change)}</td><td><span className={`change-pill ${row.change > 0 ? 'up' : row.change < 0 ? 'down' : 'flat'}`}>{row.change > 0 ? <ArrowUpRight size={13} /> : row.change < 0 ? <ArrowDownRight size={13} /> : <Minus size={13} />}{formatPercent(row.changePercent)}</span></td></tr>)}</tbody></table></div></section>
      <footer><span>台東觀光數據觀測站</span><span>資料期間｜2025.12 — 2026.01</span><span>{isLoading ? '資料載入中…' : '資料來源｜台東縣觀光統計'}</span></footer>
    </main>
  );
}

export default App;
