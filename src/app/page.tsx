'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import festivalData from '../../data.json'
import { SPOTIFY_LINKS } from '../spotifyData'
import { supabase } from '@/lib/supabaseClient'
import html2canvas from 'html2canvas'

// ======================================================
// 💡 配置參數區
// ======================================================
const WATERMARK_CONFIG = {
  yearFont: "system-ui, -apple-system, sans-serif",
  yearWeight: '100', yearSize: 155, yearRight: 208, yearBottom: 547, yearSpacing: '-13px', yearScaleX: 1.42, yearScaleY: 1.15, yearColor: '#D1D5DB', 
  dateFont: "'Arial Black', 'Arial-BoldMT', Gadget, sans-serif",
  dateWeight: '900', dateSize: 165, dateRight: 180, dateBottom: 459, dateSpacing: -15, dateScaleX: 1.15, dateScaleY: 1.1, dateColor: '#FAD390', 
  markerSize: 24, markerBottom: 1, markerSide: 17, opacity: 0.8, zIndex: 999           
};

const STAGE_THEME: Record<string, { bg: string, text: string }> = {
  '南霸天': { bg: '#C5D8A4', text: '#000000' }, '海龍王': { bg: '#BDBEDD', text: '#000000' },
  '女神龍': { bg: '#E5B6CD', text: '#000000' }, '海波浪': { bg: '#AFDCE6', text: '#000000' },
  '卡魔麥': { bg: '#EABDB6', text: '#000000' }, '出頭天': { bg: '#EDDBA4', text: '#000000' }, 
  '大雄丸': { bg: '#E8ADB0', text: '#000000' }, '藍寶石': { bg: '#A4C3D8', text: '#000000' }, 
  '青春夢': { bg: '#ECC3B2', text: '#000000' }, '小港祭': { bg: '#A68C83', text: '#FFFFFF' }
};

const STAGE_THEME_WALLPAPER: Record<string, { bg: string, text: string }> = {
  '南霸天': { bg: '#B5D38A', text: '#000000' }, '海龍王': { bg: '#A9ABD6', text: '#000000' },
  '女神龍': { bg: '#E09DC1', text: '#000000' }, '海波浪': { bg: '#8ED2E1', text: '#000000' },
  '卡魔麥': { bg: '#E59C90', text: '#000000' }, '出頭天': { bg: '#E9D08A', text: '#000000' },
  '大雄丸': { bg: '#E29195', text: '#000000' }, '藍寶石': { bg: '#8AB4D3', text: '#000000' },
  '青春夢': { bg: '#E7AD95', text: '#000000' }, '小港祭': { bg: '#A68C83', text: '#000000' }
};

// Spotify 試聽視窗
function SpotifyModal({ artist, onClose }: { artist: any, onClose: () => void }) {
  const rawIframe = SPOTIFY_LINKS[artist?.id];
  if (!artist || !rawIframe) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[700] flex flex-col items-center justify-center p-4 animate-in fade-in duration-300 overflow-hidden text-black" onClick={onClose}>
      <div className="w-full max-w-2xl bg-[#121212] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 pb-4 flex justify-between items-start shrink-0">
          <div className="flex flex-col">
            <h3 className="text-2xl font-black text-white italic tracking-tighter leading-tight whitespace-pre-line">{artist.artist.replace(/\n/g, ' ')}</h3>
            <p className="text-xs font-bold text-[#1DB954] mt-1 uppercase tracking-widest">{artist.stage} · {artist.start}-{artist.end}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-all text-white">✕</button>
        </div>
        <div className="p-4 pt-0 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          <div className="w-full" dangerouslySetInnerHTML={{ __html: rawIframe }} />
        </div>
        <button onClick={onClose} className="w-full py-5 bg-[#242424] hover:bg-[#2a2a2a] text-white text-xs font-black transition-all border-t border-white/5 shrink-0">
          CLOSE PLAYER
        </button>
      </div>
    </div>
  );
}

