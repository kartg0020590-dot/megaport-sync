'use client'
import { useState, useEffect, useRef } from 'react'
import festivalData from '../../data.json'
import { supabase } from '@/lib/supabaseClient'
import html2canvas from 'html2canvas'

// ======================================================
// 💡 開發者參數配置區 (WATERMARK & MARKER CONFIG)
// ======================================================
const WATERMARK_CONFIG = {
  // 年份組 (2026)
  yearFont: "system-ui, -apple-system, sans-serif",
  yearWeight: '100',      
  yearSize: 155,        
  yearRight: 208,        
  yearBottom: 547,      
  yearSpacing: '-13px',  
  yearScaleX: 1.42,      
  yearScaleY: 1.15,      
  yearColor: '#D1D5DB', 

  // 日期組 (0321 / 0322)
  dateFont: "'Arial Black', 'Arial-BoldMT', 'Arial', sans-serif",
  dateWeight: '900',     
  dateSize: 165,        
  dateRight: 197,        
  dateBottom: 414,       
  dateSpacing: '-15px', 
  dateScaleX: 1.15,      
  dateScaleY: 1.1,      
  dateColor: '#FAD390', 

  // 💡 21:50 輸出版純字標記手動調校 (僅影響輸出桌面)
  markerSize: 24,         
  markerBottom: 155,      // 👈 你可以在這裡調整上下
  markerSide: 60,         // 👈 距離左右邊緣
  
  opacity: 0.8,         
  zIndex: 999           
};

const STAGE_THEME: Record<string, { bg: string, text: string }> = {
  '南霸天': { bg: '#C5D8A4', text: '#000000' }, '海龍王': { bg: '#BDBEDD', text: '#000000' },
  '女神龍': { bg: '#E5B6CD', text: '#000000' }, '海波浪': { bg: '#AFDCE6', text: '#000000' },
  '卡魔麥': { bg: '#EABDB6', text: '#000000' }, 
  '出頭天': { bg: '#EDDBA4', text: '#000000' }, '大雄丸': { bg: '#E8ADB0', text: '#000000' },
  '藍寶石': { bg: '#A4C3D8', text: '#000000' }, '青春夢': { bg: '#ECC3B2', text: '#000000' }, 
  '小港祭': { bg: '#A68C83', text: '#FFFFFF' }
};

const STAGE_THEME_WALLPAPER: Record<string, { bg: string, text: string }> = {
  '南霸天': { bg: '#B5D38A', text: '#000000' }, 
  '海龍王': { bg: '#A9ABD6', text: '#000000' },
  '女神龍': { bg: '#E09DC1', text: '#000000' },
  '海波浪': { bg: '#8ED2E1', text: '#000000' },
  '卡魔麥': { bg: '#E59C90', text: '#000000' },
  '出頭天': { bg: '#E9D08A', text: '#000000' },
  '大雄丸': { bg: '#E29195', text: '#000000' },
  '藍寶石': { bg: '#8AB4D3', text: '#000000' },
  '青春夢': { bg: '#E7AD95', text: '#000000' },
  '小港祭': { bg: '#A68C83', text: '#000000' }
};

