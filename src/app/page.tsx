'use client'
import { useState, useEffect } from 'react'
import festivalData from '../../data.json'
import { supabase } from '@/lib/supabaseClient'

const STAGE_THEME: Record<string, { bg: string, text: string }> = {
  '南霸天': { bg: '#C5D8A4', text: '#000000' }, '海龍王': { bg: '#BDBEDD', text: '#000000' },
  '女神龍': { bg: '#E5B6CD', text: '#000000' }, '海波浪': { bg: '#AFDCE6', text: '#000000' },
  '卡魔麥': { bg: '#EABDB6', text: '#000000' }, 
  '出頭天': { bg: '#EDDBA4', text: '#000000' }, '大雄丸': { bg: '#E8ADB0', text: '#000000' },
  '藍寶石': { bg: '#A4C3D8', text: '#000000' }, '青春夢': { bg: '#ECC3B2', text: '#000000' }, 
  '小港祭': { bg: '#A68C83', text: '#FFFFFF' }
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userColor, setUserColor] = useState('#E85427');
  const [isLogin, setIsLogin] = useState(false);
  const [squads, setSquads] = useState<any[]>([]);
  const [currentSquad, setCurrentSquad] = useState<any>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [allSelections, setAllSelections] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState('2026-03-21');
  const [zoom, setZoom] = useState(1);

  const isOverview = zoom < 0.5;

  useEffect(() => {
    setMounted(true);
    const savedEmail = localStorage.getItem('megaport_email');
    if (savedEmail) { setEmail(savedEmail); fetchMySquads(savedEmail); }
  }, []);

  useEffect(() => { if (currentSquad) fetchSelections(); }, [currentSquad, currentDate]);

  const fetchMySquads = async (e: string) => {
    const { data } = await supabase.from('squad_members').select('squads(*)').eq('user_email', e);
    if (data) setSquads(data.map(i => i.squads));
    localStorage.setItem('megaport_email', e);
    setIsLogin(true);
  };

  const selectSquad = async (squad: any) => {
    const { data } = await supabase.from('squad_members').select('user_name, user_color').eq('squad_id', squad.id).eq('user_email', email).single();
    if (data) { setUserName(data.user_name); setUserColor(data.user_color); }
    setCurrentSquad(squad);
  };

  const fetchSelections = async () => {
    const { data } = await supabase.from('user_selections').select('*').eq('squad_id', currentSquad.id);
    if (data) setAllSelections(data);
  };

  const handleColorChange = async (newColor: string) => {
    setUserColor(newColor);
    if (currentSquad && email) {
      await supabase.from('squad_members').update({ user_color: newColor }).eq('squad_id', currentSquad.id).eq('user_email', email);
    }
  };

  const handleJoinOrCreate = async (mode: 'join' | 'create') => {
    if (!userName.trim()) return alert('請先輸入顯示名稱');
    if (mode === 'join') {
      const { data: s } = await supabase.from('squads').select('*').eq('invite_code', inviteCode.trim()).single();
      if (s) {
        await supabase.from('squad_members').upsert([{ squad_id: s.id, user_email: email, user_name: userName, user_color: userColor }]);
        fetchMySquads(email); selectSquad(s);
      } else alert('查無此邀請碼');
    } else {
      const sName = prompt('新小隊名稱：');
      if (!sName) return;
      const code = `MEGA-${Math.floor(100000 + Math.random() * 900000)}`;
      const { data: ns } = await supabase.from('squads').insert([{ squad_name: sName, invite_code: code }]).select().single();
      if (ns) {
        alert(`建立成功！邀請碼：${code}`);
        await supabase.from('squad_members').insert([{ squad_id: ns.id, user_email: email, user_name: userName, user_color: userColor }]);
        fetchMySquads(email); selectSquad(ns);
      }
    }
  };

  const handleToggle = async (show: any) => {
    if (!email || !currentSquad) return;
    const mine = allSelections.find(s => s.user_email === email && String(s.performance_id) === String(show.id));
    if (mine) {
      await supabase.from('user_selections').delete().eq('id', mine.id);
    } else {
      await supabase.from('user_selections').insert([{ 
        user_email: email, user_name: userName, squad_id: currentSquad.id, 
        performance_id: String(show.id), artist_name: show.artist, user_color: userColor 
      }]);
    }
    fetchSelections();
  };

  if (!mounted) return null;

  if (!isLogin) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-8 text-black font-sans">
      <h1 className="text-4xl font-black italic mb-10 underline decoration-[#E85427]">MEGAPORT SYNC</h1>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="輸入 Email 帳號" className="w-full max-w-xs p-4 border-2 border-zinc-100 rounded-2xl font-bold mb-4 outline-none text-black" />
      <button onClick={() => email && fetchMySquads(email)} className="w-full max-w-xs bg-black text-white py-4 rounded-2xl font-black shadow-lg">進入系統</button>
    </div>
  );

  if (!currentSquad) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-8 text-black overflow-auto">
      <h2 className="text-xl font-black mb-6 uppercase tracking-widest text-zinc-400">我的小隊清單</h2>
      <div className="w-full max-w-xs space-y-3 mb-10">
        {squads.map(s => (<button key={s.id} onClick={() => selectSquad(s)} className="w-full p-4 bg-zinc-50 border rounded-2xl font-bold text-left hover:bg-zinc-100 transition-all text-black">{s.squad_name}</button>))}
      </div>
      <div className="w-full max-w-xs space-y-4 pt-6 border-t border-zinc-100">
        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="顯示大名" className="w-full p-4 border-2 border-zinc-100 rounded-2xl font-bold outline-none text-black" />
        <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="輸入 6 位邀請碼" className="w-full p-4 border-2 border-zinc-100 rounded-2xl font-bold outline-none text-black" />
        <button onClick={() => handleJoinOrCreate('join')} className="w-full bg-black text-white py-4 rounded-2xl font-black">加入現有小隊</button>
        <button onClick={() => handleJoinOrCreate('create')} className="w-full text-zinc-400 text-xs underline font-bold mt-2">建立新小隊</button>
      </div>
    </div>
  );

  return (
    <main className="h-screen flex flex-col bg-white overflow-hidden text-black font-sans">
      <div className="p-4 bg-white border-b border-zinc-300 flex justify-between items-center z-50 shrink-0 shadow-sm">
        <div className="flex flex-col text-left leading-none" onClick={() => setCurrentSquad(null)}>
          <div className="flex items-baseline gap-1.5 cursor-pointer group">
            <span className="font-black text-xs uppercase group-hover:text-[#E85427] transition-colors">{currentSquad.squad_name}</span>
            <span className="text-[10px] font-bold text-[#E85427] bg-[#E85427]/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">
              {currentSquad.invite_code}
            </span>
            <span className="text-[10px] text-zinc-300 group-hover:text-zinc-500">▾</span>
          </div>
          <span className="text-[9px] text-zinc-400 mt-1.5 font-mono">{email}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1 rounded-full border border-zinc-200">
            <span className="text-[9px] font-black text-zinc-400">COLOR</span>
            <input type="color" value={userColor} onChange={e => handleColorChange(e.target.value)} className="w-6 h-6 rounded-full bg-transparent cursor-pointer border-none" />
          </div>
          <div className="flex bg-zinc-100 rounded-lg p-1">
            {['2026-03-21', '2026-03-22'].map(d => (<button key={d} onClick={() => setCurrentDate(d)} className={`px-4 py-1.5 rounded-md text-[10px] font-black ${currentDate === d ? 'bg-black text-white' : 'text-zinc-400'}`}>{d.split('-')[2]}日</button>))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative bg-white">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${100 / zoom}%`, height: `${100 / zoom}%` }}>
          <div className="inline-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: `100px repeat(10, 200px) 100px`, 
            gridTemplateRows: `80px repeat(57, 45px)`, 
            minWidth: '2320px' 
          }}>
            <div className="sticky top-0 left-0 z-50 bg-black text-white flex items-center justify-center font-black text-[42px] tracking-tighter border-b border-r border-zinc-800">
              {currentDate.split('-')[2]}
            </div>
            {Object.keys(STAGE_THEME).map((s, idx) => (
              <div key={s} className="sticky top-0 z-40 border-b border-r border-zinc-300 flex items-center justify-center font-black text-[42px] tracking-tighter uppercase leading-none bg-white text-black" style={{ gridColumnStart: idx + 2, backgroundColor: STAGE_THEME[s].bg }}>{s}</div>
            ))}
            <div className="bg-[#F4F4F4] border-b border-l border-zinc-300" style={{ gridColumnStart: 12 }}></div>
            {Array.from({ length: 58 }).map((_, i) => {
              const time = `${12 + Math.floor((30 + i * 10) / 60)}:${(30 + i * 10) % 60 === 0 ? '00' : (30 + i * 10) % 60}`;
              return (
                <div key={i} className="contents text-[24px] font-mono font-bold text-zinc-500">
                  <div className="sticky left-0 z-40 bg-[#F4F4F4] flex items-center justify-center border-r border-b border-zinc-300 translate-y-[-50%]" style={{ gridRowStart: i + 2 }}>{time}</div>
                  <div className="bg-[#F4F4F4] flex items-center justify-center border-l border-b border-zinc-300 translate-y-[-50%]" style={{ gridRowStart: i + 2, gridColumnStart: 12 }}>{time}</div>
                </div>
              )
            })}
            {Object.keys(STAGE_THEME).map((_, idx) => (<div key={`bg-${idx}`} className={`border-r border-zinc-300 pointer-events-none z-0 ${idx % 2 === 0 ? 'bg-zinc-300' : 'bg-white'}`} style={{ gridColumnStart: idx + 2, gridRow: '2 / 60' }}></div>))}
            {Array.from({ length: 58 }).map((_, i) => {
              const minutes = (12 * 60 + 30 + i * 10);
              const isHourMark = (minutes % 60 === 50); 
              return (
                <div key={`line-${i}`} className={`pointer-events-none z-10 ${isHourMark ? 'border-b-[1.5px] border-black' : 'border-b border-zinc-400/30'}`} style={{ gridRowStart: i + 2, gridColumn: '2 / 12' }}></div>
              );
            })}
            {Object.keys(STAGE_THEME).map((stage, colIndex) => {
              const shows = festivalData[currentDate]?.[stage] || [];
              return shows.map(show => {
                const attendees = allSelections.filter(s => String(s.performance_id) === String(show.id));
                const isMe = attendees.some(a => String(a.user_email) === String(email));
                const startRow = Math.floor(((Number(show.start.split(':')[0]) * 60 + Number(show.start.split(':')[1])) - (12 * 60 + 30)) / 10) + 2;
                const endRow = Math.floor(((Number(show.end.split(':')[0]) * 60 + Number(show.end.split(':')[1])) - (12 * 60 + 30)) / 10) + 2;
                const baseApparentSize = isOverview ? 14 : 24; 
                const physicalSize = baseApparentSize / zoom; 
                return (
                  <div key={show.id} onClick={() => handleToggle(show)} className={`mx-[1px] my-[1px] flex items-center justify-center text-center cursor-pointer relative z-30 transition-all ${isMe ? 'ring-[6px] ring-[#E85427] ring-inset shadow-2xl scale-[1.01]' : 'border-transparent'}`} style={{ gridRow: `${startRow} / ${endRow}`, gridColumnStart: colIndex + 2, backgroundColor: STAGE_THEME[stage].bg }}>
                    <p className="font-black tracking-tighter text-black text-[36px] leading-[0.9] p-2 pointer-events-none whitespace-pre-line">
                      {show.artist}
                    </p>
                    <div className="absolute bottom-1 left-1 flex flex-row -space-x-1 pointer-events-none">
                      {attendees.map((f, i) => (
                        <div key={i} className="rounded-full flex items-center justify-center font-black text-white border border-black shadow-sm" style={{ backgroundColor: f.user_color || '#000', width: `${physicalSize}px`, height: `${physicalSize}px`, fontSize: `${physicalSize * 0.45}px`, borderWidth: isOverview ? '0.7px' : '1px' }}>{f.user_name?.charAt(0).toUpperCase()}</div>
                      ))}
                    </div>
                  </div>
                );
              });
            })}
          </div>
        </div>
      </div>
      <div className="fixed bottom-8 right-8 z-[100]">
        <button onClick={() => setZoom(zoom === 1 ? 0.31 : 1)} className="bg-[#E85427] text-white px-8 py-5 rounded-full font-black shadow-2xl border-4 border-white text-lg active:scale-95 transition-all">
          {zoom === 1 ? "🌍 一鍵全覽" : "🔎 細節模式"}
        </button>
      </div>
    </main>
  );
}