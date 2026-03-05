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
  const [zoom, setZoom] = useState(0.28); 
  const [showMembers, setShowMembers] = useState(false); 
  const [memberList, setMemberList] = useState<any[]>([]);

  const isOverview = zoom < 0.5;

  useEffect(() => {
    setMounted(true);
    const savedEmail = localStorage.getItem('megaport_email');
    const savedSquadId = localStorage.getItem('megaport_squad_id');
    
    if (savedEmail) { 
      setEmail(savedEmail); 
      fetchMySquads(savedEmail, savedSquadId); 
    }
  }, []);

  useEffect(() => { 
    if (currentSquad) { fetchSelections(); fetchSquadMembers(); } 
  }, [currentSquad, currentDate]);

  const fetchMySquads = async (e: string, autoSelectId?: string | null) => {
    const { data } = await supabase.from('squad_members').select('squads(*)').eq('user_email', e);
    if (data) {
      const squadList = data.map(i => i.squads);
      setSquads(squadList);

      if (autoSelectId) {
        // 💡 關鍵修復：加入 (s: any) 來避開 Vercel 的類型檢查
        const targetSquad = squadList.find((s: any) => String(s.id) === String(autoSelectId));
        if (targetSquad) selectSquad(targetSquad);
      }
    }
    localStorage.setItem('megaport_email', e);
    setIsLogin(true);
  };

  const fetchSquadMembers = async () => {
    if (!currentSquad) return;
    const { data } = await supabase.from('squad_members').select('user_email, user_name, user_color').eq('squad_id', currentSquad.id);
    if (data) setMemberList(data);
  };

  const fetchSelections = async () => {
    if (!currentSquad) return;
    const { data: members } = await supabase.from('squad_members').select('user_email').eq('squad_id', currentSquad.id);
    if (members) {
      const emails = members.map(m => m.user_email);
      const { data: selections } = await supabase.from('user_selections').select('*').in('user_email', emails);
      if (selections) setAllSelections(selections);
    }
  };

  const selectSquad = async (squad: any) => {
    const { data } = await supabase.from('squad_members').select('user_name, user_color').eq('squad_id', squad.id).eq('user_email', email).single();
    if (data) { setUserName(data.user_name); setUserColor(data.user_color); }
    localStorage.setItem('megaport_squad_id', squad.id);
    setCurrentSquad(squad);
  };

  const handleColorChange = async (newColor: string) => {
    setUserColor(newColor);
    if (currentSquad && email) {
      await supabase.from('squad_members').update({ user_color: newColor }).eq('squad_id', currentSquad.id).eq('user_email', email);
      fetchSquadMembers();
    }
  };

  const handleLogin = () => {
    const accountRegex = /^[a-zA-Z0-9]{8,}$/;
    if (!accountRegex.test(email)) {
      alert("帳號格式錯誤：請輸入至少 8 位英數字組合");
      return;
    }
    fetchMySquads(email);
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
      let isUnique = false;
      let code = '';
      while (!isUnique) {
        code = `MEGA-${Math.floor(100000 + Math.random() * 900000)}`;
        const { data } = await supabase.from('squads').select('id').eq('invite_code', code).single();
        if (!data) isUnique = true;
      }
      const { data: ns } = await supabase.from('squads').insert([{ squad_name: sName, invite_code: code }]).select().single();
      if (ns) {
        alert(`建立成功！邀請碼：${code}`);
        await supabase.from('squad_members').insert([{ squad_id: ns.id, user_email: email, user_name: userName, user_color: userColor }]);
        fetchMySquads(email); selectSquad(ns);
      }
    }
  };

  const handleLeaveSquad = async () => {
    if (!confirm(`確定要退出「${currentSquad.squad_name}」嗎？`)) return;
    await supabase.from('squad_members').delete().eq('squad_id', currentSquad.id).eq('user_email', email);
    localStorage.removeItem('megaport_squad_id');
    setCurrentSquad(null); setShowMembers(false); fetchMySquads(email);
  };

  const handleToggle = async (show: any) => {
    if (!email) return;
    const mine = allSelections.find(s => s.user_email === email && String(s.performance_id) === String(show.id));
    if (mine) {
      await supabase.from('user_selections').delete().eq('id', mine.id);
    } else {
      await supabase.from('user_selections').insert([{ 
        user_email: email, user_name: userName, 
        performance_id: String(show.id), artist_name: show.artist
      }]);
    }
    fetchSelections();
  };

  if (!mounted) return null;

  if (!isLogin) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-8 text-black font-sans">
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@900&display=swap" rel="stylesheet" />
      <h1 className="text-4xl font-black italic mb-10 underline decoration-[#E85427]">MEGAPORT SYNC</h1>
      <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="輸入帳號 (登入帳號：至少 8 位英數字)" className="w-full max-w-xs p-4 border-2 border-zinc-100 rounded-2xl font-bold mb-4 outline-none text-black" />
      <button onClick={handleLogin} className="w-full max-w-xs bg-black text-white py-4 rounded-2xl font-black shadow-lg">進入系統</button>
    </div>
  );

  if (!currentSquad) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-8 text-black overflow-auto font-sans">
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@900&display=swap" rel="stylesheet" />
      <h2 className="text-xl font-black mb-6 uppercase tracking-widest text-zinc-400">我的小隊清單</h2>
      <div className="w-full max-w-xs space-y-3 mb-10 text-black">
        {squads.map(s => (<button key={s.id} onClick={() => selectSquad(s)} className="w-full p-4 bg-zinc-50 border rounded-2xl font-bold text-left hover:bg-zinc-100 transition-all text-black">{s.squad_name}</button>))}
      </div>
      <div className="w-full max-w-xs space-y-4 pt-6 border-t border-zinc-100 text-black">
        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="顯示大名 (建議單個字好辨認)" className="w-full p-4 border-2 border-zinc-100 rounded-2xl font-bold outline-none text-black" />
        <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="MEGA-XXXXXX" className="w-full p-4 border-2 border-zinc-100 rounded-2xl font-bold outline-none text-black" />
        <button onClick={() => handleJoinOrCreate('join')} className="w-full bg-black text-white py-4 rounded-2xl font-black">加入現有小隊</button>
        <button onClick={() => handleJoinOrCreate('create')} className="w-full text-zinc-400 text-xs underline font-bold mt-2">建立新小隊</button>
      </div>
    </div>
  );

  return (
    <main className="h-screen flex flex-col bg-white overflow-hidden text-black font-sans relative" style={{ fontFamily: '"Noto Sans TC", sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@900&display=swap" rel="stylesheet" />
      
      <div className="p-4 bg-white border-b border-zinc-300 flex justify-between items-center z-50 shrink-0 shadow-sm text-black">
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-2">
            <div className="flex flex-col cursor-pointer" onClick={() => {
              localStorage.removeItem('megaport_squad_id');
              setCurrentSquad(null);
            }}>
               <div className="flex items-baseline gap-1.5 group">
                <span className="font-black text-xs uppercase group-hover:text-[#E85427] transition-colors">{currentSquad.squad_name}</span>
                <span className="text-[10px] font-bold text-[#E85427] bg-[#E85427]/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">{currentSquad.invite_code}</span>
              </div>
              <span className="text-[9px] text-zinc-400 mt-1.5 font-mono">{email}</span>
            </div>
            <button onClick={() => setShowMembers(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-all shadow-sm">
              <span className="text-[12px]">👥</span>
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">成員</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(zoom === 0.9 ? 0.28 : 0.9)} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-all shadow-sm text-black">
            <span className="text-[12px]">{zoom === 0.9 ? "🌍" : "🔎"}</span>
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">{zoom === 0.9 ? "全覽" : "放大"}</span>
          </button>

          <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1.5 rounded-full border border-zinc-200 shadow-sm text-black">
            <span className="text-[8px] font-black text-zinc-400 uppercase">顏色</span>
            <input type="color" value={userColor} onChange={e => handleColorChange(e.target.value)} className="w-5 h-5 rounded-full bg-transparent cursor-pointer border-none shadow-sm" />
          </div>
          
          <div className="flex bg-zinc-100 rounded-lg p-0.5">
            {['2026-03-21', '2026-03-22'].map(d => (<button key={d} onClick={() => setCurrentDate(d)} className={`px-3 py-1.5 rounded-md text-[9px] font-black ${currentDate === d ? 'bg-black text-white' : 'text-zinc-400'}`}>{d.split('-')[2]}日</button>))}
          </div>
        </div>
      </div>

      {showMembers && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm" onClick={() => setShowMembers(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-white border-2 border-black p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-3xl w-[85%] max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-sm uppercase tracking-[0.2em] text-black">小隊成員清單 ({memberList.length})</h3>
              <button onClick={() => setShowMembers(false)} className="bg-black text-white w-8 h-8 rounded-full font-bold flex items-center justify-center">×</button>
            </div>
            <div className="space-y-4 max-h-[40vh] overflow-auto mb-8 pr-2">
              {memberList.map((m, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-zinc-100 pb-3 text-black">
                  <div className="w-8 h-8 rounded-full border-2 border-black shadow-sm" style={{ backgroundColor: m.user_color }}></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black italic">{m.user_name}</span>
                    <span className="text-[11px] text-zinc-400 font-mono tracking-tight">{m.user_email}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleLeaveSquad} className="w-full py-4 bg-red-500 text-white text-[12px] font-black rounded-2xl hover:bg-red-600 transition-all uppercase tracking-widest shadow-lg">退出這個小隊</button>
          </div>
        </>
      )}

      <div className="flex-1 overflow-auto relative bg-white">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${100 / zoom}%`, height: `${100 / zoom}%` }}>
          <div className="inline-grid" style={{ 
            display: 'grid', gridTemplateColumns: `100px repeat(10, 200px) 100px`, 
            gridTemplateRows: `80px repeat(57, 45px)`, minWidth: '2320px',
            backgroundColor: 'white' 
          }}>
            <div className="sticky top-0 left-0 z-50 bg-black text-white flex items-center justify-center font-black text-[42px] tracking-tighter border-b border-r border-zinc-800">{currentDate.split('-')[2]}</div>
            {Object.keys(STAGE_THEME).map((s, idx) => (
              <div key={s} className="sticky top-0 z-40 border-b border-r border-zinc-300 flex items-center justify-center font-black text-[42px] tracking-tighter uppercase leading-none bg-white text-black" style={{ gridColumnStart: idx + 2, backgroundColor: STAGE_THEME[s].bg }}>{s}</div>
            ))}
            <div className="bg-[#FFF9E1] border-b border-l border-zinc-300" style={{ gridColumnStart: 12 }}></div>

            {Object.keys(STAGE_THEME).map((_, idx) => (
              <div key={`bg-col-${idx}`} className={`pointer-events-none z-0 border-r border-zinc-300 ${idx % 2 === 0 ? 'bg-zinc-200' : 'bg-white'}`} style={{ gridColumnStart: idx + 2, gridRow: '2 / 60' }}></div>
            ))}

            {Array.from({ length: 58 }).map((_, i) => {
              const minutes = (12 * 60 + 30 + i * 10);
              const hour = Math.floor(minutes / 60);
              const min = minutes % 60;
              const timeStr = `${hour}:${min === 0 ? '00' : min}`;
              const isHourMark = (minutes % 60 === 0);

              return (
                <div key={`grid-row-${i}`} className="contents">
                  <div className="sticky left-0 z-40 bg-[#FFF9E1] flex items-center justify-center border-r border-b border-zinc-400 translate-y-[-50%] text-[24px] font-mono font-bold text-zinc-500" style={{ gridRowStart: i + 2 }}>{timeStr}</div>
                  <div className="bg-[#FFF9E1] flex items-center justify-center border-l border-b border-zinc-400 translate-y-[-50%] text-[24px] font-mono font-bold text-zinc-500" style={{ gridRowStart: i + 2, gridColumnStart: 12 }}>{timeStr}</div>
                  <div className={`pointer-events-none z-10 ${isHourMark ? 'border-b-[4px] border-zinc-500' : 'border-b border-zinc-300'}`} style={{ gridRowStart: i + 2, gridColumn: '2 / 12' }}></div>
                </div>
              )
            })}

            {Object.keys(STAGE_THEME).map((stage, colIndex) => {
              const shows = (festivalData as any)[currentDate]?.[stage] || [];
              return shows.map((show: any) => {
                const attendees = allSelections.filter(s => String(s.performance_id) === String(show.id));
                const isMe = attendees.some(a => String(a.user_email) === String(email));
                const startRow = Math.floor(((Number(show.start.split(':')[0]) * 60 + Number(show.start.split(':')[1])) - (12 * 60 + 30)) / 10) + 2;
                const endRow = Math.floor(((Number(show.end.split(':')[0]) * 60 + Number(show.end.split(':')[1])) - (12 * 60 + 30)) / 10) + 2;
                const baseApparentSize = isOverview ? 14 : 24; 
                const physicalSize = baseApparentSize / zoom; 
                return (
                  <div key={show.id} onClick={() => handleToggle(show)} className={`mx-[1px] my-[1px] flex flex-col items-center justify-center text-center cursor-pointer relative z-30 transition-all ${isMe ? 'shadow-2xl scale-[1.01]' : 'border-transparent'}`} style={{ gridRow: `${startRow} / ${endRow}`, gridColumnStart: colIndex + 2, backgroundColor: isMe ? '#E85427' : STAGE_THEME[stage].bg }}>
                    <p className={`font-black tracking-tighter text-[36px] leading-[1.3] p-2 pointer-events-none whitespace-pre-line ${isMe ? 'text-white' : 'text-black'}`}>{show.artist}</p>
                    <div className={`absolute bottom-1 left-2 max-w-[90%] flex flex-row pointer-events-none overflow-hidden ${isOverview ? '-space-x-3' : '-space-x-1.5'}`}>
                      {attendees.map((f, i) => {
                        const memberInfo = memberList.find(m => m.user_email === f.user_email);
                        const displayColor = memberInfo?.user_color || '#000000';
                        return (
                          <div key={i} className="rounded-full flex items-center justify-center font-black text-white border border-black shadow-sm" style={{ backgroundColor: displayColor, width: `${physicalSize}px`, height: `${physicalSize}px`, fontSize: `${physicalSize * 0.45}px`, borderWidth: isOverview ? '0.7px' : '1px', zIndex: attendees.length - i }}>{f.user_name?.charAt(0).toUpperCase()}</div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })}
          </div>
        </div>
      </div>
    </main>
  );
}