function WallpaperLayout({ date, bgColor, textColor, wallpaperRef, selectedShows, mode, contactInfo }: any) {
  const wallpaperDayData = (festivalData as any)[date] || {};
  const dayNum = date.split('-')[2];
  const isDay1 = date === '2026-03-21';
  const chars = isDay1 ? ['人', '生', '。'] : ['音', '樂', '。'];
  const fullDateStr = isDay1 ? '0321' : '0322';

  return (
    <div style={{ position: 'absolute', left: '-9999px', top: '0', pointerEvents: 'none' }}>
      <div ref={wallpaperRef} id="wallpaper-render-target" style={{ width: '1242px', height: '2688px', backgroundColor: mode === 'static' ? '#000000' : bgColor, backgroundImage: mode === 'static' ? 'url(/megaport_static_bg.png)' : 'none', backgroundSize: 'cover', backgroundPosition: 'center', fontFamily: 'var(--font-noto-jp), sans-serif', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ height: '25%' }} />
        <div style={{ height: '75%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {mode === 'generated' && (
            <div style={{ top: '-1225px', right: '-560px', opacity: 0.95, zIndex: 0, position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1' }}>
              {chars.map((char, idx) => (
                <span key={idx} style={{ color: textColor, fontWeight: 900, fontStyle: 'normal', display: 'block', position: 'relative', ...(char === '。' ? { marginTop: '-450px', marginLeft: '1280px', fontSize: '900px' } : { fontSize: '1240px' }) }}>{char}</span>
              ))}
            </div>
          )}

          {/* 浮水印組 */}
          <div style={{ position: 'absolute', right: `${WATERMARK_CONFIG.yearRight}px`, bottom: `${WATERMARK_CONFIG.yearBottom}px`, zIndex: WATERMARK_CONFIG.zIndex, pointerEvents: 'none', fontFamily: WATERMARK_CONFIG.yearFont, fontWeight: WATERMARK_CONFIG.yearWeight, transformOrigin: 'right bottom', transform: `scale(${WATERMARK_CONFIG.yearScaleX}, ${WATERMARK_CONFIG.yearScaleY})` }}>
             <span style={{ fontSize: `${WATERMARK_CONFIG.yearSize}px`, color: WATERMARK_CONFIG.yearColor, opacity: WATERMARK_CONFIG.opacity, letterSpacing: WATERMARK_CONFIG.yearSpacing }}>2026</span>
          </div>
          <div style={{ position: 'absolute', right: `${WATERMARK_CONFIG.dateRight}px`, bottom: `${WATERMARK_CONFIG.dateBottom}px`, zIndex: WATERMARK_CONFIG.zIndex + 1, pointerEvents: 'none', fontFamily: WATERMARK_CONFIG.dateFont, fontWeight: WATERMARK_CONFIG.dateWeight, fontVariantNumeric: 'tabular-nums', transformOrigin: 'right bottom', transform: `scale(${WATERMARK_CONFIG.dateScaleX}, ${WATERMARK_CONFIG.dateScaleY})` }}>
             <span style={{ fontSize: `${WATERMARK_CONFIG.dateSize}px`, color: WATERMARK_CONFIG.dateColor, opacity: WATERMARK_CONFIG.opacity, letterSpacing: WATERMARK_CONFIG.dateSpacing }}>{fullDateStr}</span>
          </div>

          <div style={{ position: 'relative', zIndex: 10, mixBlendMode: 'overlay', transform: 'scale(0.53)', marginTop: '226px', transformOrigin: 'top center' }}>
            {/* 💡 輸出版：維持 56 列 */}
            <div style={{ display: 'grid', gridTemplateColumns: '100px repeat(10, 200px) 100px', gridTemplateRows: '80px repeat(56, 45px)', minWidth: '2200px', backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '2px solid rgba(0,0,0,0.2)', position: 'relative' }}>
                <div style={{ gridColumn: '1', gridRow: '1', backgroundColor: '#000000', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '42px', borderBottom: '1px solid #000', paddingBottom: '60px' }}>{dayNum}</div>
                {Object.keys(STAGE_THEME_WALLPAPER).map((s, idx) => (
                  <div key={s} style={{ gridColumnStart: idx + 2, gridRow: '1', borderBottom: '1px solid #D1D5DB', borderRight: '1px solid #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '42px', backgroundColor: STAGE_THEME_WALLPAPER[s].bg, color: '#000000', paddingBottom: '45px' }}>{s}</div>
                ))}
                <div style={{ gridColumn: '12', gridRow: '1', backgroundColor: '#000000', color: '#FFFFFF', borderBottom: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '42px', paddingBottom: '60px' }}>{dayNum}</div>
                {Object.keys(STAGE_THEME_WALLPAPER).map((_, idx) => (<div key={`bg-col-${idx}`} style={{ gridColumnStart: idx + 2, gridRow: '2 / 60', borderRight: '1px solid #D1D5DB', backgroundColor: idx % 2 === 0 ? 'rgba(161, 161, 170, 0.6)' : 'transparent' }}></div>))}
                
                {Array.from({ length: 56 }).map((_, i) => {
                  const minutes = (12 * 60 + 30 + i * 10);
                  const timeStr = `${Math.floor(minutes / 60)}:${minutes % 60 === 0 ? '00' : minutes % 60}`;
                  return (
                    <div key={`grid-row-${i}`} className="contents">
                      <div style={{ gridColumn: '1', gridRowStart: i + 2, backgroundColor: '#FFF9E1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #000', borderBottom: '1px solid #D1D5DB', transform: 'translateY(-75%)', fontSize: '24px', fontWeight: 700, color: '#333' }}>{timeStr}</div>
                      <div style={{ gridColumn: '12', gridRowStart: i + 2, backgroundColor: '#FFF9E1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #000', borderBottom: '1px solid #D1D5DB', transform: 'translateY(-75%)', fontSize: '24px', fontWeight: 700, color: '#333' }}>{timeStr}</div>
                      <div style={{ gridColumn: '2 / 12', gridRowStart: i + 2, pointerEvents: 'none', zIndex: 10, borderBottom: (minutes % 60 === 50) ? '5px solid #000' : '1px solid rgba(0,0,0,0.1)' }}></div>
                    </div>
                  )
                })}

                {/* 💡 21:50 純文字標記 (輸出版手動對位) */}
                <div style={{ position: 'absolute', bottom: `${WATERMARK_CONFIG.markerBottom}px`, left: `${WATERMARK_CONFIG.markerSide}px`, fontSize: `${WATERMARK_CONFIG.markerSize}px`, fontWeight: 700, color: '#333', zIndex: 100 }}>21:50</div>
                <div style={{ position: 'absolute', bottom: `${WATERMARK_CONFIG.markerBottom}px`, right: `${WATERMARK_CONFIG.markerSide}px`, fontSize: `${WATERMARK_CONFIG.markerSize}px`, fontWeight: 700, color: '#333', zIndex: 100 }}>21:50</div>

                {Object.keys(STAGE_THEME_WALLPAPER).map((stage, colIndex) => {
                  const shows = wallpaperDayData[stage] || [];
                  return shows.map((show: any) => {
                    const isMe = selectedShows.some((s: any) => String(s.performance_id) === String(show.id));
                    const startRow = Math.floor(((Number(show.start.split(':')[0]) * 60 + Number(show.start.split(':')[1])) - (12 * 60 + 30)) / 10) + 2;
                    const endRow = Math.floor(((Number(show.end.split(':')[0]) * 60 + Number(show.end.split(':')[1])) - (12 * 60 + 30)) / 10) + 2;
                    const theme = STAGE_THEME_WALLPAPER[stage];
                    return (
                      <div key={show.id} style={{ gridRow: `${startRow} / ${endRow}`, gridColumnStart: colIndex + 2, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', zIndex: isMe ? 100 : 30, backgroundColor: isMe ? '#E85427' : theme.bg, opacity: 1 }}>
                        <p style={{ fontWeight: 900, fontSize: '36px', color: isMe ? '#FFFFFF' : theme.text, whiteSpace: 'pre-line', transform: 'translateY(-14px)' }}>{show.artist}</p>
                      </div>
                    );
                  });
                })}
            </div>
          </div>
        </div>
        {contactInfo && (
          <div style={{ position: 'absolute', bottom: '80px', left: '60px', color: mode === 'static' ? '#FFFFFF' : textColor, fontSize: '32px', fontWeight: 900, textAlign: 'left', zIndex: 50, opacity: 0.8 }}>
            大港開唱，拾獲請聯繫：{contactInfo}。感謝您的協助。
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showContactPrompt, setShowContactPrompt] = useState(false); 
  const [memberList, setMemberList] = useState<any[]>([]);
  const [contactNumber, setContactNumber] = useState(''); 
  const [wallpaperBg, setWallpaperBg] = useState('#000000');
  const [wallpaperText, setWallpaperText] = useState('#E85427');
  const [wallpaperMode, setWallpaperMode] = useState<'generated' | 'static'>('generated');
  
  // 💡 完整保留彈窗邏輯所需狀態
  const [detailShow, setDetailShow] = useState<any>(null);
  const [compareMemberEmail, setCompareMemberEmail] = useState<string | null>(null); 
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const wallpaperRef = useRef<HTMLDivElement>(null);
  const isOverview = zoom < 0.5;

  useEffect(() => {
    setMounted(true);
    const savedEmail = localStorage.getItem('megaport_email');
    const savedSquadId = localStorage.getItem('megaport_squad_id');
    const savedDate = localStorage.getItem('megaport_current_date');
    if (savedDate) setCurrentDate(savedDate);
    if (savedEmail) { setEmail(savedEmail); fetchMySquads(savedEmail, savedSquadId); }
  }, []);

  useEffect(() => { if (currentSquad) { fetchSelections(); fetchSquadMembers(); } }, [currentSquad, currentDate]);

  const fetchMySquads = async (e: string, autoSelectId?: string | null) => {
    const { data } = await supabase.from('squad_members').select('squads(*)').eq('user_email', e);
    if (data) {
      const squadList = data.map(i => i.squads);
      setSquads(squadList);
      if (autoSelectId) {
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

  const handleToggle = async (show: any) => {
    if (!email) return;
    const mine = allSelections.find(s => s.user_email === email && String(s.performance_id) === String(show.id));
    if (mine) { await supabase.from('user_selections').delete().eq('id', mine.id); } 
    else { await supabase.from('user_selections').insert([{ user_email: email, user_name: userName, performance_id: String(show.id), artist_name: show.artist }]); }
    fetchSelections();
  };

  const handlePointerDown = (show: any) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => { isLongPress.current = true; setDetailShow(show); }, 500); 
  };

  const handlePointerUp = (show: any) => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    if (!isLongPress.current) handleToggle(show); 
  };

  const handleMemberColorChange = async (newColor: string) => {
    setUserColor(newColor);
    if (currentSquad && email) {
      await supabase.from('squad_members').update({ user_color: newColor }).eq('squad_id', currentSquad.id).eq('user_email', email);
      fetchSquadMembers();
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('🚨 確定要徹底刪除帳號嗎？')) return;
    try {
      await supabase.from('user_selections').delete().eq('user_email', email);
      await supabase.from('squad_members').delete().eq('user_email', email);
      localStorage.removeItem('megaport_email');
      localStorage.removeItem('megaport_squad_id');
      setIsLogin(false);
      setCurrentSquad(null);
    } catch (err) { alert('刪除失敗'); }
  };

  const selectSquad = async (squad: any) => {
    const { data } = await supabase.from('squad_members').select('user_name, user_color').eq('squad_id', squad.id).eq('user_email', email).single();
    if (data) { setUserName(data.user_name); setUserColor(data.user_color); }
    localStorage.setItem('megaport_squad_id', squad.id);
    setCurrentSquad(squad);
  };

  const handleJoinOrCreate = async (mode: 'join' | 'create') => {
    if (!userName.trim()) return alert('請輸入名稱');
    if (mode === 'join') {
      const { data: s } = await supabase.from('squads').select('*').eq('invite_code', inviteCode.trim()).single();
      if (s) {
        await supabase.from('squad_members').upsert([{ squad_id: s.id, user_email: email, user_name: userName, user_color: userColor }]);
        fetchMySquads(email); selectSquad(s);
      } else alert('邀請碼不正確');
    } else {
      const sName = prompt('新小隊名稱：');
      if (!sName) return;
      let code = `MEGA-${Math.floor(100000 + Math.random() * 900000)}`;
      const { data: ns } = await supabase.from('squads').insert([{ squad_name: sName, invite_code: code }]).select().single();
      if (ns) {
        await supabase.from('squad_members').insert([{ squad_id: ns.id, user_email: email, user_name: userName, user_color: userColor }]);
        fetchMySquads(email); selectSquad(ns);
      }
    }
  };

  const executeDownload = async (mode: string) => {
    if (!wallpaperRef.current) return;
    setShowColorPicker(false);
    setShowContactPrompt(false);
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(wallpaperRef.current!, { 
          scale: 1, 
          useCORS: true,
          windowWidth: 1242,   // 👈 強制設定渲染窗口寬度，防止手機系統縮放干擾
          windowHeight: 2688
        });
        const link = document.createElement('a');
        link.download = `megaport_${currentDate.split('-')[2]}日桌面_${mode}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) { alert('生成失敗'); }
    }, 300);
  };

  if (!mounted) return null;
  const gridData = (festivalData as any)[currentDate] || {};
  const dayNum = currentDate.split('-')[2];
  const comparedMember = memberList.find(m => m.user_email === compareMemberEmail);

  if (!isLogin) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-8 text-black font-sans">
      <h1 className="text-4xl font-black italic mb-10 underline decoration-[#E85427]">MEGAPORT SYNC</h1>
      <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="帳號" className="w-full max-w-xs p-4 border-2 border-zinc-100 rounded-2xl font-bold mb-4 outline-none text-black" />
      <button onClick={() => fetchMySquads(email)} className="w-full max-w-xs bg-black text-white py-4 rounded-2xl font-black shadow-lg">進入系統</button>
    </div>
  );

  if (!currentSquad) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-8 text-black overflow-auto font-sans relative">
      <h2 className="text-xl font-black mb-6 text-zinc-400 uppercase tracking-widest text-black">我的小隊清單</h2>
      <div className="w-full max-w-xs space-y-3 mb-10 text-black">
        {squads.map(s => (<button key={s.id} onClick={() => selectSquad(s)} className="w-full p-4 bg-zinc-50 border rounded-2xl font-bold text-left hover:bg-zinc-100 transition-all text-black">{s.squad_name}</button>))}
      </div>
      <div className="w-full max-w-xs space-y-4 pt-6 border-t border-zinc-100 text-black">
        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="顯示大名" className="w-full p-4 border-2 border-zinc-100 rounded-2xl font-bold outline-none text-black" />
        <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="MEGA-XXXXXX" className="w-full p-4 border-2 border-zinc-100 rounded-2xl font-bold outline-none text-black" />
        <button onClick={() => handleJoinOrCreate('join')} className="w-full bg-black text-white py-4 rounded-2xl font-black shadow-lg text-white">加入現有小隊</button>
        <button onClick={() => handleJoinOrCreate('create')} className="w-full text-zinc-400 text-xs underline font-bold mt-2">建立新小隊</button>
        <div className="pt-10"><button onClick={handleDeleteAccount} className="w-full bg-red-500 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all text-xs tracking-widest text-white">刪除帳號</button></div>
      </div>
    </div>
  );

  return (
    <main className="h-screen flex flex-col bg-white overflow-hidden text-black font-sans relative">
      <div className="p-4 bg-white border-b border-zinc-300 flex justify-between items-center z-50 shrink-0 text-black">
        <div className="flex flex-col text-left leading-none text-black">
          <div className="flex items-center gap-1.5">
            <div className="flex flex-col cursor-pointer group" onClick={() => { localStorage.removeItem('megaport_squad_id'); setCurrentSquad(null); }}>
              <div className="flex items-baseline gap-1">
                <span className="font-black text-[10px] uppercase group-hover:text-[#E85427] transition-colors text-black">{currentSquad?.squad_name}</span>
                <span className="text-[8px] font-bold text-[#E85427] bg-[#E85427]/10 px-1 py-0.5 rounded tracking-tighter">{currentSquad?.invite_code}</span>
              </div>
            </div>
            <button onClick={() => setShowMembers(true)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full transition-all shadow-sm ${compareMemberEmail ? 'bg-black text-white' : 'bg-zinc-100 text-black'}`}>
              <span className="text-[10px]">{compareMemberEmail ? '🎯' : '👥'}</span>
              <span className="text-[8px] font-black uppercase tracking-wider">{compareMemberEmail ? comparedMember?.user_name : '成員'}</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-black">
          <div className="flex items-center gap-1 bg-zinc-50 px-2 py-1.5 rounded-full border border-zinc-200 shadow-sm text-black">
            <span className="text-[7px] font-black text-zinc-400 uppercase">ICON:</span>
            <input type="color" value={userColor} onChange={e => handleMemberColorChange(e.target.value)} className="w-3.5 h-3.5 rounded-full bg-transparent border-none cursor-pointer" />
          </div>
          <button onClick={() => setZoom(zoom === 0.9 ? 0.28 : 0.9)} className="px-2 py-1.5 bg-zinc-100 rounded-full text-[11px] shadow-sm text-black">{zoom === 0.9 ? "🌍" : "🔎"}</button>
          <div className="flex bg-zinc-100 rounded-lg p-0.5 shadow-sm text-black">
            {['2026-03-21', '2026-03-22'].map(d => (<button key={d} onClick={() => { setCurrentDate(d); localStorage.setItem('megaport_current_date', d); }} className={`px-2 py-1.5 rounded-md text-[8px] font-black ${currentDate === d ? 'bg-black text-white' : 'text-zinc-400'}`}>{d.split('-')[2]}</button>))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md p-3 rounded-3xl border border-zinc-200 shadow-2xl flex flex-col gap-2 pointer-events-auto text-black">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center border-b border-zinc-100 pb-1.5 mb-0.5">輸出桌面</span>
          <button onClick={() => { setWallpaperMode('generated'); setShowColorPicker(true); }} className="bg-black text-white px-4 py-2.5 rounded-2xl font-black text-[10px] shadow-lg active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap text-white">📲 人生音樂版</button>
          <button onClick={() => { setWallpaperMode('static'); setShowContactPrompt(true); }} className="bg-[#E85427] text-white px-4 py-2.5 rounded-2xl font-black text-[10px] shadow-lg active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap text-white">📍 地圖版</button>
        </div>
      </div>

      {/* 彈窗組 */}
      {showMembers && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 text-black" onClick={() => setShowMembers(false)}>
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-4"><h3 className="text-lg font-black uppercase text-black">小隊成員</h3>{compareMemberEmail && <button onClick={() => setCompareMemberEmail(null)} className="text-[10px] font-bold text-zinc-400 underline">清除對照</button>}</div>
            <div className="space-y-3 max-h-[40vh] overflow-auto pr-2 text-black">{memberList.map((m, i) => (
                <div key={i} onClick={() => { if(m.user_email !== email) { setCompareMemberEmail(m.user_email === compareMemberEmail ? null : m.user_email); setShowMembers(false); } }} className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${m.user_email === compareMemberEmail ? 'bg-black border-black text-white' : 'bg-zinc-50'}`}>
                  <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white shadow-sm" style={{ backgroundColor: m.user_color }}>{m.user_name?.charAt(0).toUpperCase()}</div><span className={`font-bold text-sm ${m.user_email === compareMemberEmail ? 'text-white' : 'text-black'}`}>{m.user_name}</span></div>
                </div>
              ))}</div>
            <button onClick={() => { if(confirm('確定退出目前小隊？')) { supabase.from('squad_members').delete().eq('squad_id', currentSquad.id).eq('user_email', email).then(() => { localStorage.removeItem('megaport_squad_id'); setCurrentSquad(null); setShowMembers(false); fetchMySquads(email); }); } }} className="w-full py-4 bg-zinc-100 text-black font-black rounded-2xl text-sm">退出目前小隊</button>
          </div>
        </div>
      )}

      {detailShow && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[120] flex items-center justify-center p-6 text-black" onClick={() => setDetailShow(null)}>
          <div className="bg-white w-full max-w-xs rounded-[40px] p-10 shadow-2xl space-y-8 flex flex-col items-center animate-in fade-in zoom-in duration-200 text-black" onClick={e => e.stopPropagation()}>
            <div className="text-center space-y-2 text-black"><h3 className="text-2xl font-black italic underline decoration-[#E85427] tracking-tighter text-black">{detailShow.artist}</h3><p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{detailShow.start} — {detailShow.end}</p></div>
            <div className="w-full bg-zinc-50 rounded-3xl p-6 space-y-4 max-h-[30vh] overflow-auto text-black text-black">
              <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest block mb-2">已選取隊友</span>
              <div className="space-y-3">{allSelections.filter(s => String(s.performance_id) === String(detailShow.id)).map((attendee, idx) => {
                  const m = memberList.find(ml => ml.user_email === attendee.user_email);
                  return (
                    <div key={idx} onClick={() => { if(attendee.user_email !== email) { setCompareMemberEmail(attendee.user_email === compareMemberEmail ? null : attendee.user_email); setDetailShow(null); } }} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${attendee.user_email === compareMemberEmail ? 'bg-black text-white' : ''}`}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-white text-[10px] shadow-sm" style={{ backgroundColor: m?.user_color || '#000' }}>{(m?.user_name || attendee.user_name || '?').charAt(0).toUpperCase()}</div><span className="font-bold text-sm">{m?.user_name || attendee.user_name}</span>
                    </div>
                  );
                })}</div>
            </div>
            <button onClick={() => setDetailShow(null)} className="w-full py-4 bg-black text-white rounded-2xl font-black shadow-lg">返回課表</button>
          </div>
        </div>
      )}

      {showColorPicker && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-6 text-black">
          <div className="bg-white w-full max-w-xs rounded-3xl p-8 shadow-2xl flex flex-col items-center space-y-6 text-black text-black"><h3 className="text-xl font-black italic underline decoration-[#E85427] text-black">人生音樂版輸出</h3>
            <div className="flex flex-col gap-4 w-full"><div className="flex justify-between items-center w-full px-2 font-bold text-xs"><span>背景色</span><input type="color" value={wallpaperBg} onChange={e => setWallpaperBg(e.target.value)} className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer" /></div><div className="flex justify-between items-center w-full px-2 font-bold text-xs"><span>大字色</span><input type="color" value={wallpaperText} onChange={e => setWallpaperText(e.target.value)} className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer" /></div><div className="w-full pt-2"><span className="text-[10px] font-black text-zinc-400 uppercase mb-2 block">緊急聯絡電話 (選填 / 零後台)</span><input type="text" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="09XXXXXXXX" className="w-full p-3 border border-zinc-100 bg-zinc-50 rounded-xl font-bold text-sm outline-none focus:border-[#E85427] text-black" /></div></div>
            <button onClick={() => executeDownload('generated')} className="w-full py-4 bg-[#E85427] text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-white">確認下載</button><button onClick={() => setShowColorPicker(false)} className="text-zinc-400 font-bold text-xs">取消</button>
          </div>
        </div>
      )}

      {showContactPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-6 text-black">
          <div className="bg-white w-full max-w-xs rounded-3xl p-8 shadow-2xl flex flex-col items-center space-y-6 text-black text-black"><h3 className="text-xl font-black italic underline decoration-[#E85427] text-black">地圖版輸出</h3><div className="w-full text-center"><span className="text-[10px] font-black text-zinc-400 uppercase mb-2 block">緊急聯絡電話 (選填 / 零後台)</span><input type="text" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="09XXXXXXXX" className="w-full p-4 border border-zinc-100 bg-zinc-50 rounded-2xl font-bold text-center outline-none focus:border-[#E85427] text-black text-black" /></div>
            <button onClick={() => executeDownload('static')} className="w-full py-4 bg-[#E85427] text-white font-black rounded-2xl shadow-xl active:scale-95 text-white">確認下載</button><button onClick={() => setShowContactPrompt(false)} className="text-zinc-400 font-bold text-xs text-zinc-400">取消</button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto relative bg-white overflow-auto">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${100 / zoom}%`, height: `${100 / zoom}%` }}>
           <div className="inline-grid p-10 px-20 rounded-3xl" style={{ display: 'grid', gridTemplateColumns: `100px repeat(10, 200px) 100px`, gridTemplateRows: `80px repeat(57, 45px)`, minWidth: '2200px', backgroundColor: '#FFFFFF', border: '2px solid rgba(0,0,0,0.2)' }}>
            <div className="bg-[#000000] text-[#FFFFFF] border-b border-r border-zinc-800 flex items-center justify-center font-black text-[42px]" style={{ gridColumn: '1', gridRow: '1', paddingBottom: '20px' }}>{dayNum}</div>
            {Object.keys(STAGE_THEME).map((s, idx) => (<div key={s} className="sticky top-0 z-40 border-b border-r border-zinc-300 flex items-center justify-center font-black text-[42px] bg-white text-black" style={{ gridColumnStart: idx + 2, backgroundColor: STAGE_THEME[s].bg, paddingBottom: '20px' }}>{s}</div>))}
            <div className="bg-[#000000] text-[#FFFFFF] border-b border-l border-zinc-800 flex items-center justify-center font-black text-[42px]" style={{ gridColumn: '12', gridRow: '1', paddingBottom: '20px' }}>{dayNum}</div>
            {Object.keys(STAGE_THEME).map((_, idx) => (<div key={`bg-col-${idx}`} style={{ gridColumnStart: idx + 2, gridRow: '2 / 60' }} className={`pointer-events-none z-0 border-r border-zinc-300 ${idx % 2 === 0 ? 'bg-zinc-200' : 'bg-white'}`}></div>))}
            {Array.from({ length: 57 }).map((_, i) => {
              const minutes = (12 * 60 + 30 + i * 10);
              const timeStr = `${Math.floor(minutes / 60)}:${minutes % 60 === 0 ? '00' : minutes % 60}`;
              return (
                <div key={`grid-row-${i}`} className="contents">
                  <div className="sticky left-0 z-40 bg-[#FFF9E1] flex items-center justify-center border-r border-b border-zinc-400 translate-y-[-50%] text-[24px] font-mono font-bold text-zinc-500" style={{ gridRowStart: i + 2 }}>{timeStr}</div>
                  <div className="bg-[#FFF9E1] flex items-center justify-center border-l border-b border-zinc-400 translate-y-[-50%] text-[24px] font-mono font-bold text-zinc-500" style={{ gridRowStart: i + 2, gridColumnStart: 12 }}>{timeStr}</div>
                  <div className={`pointer-events-none z-10 ${minutes % 60 === 50 ? 'border-b-[4px] border-zinc-500' : 'border-b border-zinc-300'}`} style={{ gridRowStart: i + 2, gridColumn: '2 / 12' }}></div>
                </div>
              )
            })}
            {Object.keys(STAGE_THEME).map((stage, colIndex) => {
              const shows = gridData[stage] || [];
              return shows.map((show: any) => {
                const attendees = allSelections.filter(s => String(s.performance_id) === String(show.id));
                const isMe = attendees.some(a => String(a.user_email) === String(email));
                const isComparedMember = attendees.some(a => String(a.user_email) === String(compareMemberEmail));
                const startRow = Math.floor(((Number(show.start.split(':')[0]) * 60 + Number(show.start.split(':')[1])) - (12 * 60 + 30)) / 10) + 2;
                const endRow = Math.floor(((Number(show.end.split(':')[0]) * 60 + Number(show.end.split(':')[1])) - (12 * 60 + 30)) / 10) + 2;
                const physicalSize = (isOverview ? 14 : 24) / zoom; 
                return (
                  <div key={show.id} onPointerDown={() => handlePointerDown(show)} onPointerUp={() => handlePointerUp(show)} onPointerLeave={() => { if(longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } }} className={`mx-[1px] my-[1px] flex items-center justify-center text-center cursor-pointer relative z-30 transition-all ${isMe ? 'shadow-2xl' : ''}`} style={{ gridRow: `${startRow} / ${endRow}`, gridColumnStart: colIndex + 2, backgroundColor: isMe ? '#E85427' : STAGE_THEME[stage].bg, border: isComparedMember ? '8px solid #000000' : 'none', boxSizing: 'border-box' }}>
                    <p className={`font-black tracking-tighter text-[36px] leading-[1.3] p-2 whitespace-pre-line ${isMe ? 'text-white' : 'text-black'}`}>{show.artist}</p>
                    <div className={`absolute bottom-1 left-2 max-w-[90%] flex flex-row pointer-events-none overflow-hidden ${isOverview ? '-space-x-3' : '-space-x-1.5'}`}>
                      {attendees.map((f, i) => {
                        const m = memberList.find(ml => ml.user_email === f.user_email);
                        return ( <div key={i} className="rounded-full flex items-center justify-center font-black text-white border border-black shadow-sm" style={{ backgroundColor: m?.user_color || '#000', width: `${physicalSize}px`, height: `${physicalSize}px`, fontSize: `${physicalSize * 0.45}px`, zIndex: attendees.length - i }}>{(m?.user_name || f.user_name || '?').charAt(0).toUpperCase()}</div> );
                      })}
                    </div>
                  </div>
                );
              });
            })}
          </div>
        </div>
      </div>
      <WallpaperLayout date={currentDate} bgColor={wallpaperBg} textColor={wallpaperText} wallpaperRef={wallpaperRef} selectedShows={allSelections.filter(s => s.user_email === email && String(s.performance_id).includes(currentDate.split('-')[2]))} mode={wallpaperMode} contactInfo={contactNumber} />
    </main>
  );
}