function WallpaperLayout({ date, bgColor, textColor, wallpaperRef, selectedShows, mode, contactInfo }: any) {
  const wallpaperDayData = (festivalData as any)[date] || {};
  const dayNum = date.split('-')[2];
  const isDay1 = date === '2026-03-21';
  const chars = isDay1 ? ['人', '生', '。'] : ['音', '樂', '。'];
  const fullDateStr = isDay1 ? '0321' : '0322';

  return (
    <div style={{ position: 'absolute', left: '-9999px', top: '0', pointerEvents: 'none' }}>
      <div ref={wallpaperRef} style={{ width: '1242px', height: '2688px', backgroundColor: mode === 'static' ? '#000000' : bgColor, backgroundImage: mode === 'static' ? 'url(/megaport_static_bg.png)' : 'none', backgroundSize: 'cover', backgroundPosition: 'center', fontFamily: 'var(--font-noto-jp), sans-serif', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ height: '25%' }} />
        <div style={{ height: '75%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {mode === 'generated' && (
            <div style={{ top: '-1225px', right: '-560px', opacity: 0.95, zIndex: 0, position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1' }}>
              {chars.map((char, idx) => (
                <span key={idx} style={{ color: textColor, fontWeight: 900, fontStyle: 'normal', display: 'block', position: 'relative', ...(char === '。' ? { marginTop: '-450px', marginLeft: '1280px', fontSize: '900px' } : { fontSize: '1240px' }) }}>{char}</span>
              ))}
            </div>
          )}
          <div style={{ position: 'absolute', right: `${WATERMARK_CONFIG.yearRight}px`, bottom: `${WATERMARK_CONFIG.yearBottom}px`, zIndex: WATERMARK_CONFIG.zIndex, pointerEvents: 'none', fontFamily: WATERMARK_CONFIG.yearFont, fontWeight: WATERMARK_CONFIG.yearWeight, transformOrigin: 'right bottom', transform: `scale(${WATERMARK_CONFIG.yearScaleX}, ${WATERMARK_CONFIG.yearScaleY})` }}>
             <span style={{ fontSize: `${WATERMARK_CONFIG.yearSize}px`, color: WATERMARK_CONFIG.yearColor, opacity: WATERMARK_CONFIG.opacity, letterSpacing: WATERMARK_CONFIG.yearSpacing }}>2026</span>
          </div>
          <div style={{ position: 'absolute', right: `${WATERMARK_CONFIG.dateRight}px`, bottom: `${WATERMARK_CONFIG.dateBottom}px`, zIndex: WATERMARK_CONFIG.zIndex + 1, pointerEvents: 'none', fontFamily: WATERMARK_CONFIG.dateFont, fontWeight: WATERMARK_CONFIG.dateWeight, transformOrigin: 'right bottom', transform: `scale(${WATERMARK_CONFIG.dateScaleX}, ${WATERMARK_CONFIG.dateScaleY})`, display: 'flex', flexDirection: 'row-reverse' }}>
             {fullDateStr.split('').reverse().map((char, i) => (
               <span key={i} style={{ fontSize: `${WATERMARK_CONFIG.dateSize}px`, color: WATERMARK_CONFIG.dateColor, opacity: WATERMARK_CONFIG.opacity, marginRight: i === 0 ? '0' : `${WATERMARK_CONFIG.dateSpacing}px`, lineHeight: '1', display: 'inline-block' }}>{char}</span>
             ))}
          </div>
          <div style={{ position: 'relative', zIndex: 10, mixBlendMode: 'overlay', transform: 'scale(0.53)', marginTop: '226px', transformOrigin: 'top center' }}>
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
            拾獲拾獲請聯繫：{contactInfo}。感謝您的協助。
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  // 💡 修正：將所有 Hooks 與 Refs 移到組件的最頂層 (修復 Vercel 報錯)
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
  const [showArtistList, setShowArtistList] = useState(false); 
  const [artistSort, setArtistSort] = useState<'alphabet' | 'selected' | 'popular' | 'time'>('time'); 
  const [selectedStage, setSelectedStage] = useState('全部舞台'); 
  const [spotifyArtist, setSpotifyArtist] = useState<any>(null); 
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showContactPrompt, setShowContactPrompt] = useState(false); 
  const [memberList, setMemberList] = useState<any[]>([]);
  const [contactNumber, setContactNumber] = useState(''); 
  const [wallpaperBg, setWallpaperBg] = useState('#000000');
  const [wallpaperText, setWallpaperText] = useState('#E85427');
  const [wallpaperMode, setWallpaperMode] = useState<'generated' | 'static'>('generated');
  const [detailShow, setDetailShow] = useState<any>(null);
  const [compareMemberEmail, setCompareMemberEmail] = useState<string | null>(null); 
  
  // Refs
  const wallpaperRef = useRef<HTMLDivElement>(null);
  const pointerStartPos = useRef({ x: 0, y: 0 });
  const hasMovedSignificant = useRef(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const flatArtistData = useMemo(() => {
    let list: any[] = [];
    Object.keys(festivalData).forEach(date => {
      const dayData = (festivalData as any)[date];
      Object.keys(dayData).forEach(stage => {
        dayData[stage].forEach((show: any) => {
          const attendees = allSelections.filter(s => String(s.performance_id) === String(show.id));
          list.push({ ...show, date, stage, attendees });
        });
      });
    });
    if (selectedStage !== '全部舞台') list = list.filter(show => show.stage === selectedStage);
    switch(artistSort) {
      case 'alphabet': return list.sort((a, b) => a.artist.localeCompare(b.artist));
      case 'selected': return list.sort((a, b) => {
        const aSel = allSelections.some(s => s.user_email === email && String(s.performance_id) === String(a.id));
        const bSel = allSelections.some(s => s.user_email === email && String(s.performance_id) === String(b.id));
        return aSel === bSel ? 0 : aSel ? -1 : 1;
      });
      case 'popular': return list.sort((a, b) => b.attendees.length - a.attendees.length);
      case 'time': return list.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.start.localeCompare(b.start);
      });
      default: return list;
    }
  }, [allSelections, email, artistSort, selectedStage]);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const inviteParam = params.get('invite');
    if (inviteParam) setInviteCode(inviteParam);
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

  const handlePointerDown = (e: any, show: any) => {
    pointerStartPos.current = { x: e.clientX, y: e.clientY };
    hasMovedSignificant.current = false;
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => { 
      if (!hasMovedSignificant.current) {
        isLongPress.current = true; 
        setDetailShow(show); 
      }
    }, 500); 
  };

  const handlePointerMove = (e: any) => {
    const dx = Math.abs(e.clientX - pointerStartPos.current.x);
    const dy = Math.abs(e.clientY - pointerStartPos.current.y);
    if (dx > 25 || dy > 25) {
      hasMovedSignificant.current = true;
    }
  };

  const handlePointerUp = (e: any, show: any) => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    if (hasMovedSignificant.current) return;
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
    if (!confirm('🚨 確定要徹底刪除帳號嗎？\n這將移除你所有的選團紀錄且無法復原。')) return;
    try {
      await supabase.from('user_selections').delete().eq('user_email', email);
      await supabase.from('squad_members').delete().eq('user_email', email);
      localStorage.removeItem('megaport_email');
      localStorage.removeItem('megaport_squad_id');
      setIsLogin(false);
      setCurrentSquad(null);
      setEmail('');
      setUserName('');
      setShowMembers(false);
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

  const handleRenameSquad = async () => {
    if (!currentSquad) return;
    const newName = prompt('請輸入新的小隊名稱：', currentSquad.squad_name);
    if (!newName || newName.trim() === '' || newName === currentSquad.squad_name) return;
    const { error } = await supabase.from('squads').update({ squad_name: newName.trim() }).eq('id', currentSquad.id);
    if (error) alert('修改名稱失敗');
    else {
      const updatedSquad = { ...currentSquad, squad_name: newName.trim() };
      setCurrentSquad(updatedSquad);
      setSquads(prev => prev.map(s => s.id === currentSquad.id ? updatedSquad : s));
    }
  };

  const handleCopyInvite = () => {
    if (!currentSquad) return;
    const inviteLink = `${window.location.origin}${window.location.pathname}?invite=${currentSquad.invite_code}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      alert(`邀請連結已複製！\n隊友點開即可自動填入邀請碼：${currentSquad.invite_code}`);
    });
  };

  const executeDownload = async (mode: string) => {
    if (!wallpaperRef.current) return;
    setShowColorPicker(false);
    setShowContactPrompt(false);
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(wallpaperRef.current!, { scale: 1, useCORS: true, windowWidth: 1242, windowHeight: 2688 });
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
  const isOverview = zoom < 0.5;

  if (!isLogin) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-8 text-black font-sans">
      <h1 className="text-4xl font-black italic mb-10 underline decoration-[#E85427]">MEGAPORT SYNC</h1>
      <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="填入帳號或新增帳號" className="w-full max-w-xs p-4 border-2 border-zinc-100 rounded-2xl font-bold mb-4 outline-none text-black" />
      <button onClick={() => fetchMySquads(email)} className="w-full max-w-xs bg-black text-white py-4 rounded-2xl font-black shadow-lg">進入系統</button>
    </div>
  );

  if (!currentSquad) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-8 text-black overflow-auto font-sans relative">
      <h2 className="text-xl font-black mb-6 text-zinc-400 uppercase tracking-widest text-black">我的小隊清單</h2>
      <div className="w-full max-w-xs space-y-3 mb-10 text-black">{squads.map(s => (<button key={s.id} onClick={() => selectSquad(s)} className="w-full p-4 bg-zinc-50 border rounded-2xl font-bold text-left hover:bg-zinc-100 transition-all text-black">{s.squad_name}</button>))}</div>
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
    <main className="h-screen flex flex-col bg-white overflow-hidden text-black font-sans relative text-black">
      <div className="p-4 bg-white border-b border-zinc-300 flex justify-between items-center z-50 shrink-0 text-black">
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => setShowMembers(true)}>
             <span className="font-black text-[12px] uppercase group-hover:text-[#E85427] transition-colors text-black">{currentSquad?.squad_name}</span>
             <button className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full transition-all shadow-sm ${compareMemberEmail ? 'bg-black text-white' : 'bg-zinc-100 text-black'}`}>
                <span className="text-[10px]">{compareMemberEmail ? '🎯' : '👥'}</span>
                <span className="text-[8px] font-black uppercase tracking-wider">{compareMemberEmail ? comparedMember?.user_name : '成員'}</span>
             </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-black">
          <button onClick={() => setShowArtistList(true)} className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-100 hover:bg-black hover:text-white rounded-full transition-all shadow-sm">
             <span className="text-[10px]">🎸</span>
             <span className="text-[8px] font-black uppercase tracking-wider text-black">Artist</span>
          </button>
          <div className="flex items-center gap-1 bg-zinc-50 px-2 py-1.5 rounded-full border border-zinc-200 shadow-sm text-black text-black text-black text-black">
            <span className="text-[7px] font-black text-zinc-400 uppercase tracking-tighter">ICON:</span>
            <input type="color" value={userColor} onChange={e => handleMemberColorChange(e.target.value)} className="w-3.5 h-3.5 rounded-full bg-transparent border-none cursor-pointer" />
          </div>
          <button onClick={() => setZoom(zoom === 0.9 ? 0.28 : 0.9)} className="px-2 py-1.5 bg-zinc-100 rounded-full text-[11px] shadow-sm text-black">{zoom === 0.9 ? "🌍" : "🔎"}</button>
          <div className="flex bg-zinc-100 rounded-lg p-0.5 shadow-sm text-black">
            {['2026-03-21', '2026-03-22'].map(d => (
              <button key={d} onClick={() => { setCurrentDate(d); localStorage.setItem('megaport_current_date', d); }} className={`px-2 py-1.5 rounded-md text-[8px] font-black ${currentDate === d ? 'bg-black text-white' : 'text-zinc-400'}`}>{d.split('-')[2]}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-[300] flex flex-col items-end gap-3 pointer-events-none text-black text-black">
        <div className="bg-white/80 backdrop-blur-md p-3 rounded-3xl border border-zinc-200 shadow-2xl flex flex-col gap-2 pointer-events-auto text-black">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center border-b border-zinc-100 pb-1.5 mb-0.5 text-black text-black">生成桌布</span>
          <button onClick={() => { setWallpaperMode('generated'); setShowColorPicker(true); }} className="bg-black text-white px-4 py-2.5 rounded-2xl font-black text-[10px] shadow-lg active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap text-white">📲 人生音樂版</button>
          <button onClick={() => { setWallpaperMode('static'); setShowContactPrompt(true); }} className="bg-[#E85427] text-white px-4 py-2.5 rounded-2xl font-black text-[10px] shadow-lg active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap text-white">📍 地圖版</button>
        </div>
      </div>

      {showArtistList && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400] flex items-center justify-center p-6 text-black text-black text-black text-black" onClick={() => setShowArtistList(false)}>
          <div className="bg-white w-full max-w-lg h-[85vh] rounded-[40px] p-8 shadow-2xl flex flex-col space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-4 shrink-0 text-black text-black text-black text-black">
              <h3 className="text-xl font-black uppercase text-black tracking-tighter">Artist</h3>
              <button onClick={() => setShowArtistList(false)} className="py-2 px-4 bg-zinc-100 rounded-xl text-xs font-bold active:scale-95 text-black">關閉</button>
            </div>
            <div className="grid grid-cols-2 gap-3 shrink-0 text-black text-black text-black text-black">
              <div className="flex flex-col gap-1.5 text-black text-black">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">舞台篩選</label>
                <select value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)} className="w-full p-3 border border-zinc-100 rounded-2xl font-bold text-xs outline-none focus:border-[#E85427] appearance-none cursor-pointer text-black" style={{ backgroundColor: selectedStage !== '全部舞台' ? STAGE_THEME[selectedStage]?.bg : '#F4F4F5', color: selectedStage !== '全部舞台' ? STAGE_THEME[selectedStage]?.text : '#000' }}><option value="全部舞台">全部舞台</option>{Object.keys(STAGE_THEME).map(s => (<option key={s} value={s} style={{ backgroundColor: STAGE_THEME[s].bg, color: STAGE_THEME[s].text }}>{s}</option>))}</select>
              </div>
              <div className="flex flex-col gap-1.5 text-black text-black">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">列表排序</label>
                <select value={artistSort} onChange={(e) => setArtistSort(e.target.value as any)} className="w-full p-3 bg-zinc-900 text-white border border-zinc-800 rounded-2xl font-bold text-xs outline-none cursor-pointer appearance-none text-white"><option value="time">依照演出時間</option><option value="alphabet">字母 A-Z</option><option value="selected">我的選擇優先</option><option value="popular">隊友最愛優先</option></select>
              </div>
            </div>
            <div className="flex-1 overflow-auto space-y-2 pr-2 custom-scrollbar text-black" style={{ touchAction: 'pan-y' }}>
              {flatArtistData.map((show: any) => {
                const isMe = allSelections.some(s => s.user_email === email && String(s.performance_id) === String(show.id));
                const hasSpotify = SPOTIFY_LINKS[show.id]; 
                return (
                  <div key={show.id} onPointerDown={(e) => handlePointerDown(e, show)} onPointerMove={handlePointerMove} onPointerUp={(e) => handlePointerUp(e, show)} className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${isMe ? 'bg-[#E85427] border-[#E85427] shadow-lg scale-[0.98]' : 'bg-white border-zinc-100 hover:border-zinc-300'}`}>
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black leading-tight ${isMe ? 'text-white' : 'text-black'}`}>{show.artist.replace(/\n/g, ' ')}</span>
                        {hasSpotify && (
                          <button onClick={(e) => { e.stopPropagation(); setSpotifyArtist(show); }} className="w-5 h-5 bg-[#C5EBC3] text-black/70 rounded-full flex items-center justify-center shadow-sm shrink-0 active:scale-90 transition-transform">
                            <span className="text-[9px]">🎵</span>
                          </button>
                        )}
                      </div>
                      <div className={`text-[10px] font-bold flex flex-wrap gap-x-2 gap-y-0.5 ${isMe ? 'text-white/70' : 'text-zinc-400'}`}>
                        <span className="px-1.5 py-0.5 rounded text-[8px] border border-black/5" style={{ backgroundColor: STAGE_THEME[show.stage]?.bg, color: STAGE_THEME[show.stage]?.text }}>{show.stage}</span>
                        <span>{show.date.split('-')[2]}日</span>
                        <span>{show.start}-{show.end}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {show.attendees.map((attendee: any, idx: number) => {
                          const m = memberList.find(ml => ml.user_email === attendee.user_email);
                          return ( <div key={idx} className="w-6 h-6 rounded-full border border-white flex items-center justify-center font-black text-white text-[8px] shadow-sm text-white" style={{ backgroundColor: m?.user_color || '#000', zIndex: 10 - idx }}>{(m?.user_name || attendee.user_name || '?').charAt(0).toUpperCase()}</div> );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showMembers && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400] flex items-center justify-center p-6 text-black text-black text-black text-black" onClick={() => setShowMembers(false)}>
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl space-y-6 relative text-black" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start border-b pb-4 relative">
              <div className="flex flex-col gap-1.5 pr-16 group">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-[#E85427] uppercase tracking-widest shrink-0">目前小隊</span>
                  <button onClick={handleCopyInvite} className="flex items-center gap-1 active:scale-95 transition-all text-[#E85427]">
                    <span className="text-[10px] font-black tracking-tighter">🔗 {currentSquad?.invite_code}</span>
                    <span className="text-[10px] font-black">邀請連結</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black uppercase text-black break-all leading-tight">{currentSquad?.squad_name}</h3>
                  <button onClick={handleRenameSquad} className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors text-sm text-black">🖊️</button>
                </div>
              </div>
              <button onClick={() => { setCurrentSquad(null); setShowMembers(false); }} className="absolute top-0 right-0 py-2 px-3 bg-zinc-100 hover:bg-black hover:text-white text-black font-bold rounded-xl text-[10px] transition-all active:scale-95 shadow-sm text-black">✕ 回小隊清單</button>
            </div>
            <div className="space-y-3 max-h-[40vh] overflow-auto pr-2">
              {memberList.map((m, i) => (
                <div key={i} onClick={() => { if(m.user_email !== email) { setCompareMemberEmail(m.user_email === compareMemberEmail ? null : m.user_email); setShowMembers(false); } }} className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${m.user_email === compareMemberEmail ? 'bg-black border-black text-white' : 'bg-zinc-50 border-zinc-100 hover:border-zinc-300'}`}>
                  <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white shadow-sm" style={{ backgroundColor: m.user_color }}>{m.user_name?.charAt(0).toUpperCase()}</div><span className="font-bold text-sm text-black">{m.user_name} {m.user_email === email && "(我)"}</span></div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-zinc-50 text-black text-black">
              <button onClick={() => { if(confirm(`確定要退出「${currentSquad?.squad_name}」嗎？`)) { supabase.from('squad_members').delete().eq('squad_id', currentSquad.id).eq('user_email', email).then(() => { localStorage.removeItem('megaport_squad_id'); setCurrentSquad(null); setShowMembers(false); fetchMySquads(email); }); } }} className="w-full py-4 bg-zinc-50 hover:bg-red-50 text-red-500 font-black rounded-2xl text-sm transition-colors active:scale-95 text-red-500 text-red-500 text-red-500">退出目前小隊</button>
            </div>
          </div>
        </div>
      )}

      {detailShow && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[400] flex items-center justify-center p-6 text-black text-black text-black text-black" onClick={() => setDetailShow(null)}>
          <div className="bg-white w-full max-w-xs rounded-[40px] p-10 shadow-2xl space-y-4 flex flex-col items-center animate-in fade-in zoom-in duration-200 text-black" onClick={e => e.stopPropagation()}>
            <div className="text-center flex flex-col items-center">
              <div className="flex items-center justify-center gap-3">
                <h3 className="text-2xl font-black italic underline decoration-[#E85427] tracking-tighter text-black whitespace-pre-line text-black">{detailShow.artist.replace(/\n/g, ' ')}</h3>
                {SPOTIFY_LINKS[detailShow.id] && (
                  <button onClick={() => setSpotifyArtist(detailShow)} className="w-6 h-6 bg-[#C5EBC3] text-black/70 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all shrink-0">
                    <span className="text-[10px]">🎵</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-1 text-black">{detailShow.start} — {detailShow.end}</p>
            </div>
            <div className="w-full bg-zinc-50 rounded-3xl p-6 flex flex-col max-h-[50vh] overflow-hidden text-black">
              <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest block mb-4 text-black text-black">已選取隊友 (點選可對照)</span>
              <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1">
                {allSelections.filter(s => String(s.performance_id) === String(detailShow.id)).map((attendee, idx) => {
                  const m = memberList.find(ml => ml.user_email === attendee.user_email);
                  return (
                    <div key={idx} onClick={() => { if(attendee.user_email !== email) { setCompareMemberEmail(attendee.user_email === compareMemberEmail ? null : attendee.user_email); setDetailShow(null); } }} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${attendee.user_email === compareMemberEmail ? 'bg-black text-white' : ''}`}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-white text-[10px] shadow-sm text-white" style={{ backgroundColor: m?.user_color || '#000' }}>{(m?.user_name || attendee.user_name || '?').charAt(0).toUpperCase()}</div><span className="font-bold text-sm text-black">{m?.user_name || attendee.user_name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <button onClick={() => setDetailShow(null)} className="w-full py-4 bg-black text-white rounded-2xl font-black shadow-lg text-white">返回課表</button>
          </div>
        </div>
      )}

      {spotifyArtist && <SpotifyModal artist={spotifyArtist} onClose={() => setSpotifyArtist(null)} />}

      {showColorPicker && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[400] flex items-center justify-center p-6 text-black text-black text-black text-black" onClick={() => setShowColorPicker(false)}>
          <div className="bg-white w-full max-w-xs rounded-3xl p-8 shadow-2xl flex flex-col items-center space-y-6 text-black text-black" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black italic underline decoration-[#E85427] text-black">人生音樂版輸出</h3>
            <div className="flex flex-col gap-4 w-full text-black"><div className="flex justify-between items-center w-full px-2 font-bold text-xs text-black"><span>背景色</span><input type="color" value={wallpaperBg} onChange={e => setWallpaperBg(e.target.value)} className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer" /></div><div className="flex justify-between items-center w-full px-2 font-bold text-xs text-black"><span>大字色</span><input type="color" value={wallpaperText} onChange={e => setWallpaperText(e.target.value)} className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer" /></div><div className="w-full pt-2 text-black"><span className="text-[10px] font-black text-zinc-400 uppercase mb-2 block text-black text-black">緊急聯絡電話 (選填 / 零後台)</span><input type="text" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="09XXXXXXXX" className="w-full p-3 border border-zinc-100 bg-zinc-50 rounded-xl font-bold text-sm outline-none focus:border-[#E85427] text-black" /></div></div>
            <button onClick={() => executeDownload('generated')} className="w-full py-4 bg-[#E85427] text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-white text-white">確認下載</button><button onClick={() => setShowColorPicker(false)} className="text-zinc-400 font-bold text-xs text-black">取消</button>
          </div>
        </div>
      )}

      {showContactPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[400] flex items-center justify-center p-6 text-black text-black text-black text-black text-black" onClick={() => setShowContactPrompt(false)}>
          <div className="bg-white w-full max-w-xs rounded-3xl p-8 shadow-2xl flex flex-col items-center space-y-6 text-black text-black" onClick={e => e.stopPropagation()}><h3 className="text-xl font-black italic underline decoration-[#E85427] text-black text-black">地圖版輸出</h3><div className="w-full text-center text-black"><span className="text-[10px] font-black text-zinc-400 uppercase mb-2 block text-black text-black">緊急聯絡電話 (選填 / 零後台)</span><input type="text" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="09XXXXXXXX" className="w-full p-4 border border-zinc-100 bg-zinc-50 rounded-2xl font-bold text-center outline-none focus:border-[#E85427] text-black text-black" /></div>
            <button onClick={() => executeDownload('static')} className="w-full py-4 bg-[#E85427] text-white font-black rounded-2xl shadow-xl active:scale-95 text-white text-white">確認下載</button><button onClick={() => setShowContactPrompt(false)} className="text-zinc-400 font-bold text-xs text-black text-black">取消</button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto relative bg-white overflow-auto no-scrollbar text-black text-black">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${100 / zoom}%`, height: `${100 / zoom}%` }}>
           <div className="inline-grid p-10 px-20 rounded-3xl text-black text-black" style={{ display: 'grid', gridTemplateColumns: `100px repeat(10, 200px) 100px`, gridTemplateRows: `80px repeat(57, 45px)`, minWidth: '2200px', backgroundColor: '#FFFFFF', border: '2px solid rgba(0,0,0,0.2)', touchAction: 'pan-y pan-x' }}>
            <div className="bg-[#000000] text-[#FFFFFF] border-b border-r border-zinc-800 flex items-center justify-center font-black text-[42px] text-white text-white" style={{ gridColumn: '1', gridRow: '1', paddingBottom: '20px' }}>{dayNum}</div>
            {Object.keys(STAGE_THEME).map((s, idx) => (<div key={s} className="sticky top-0 z-40 border-b border-r border-zinc-300 flex items-center justify-center font-black text-[42px] bg-white text-black text-black text-black" style={{ gridColumnStart: idx + 2, backgroundColor: STAGE_THEME[s].bg, paddingBottom: '20px' }}>{s}</div>))}
            <div className="bg-[#000000] text-[#FFFFFF] border-b border-l border-zinc-800 flex items-center justify-center font-black text-[42px] text-white text-white" style={{ gridColumn: '12', gridRow: '1', paddingBottom: '20px' }}>{dayNum}</div>
            {Object.keys(STAGE_THEME).map((_, idx) => (<div key={`bg-col-${idx}`} style={{ gridColumnStart: idx + 2, gridRow: '2 / 60' }} className={`pointer-events-none z-0 border-r border-zinc-300 ${idx % 2 === 0 ? 'bg-zinc-200' : 'bg-white'}`}></div>))}
            {Array.from({ length: 57 }).map((_, i) => {
              const minutes = (12 * 60 + 30 + i * 10);
              const timeStr = `${Math.floor(minutes / 60)}:${minutes % 60 === 0 ? '00' : minutes % 60}`;
              return (
                <div key={`grid-row-${i}`} className="contents text-black text-black text-black text-black">
                  <div className="sticky left-0 z-40 bg-[#FFF9E1] flex items-center justify-center border-r border-b border-zinc-400 translate-y-[-50%] text-[24px] font-mono font-bold text-zinc-500" style={{ gridRowStart: i + 2 }}>{timeStr}</div>
                  <div className="bg-[#FFF9E1] flex items-center justify-center border-l border-b border-zinc-400 translate-y-[-50%] text-[24px] font-mono font-bold text-zinc-500" style={{ gridRowStart: i + 2, gridColumnStart: 12 }}>{timeStr}</div>
                  {i < 56 && <div className={`pointer-events-none z-10 ${minutes % 60 === 50 ? 'border-b-[4px] border-zinc-500' : 'border-b border-zinc-300'}`} style={{ gridRowStart: i + 2, gridColumn: '2 / 12' }}></div>}
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
                {/* 💡 修正：物理尺寸放大 10% */}
                const physicalSize = (isOverview ? 14 : 26.4) / zoom; 
                return (
                  <div key={show.id} 
                    onPointerDown={(e) => handlePointerDown(e, show)} 
                    onPointerMove={handlePointerMove}
                    onPointerUp={(e) => handlePointerUp(e, show)} 
                    onPointerLeave={() => { if(longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } }} 
                    className={`mx-[1px] my-[1px] flex items-center justify-center text-center cursor-pointer relative z-30 transition-all ${isMe ? 'shadow-2xl' : ''}`} 
                    style={{ gridRow: `${startRow} / ${endRow}`, gridColumnStart: colIndex + 2, backgroundColor: isMe ? '#E85427' : STAGE_THEME[stage].bg, border: isComparedMember ? '8px solid #000000' : 'none', boxSizing: 'border-box' }}
                  >
                    <p className={`font-black tracking-tighter text-[36px] leading-[1.3] p-2 whitespace-pre-line ${isMe ? 'text-white' : 'text-black'}`}>{show.artist}</p>
                    <div className={`absolute bottom-1 left-2 max-w-[90%] flex flex-row pointer-events-none overflow-hidden ${isOverview ? '-space-x-3' : '-space-x-1.5'}`}>
                      {attendees.map((f, i) => {
                        const m = memberList.find(ml => ml.user_email === f.user_email);
                        return ( <div key={i} className="rounded-full flex items-center justify-center font-black text-white border border-black shadow-sm text-white text-white text-white text-white" style={{ backgroundColor: m?.user_color || '#000', width: `${physicalSize}px`, height: `${physicalSize}px`, fontSize: `${physicalSize * 0.45}px`, zIndex: attendees.length - i }}>{(m?.user_name || f.user_name || '?').charAt(0).toUpperCase()}</div> );
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