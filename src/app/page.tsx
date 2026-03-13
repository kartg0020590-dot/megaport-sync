'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import festivalData from '../../data.json'
import quotesData from '../../quotes.json'
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
  '青春夢': { bg: '#ECC3B2', text: '#000000' }, '小港祭': { bg: '#A68C83', text: '#000000' }
};

const STAGE_THEME_WALLPAPER: Record<string, { bg: string, text: string }> = {
  '南霸天': { bg: '#B5D38A', text: '#000000' }, '海龍王': { bg: '#A9ABD6', text: '#000000' },
  '女神龍': { bg: '#E09DC1', text: '#000000' }, '海波浪': { bg: '#8ED2E1', text: '#000000' },
  '卡魔麥': { bg: '#E59C90', text: '#000000' }, '出頭天': { bg: '#E9D08A', text: '#000000' },
  '大雄丸': { bg: '#E29195', text: '#000000' }, '藍寶石': { bg: '#8AB4D3', text: '#000000' },
  '青春夢': { bg: '#E7AD95', text: '#000000' }, '小港祭': { bg: '#A68C83', text: '#000000' }
};

function SpotifyModal({ artist, onClose }: { artist: any, onClose: () => void }) {
  const rawIframe = SPOTIFY_LINKS[artist?.id];
  if (!artist || !rawIframe) return null;
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div className="w-full max-w-2xl bg-[#121212] rounded-[32px] overflow-hidden shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
        <div className="p-6 pb-4 flex justify-between items-start shrink-0">
          <div className="flex flex-col text-white">
            <h3 className="text-2xl font-black italic tracking-tighter leading-tight whitespace-pre-line">{artist.artist.replace(/\n/g, ' ')}</h3>
            <p className="text-xs font-bold text-[#1DB954] mt-1 uppercase tracking-widest">{artist.stage} · {artist.start}-{artist.end}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/5 text-white rounded-full flex items-center justify-center transition-all">✕</button>
        </div>
        <div className="p-4 pt-0 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          <div className="w-full" dangerouslySetInnerHTML={{ __html: rawIframe }} />
        </div>
        <button onClick={onClose} className="w-full py-5 bg-[#242424] text-white text-xs font-black border-t border-white/5 shrink-0">CLOSE PLAYER</button>
      </div>
    </div>
  );
}

function WallpaperLayout({ date, bgColor, textColor, wallpaperRef, selectedShows, mode, contactInfo, maskMode }: any) {
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
                <div style={{ gridColumn: '1', gridRow: '1', backgroundColor: '#000000', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '42px', borderBottom: '1px solid #000', paddingBottom: '60px', zIndex: 110 }}>{dayNum}</div>
{Object.keys(STAGE_THEME_WALLPAPER).map((s, idx) => (
  <div key={s} style={{ 
    gridColumnStart: idx + 2, gridRow: '1', borderBottom: '1px solid #000', borderRight: '1px solid #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '42px', backgroundColor: STAGE_THEME_WALLPAPER[s].bg, color: '#000000', paddingBottom: '45px', zIndex: 110
  }}>{s}</div>
))}
                <div style={{ gridColumn: '12', gridRow: '1', backgroundColor: '#000000', color: '#FFFFFF', borderBottom: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '42px', paddingBottom: '60px', zIndex: 110 }}>{dayNum}</div>
                {maskMode && <div style={{ gridColumn: '2 / 12', gridRow: '2 / 60', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 45, pointerEvents: 'none' }} />}
                {Object.keys(STAGE_THEME_WALLPAPER).map((_, idx) => (<div key={`bg-col-${idx}`} style={{ gridColumnStart: idx + 2, gridRow: '2 / 60', borderRight: '1px solid #D1D5DB', backgroundColor: idx % 2 === 0 ? 'rgba(161, 161, 170, 0.6)' : 'transparent' }}></div>))}
                
                {Array.from({ length: 56 }).map((_, i) => {
                  const minutes = (12 * 60 + 30 + i * 10);
                  const timeStr = `${Math.floor(minutes / 60)}:${minutes % 60 === 0 ? '00' : minutes % 60}`;
                  const isFullHourLine = timeStr.endsWith(':50');
                  return (
                    <div key={`grid-row-${i}`} className="contents">
                      <div style={{ gridColumn: '1', gridRowStart: i + 2, backgroundColor: '#FFF9E1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #000', borderBottom: '1px solid #D1D5DB', transform: 'translateY(-75%)', fontSize: '24px', fontWeight: 700, color: '#333', zIndex: 105 }}>{timeStr}</div>
                      <div style={{ gridColumn: '12', gridRowStart: i + 2, backgroundColor: '#FFF9E1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #000', borderBottom: '1px solid #D1D5DB', transform: 'translateY(-75%)', fontSize: '24px', fontWeight: 700, color: '#333', zIndex: 105 }}>{timeStr}</div>
                      <div style={{ gridRowStart: i + 2, gridColumn: '2 / 12', borderBottom: isFullHourLine ? '3px solid rgba(0,0,0,0.5)' : '1px solid rgba(0,0,0,0.1)', zIndex: 10, pointerEvents: 'none' }}></div>
                    </div>
                  )
                })}

                <div style={{ position: 'absolute', bottom: '1px', left: '17px', fontSize: '24px', fontWeight: 700, color: '#333', zIndex: 150 }}>21:50</div>
                <div style={{ position: 'absolute', bottom: '1px', right: '17px', fontSize: '24px', fontWeight: 700, color: '#333', zIndex: 150 }}>21:50</div>

                {Object.keys(STAGE_THEME_WALLPAPER).map((stage, colIndex) => {
                  const shows = wallpaperDayData[stage] || [];
                  return shows.map((show: any) => {
                    const isMeSelected = selectedShows.some((s: any) => String(s.performance_id) === String(show.id));
                    const theme = STAGE_THEME_WALLPAPER[stage];
                    const startRow = Math.floor(((Number(show.start.split(':')[0]) * 60 + Number(show.start.split(':')[1])) - (12 * 60 + 30)) / 10) + 2;
                    const endRow = Math.floor(((Number(show.end.split(':')[0]) * 60 + Number(show.end.split(':')[1])) - (12 * 60 + 30)) / 10) + 2;
                    return (
                      <div key={show.id} style={{ 
                        gridRow: `${startRow} / ${endRow}`, gridColumnStart: colIndex + 2, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', zIndex: isMeSelected ? 60 : 30, 
                        backgroundColor: isMeSelected ? '#E85427' : theme.bg, border: (isMeSelected && maskMode) ? '6px solid #000000' : 'none', boxSizing: 'border-box', opacity: (maskMode && !isMeSelected) ? 0.6 : 1, filter: (maskMode && !isMeSelected) ? 'brightness(0.7)' : 'none'
                      }}>
                        <p style={{ fontWeight: 900, fontSize: '36px', color: isMeSelected ? '#FFFFFF' : theme.text, whiteSpace: 'pre-line', transform: 'translateY(-14px)' }}>{show.artist}</p>
                      </div>
                    );
                  });
                })}
            </div>
          </div>
        </div>
        {contactInfo && <div style={{ position: 'absolute', bottom: '80px', left: '60px', color: mode === 'static' ? '#FFFFFF' : textColor, fontSize: '32px', fontWeight: 900, textAlign: 'left', zIndex: 50, opacity: 0.8 }}>大港開唱，拾獲請聯繫：{contactInfo}。感謝您的協助。</div>}
      </div>
    </div>
  );
}

export default function Home() {
  const [showWallpaperMenu, setShowWallpaperMenu] = useState(false);
  const wallpaperRef = useRef<HTMLDivElement>(null);
  const pointerStartPos = useRef({ x: 0, y: 0 });
  const hasMovedSignificant = useRef(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
const activePointers = useRef(new Set()); // 紀錄目前在螢幕上的手指 ID
const isMultitouch = useRef(false);       // 標記這一次操作是否曾經出現過多指
// 💡 1. 在組件最上方定義隨機提示語 (約第 135 行)
  const FOOTER_HINTS = [
    ["💡 按左上角回清單，加入/創立小隊", "🔔 遮罩功能 3/21 啟用"],
    ["💡 長按表演項目查看詳細隊友名單", "🔔 遮罩功能 3/21 啟用"],
    ["💡 點擊右上角「生成桌布」，設定手機桌面快速查看團序", "🔔 遮罩功能 3/21 啟用"],
    ["💡 點擊成員框框對比團序", "🔔 遮罩功能 3/21 啟用"],
    ["💡 點擊右上角COLOR，設定代表顏色", "🔔 遮罩功能 3/21 啟用"],
    ["💡 人氣火苗依據同時段勾選比例計算，建議即早準備", "🔔 遮罩功能 3/21 啟用"]
  ];


  const scrollContainerRef = useRef<HTMLDivElement>(null);
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
  const [zoom, setZoom] = useState(0.23); 
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
  const [onlyMeWallpaper, setOnlyMeWallpaper] = useState(false);
const [showGridIcons, setShowGridIcons] = useState(true);
// 💡 火力預報狀態
  const [showHeatMap, setShowHeatMap] = useState(true);
  const [heatLevels, setHeatLevels] = useState<Record<string, any>>({});
const [now, setNow] = useState(new Date());
  const [showTimeMask, setShowTimeMask] = useState(true); // 💡 新增：預設開啟遮罩
  // 💡 自定義你的隨機語錄
// 💡 更新為更具大港風格的隨機語錄


// 在 Home 組件內新增這個 state (如果還沒加)
const [randomQuote, setRandomQuote] = useState("");
const [currentHint, setCurrentHint] = useState(["💡 載入中...", ""]);

useEffect(() => {
  // 每次組件掛載（點進去）時隨機挑選一句
  if (quotesData && quotesData.length > 0) {
    const randomIndex = Math.floor(Math.random() * quotesData.length);
    setRandomQuote(quotesData[randomIndex]);
  }
  setCurrentHint(FOOTER_HINTS[Math.floor(Math.random() * FOOTER_HINTS.length)]);
  
}, []);

  // 💡 定時每分鐘更新一次時間
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isOverview = zoom < 0.5;
  // 💡 步驟 2 修正版：計算過去時間遮罩高度
  const pastTimeMaskHeight = useMemo(() => {
    // 強制轉為台北時間進行計算
    const taipeiTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Taipei"}));
    const h = taipeiTime.getHours();
    const m = taipeiTime.getMinutes();
    const totalMinutes = h * 60 + m;
    const startMinutes = 12 * 60 + 30; // 課表從 12:30 開始
    
    // 如果現在時間還沒到 12:30，遮罩高度為 0 (不遮擋)
    if (totalMinutes < startMinutes) {
      return 0;
    }
    
    // 如果現在時間已經超過 22:30，遮罩高度為整個 Grid 的高度 (10分鐘*60格 = 2700px + 舞台標籤80px)
    if (totalMinutes > 22 * 60 + 30) {
      return 2780; 
    }

    // 每一格 10 分鐘是 45px，所以 1 分鐘是 4.5px
    // + 80 是第一列舞台標籤的高度
    return (totalMinutes - startMinutes) * 4.5 + 80;
  }, [now]);

  // 💡 智慧遮罩配置：判定 全遮 / 動態遮 / 不遮
  const maskConfig = useMemo(() => {
    const taipeiTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Taipei"}));
    const todayStr = taipeiTime.toLocaleDateString("en-CA", {timeZone: "Asia/Taipei"}); 
    
    // 你的日期對照表 (測試用)
    const dateMapping: Record<string, string> = {
      '2026-03-21': '2026-03-21', // 3/21 課表對應實際時間 3/12
      '2026-03-22': '2026-03-22', // 3/22 課表對應實際時間 3/13 (依此類推)
    };

    const targetRealDate = dateMapping[currentDate];

    // 1. 如果今天已經超過了課表對應的日期 -> 全遮
    if (todayStr > targetRealDate) {
      return { height: 2780, visible: true, isPastDay: true };
    }

    // 2. 如果今天正好是課表對應的日期 -> 動態遮罩
    if (todayStr === targetRealDate) {
      const h = taipeiTime.getHours();
      const m = taipeiTime.getMinutes();
      const totalMinutes = h * 60 + m;
      const startMinutes = 12 * 60 + 30;
      
      let height = 0;
      if (totalMinutes < startMinutes) height = 0;
      else if (totalMinutes > 22 * 60 + 30) height = 2780;
      else height = (totalMinutes - startMinutes) * 4.5 + 80;

      return { height, visible: true, isPastDay: false };
    }

    // 3. 如果今天還沒到課表對應的日期 -> 不顯示遮罩
    return { height: 0, visible: false, isPastDay: false };
  }, [now, currentDate]);
  // ---------------------------------------------------------

  const gridData = (festivalData as any)[currentDate] || {};
  const dayNum = currentDate.split('-')[2];

  const executeDownload = async (mode: string) => {
  if (!wallpaperRef.current) return;
  setShowColorPicker(false); setShowContactPrompt(false);
  
  setTimeout(async () => {
    try {
      const canvas = await html2canvas(wallpaperRef.current!, { 
        scale: 1, 
        useCORS: true, 
        windowWidth: 1242, 
        windowHeight: 2688 
      });

      const link = document.createElement('a');
      link.download = `megaport_${currentDate.split('-')[2]}日桌面_${mode}.jpg`;
      
      // 💡 關鍵修改：從 'image/png' 改為 'image/jpeg'，並設定品質為 0.8 (80%)
      link.href = canvas.toDataURL('image/jpeg', 0.8); 
      
      link.click();
    } catch (err) { alert('生成失敗'); }
  }, 300);
};

  const comparedMember = useMemo(() => memberList.find(m => m.user_email === compareMemberEmail), [memberList, compareMemberEmail]);
  const sortedMemberList = useMemo(() => {
    if (!email) return memberList;
    return [...memberList].sort((a, b) => (a.user_email === email ? -1 : b.user_email === email ? 1 : 0));
  }, [memberList, email]);

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
      case 'time': return list.sort((a, b) => a.date !== b.date ? a.date.localeCompare(b.date) : a.start.localeCompare(b.start));
      default: return list;
    }
  }, [allSelections, email, artistSort, selectedStage]);

  useEffect(() => {
  const scrollEl = scrollContainerRef.current;
  if (!scrollEl) return;

  const handleScroll = () => {
    // 💡 直接計算位移量並寫入 CSS 變數
    const x = scrollEl.scrollLeft / zoom;
    const y = scrollEl.scrollTop / zoom;
    scrollEl.style.setProperty('--scroll-x', `${x}px`);
    scrollEl.style.setProperty('--scroll-y', `${y}px`);
  };

  // 🛠️ 關鍵修復：掛載後立即執行一次，確保初始位置 (0, 0) 被寫入
  handleScroll(); 

  scrollEl.addEventListener('scroll', handleScroll, { passive: true });
  return () => scrollEl.removeEventListener('scroll', handleScroll);
}, [zoom, currentSquad, currentDate]); // 💡 建議加入 currentDate，確保切換日期後也能重置
  useEffect(() => {
  setMounted(true);
  const savedEmail = localStorage.getItem('megaport_email');
  const savedSquadId = localStorage.getItem('megaport_squad_id');
  const savedDate = localStorage.getItem('megaport_current_date');
  const savedIconPreference = localStorage.getItem('megaport_show_icons');
const savedHeatPreference = localStorage.getItem('megaport_show_heat');
    if (savedHeatPreference !== null) setShowHeatMap(savedHeatPreference === 'true');

  // 💡 新增：讀取遮罩偏好 (預設為 true)
  const savedMaskPreference = localStorage.getItem('megaport_show_mask');
  if (savedMaskPreference !== null) {
    setShowTimeMask(savedMaskPreference === 'true');
  }

  const urlParams = new URLSearchParams(window.location.search);
  const codeFromUrl = urlParams.get('invite');
  if (codeFromUrl) setInviteCode(codeFromUrl);

  if (savedDate) setCurrentDate(savedDate);
  if (savedIconPreference !== null) setShowGridIcons(savedIconPreference === 'true');
  if (savedEmail) { 
      setEmail(savedEmail); 
      fetchMySquads(savedEmail, savedSquadId); 
      fetchGlobalHeat(); // 💡 登入後立刻抓取全球熱度
    }
}, []);

  useEffect(() => { if (currentSquad) { fetchSelections(); fetchSquadMembers(); } }, [currentSquad, currentDate]);

  const fetchMySquads = async (e: string, autoId?: string | null) => {
    const { data } = await supabase.from('squad_members').select('squads(*)').eq('user_email', e);
    if (data) {
      const list = data.map(i => i.squads); setSquads(list);
      if (autoId) { const target = list.find((s: any) => String(s.id) === String(autoId)); if (target) selectSquad(target); }
    }
    localStorage.setItem('megaport_email', e); setIsLogin(true);
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

  const fetchGlobalHeat = async () => {
    try {
      console.log("🚀 啟動熱度運算 (排名制 + 總註冊人數 3% 門檻)...");
      
      // 1. 獲取所有資料
      const { data: allGlobal } = await supabase.from('user_selections').select('user_email, performance_id');
      if (!allGlobal || allGlobal.length === 0) return;

      // 2. 計算總註冊人數 (不重複的 Email 總數)
      const allUniqueUsers = Array.from(new Set(allGlobal.map(s => s.user_email)));
      const totalUserCount = allUniqueUsers.length;
      const absoluteThreshold = Math.ceil(totalUserCount * 0.03); // 💡 計算 3% 人數門檻 (無條件進位)

      console.log(`📊 系統統計: 總用戶數 ${totalUserCount} 人, 噴火門檻需滿 ${absoluteThreshold} 人`);

      // 3. 預先統計每一團的「原始勾選人數」
      const rawCounts: Record<string, number> = {};
      allGlobal.forEach(s => {
        rawCounts[s.performance_id] = (rawCounts[s.performance_id] || 0) + 1;
      });

      const perfInfo: Record<string, any> = {};
      Object.keys(festivalData).forEach(date => {
        Object.keys((festivalData as any)[date]).forEach(stage => {
          (festivalData as any)[date][stage].forEach((show: any) => {
            const startMin = Number(show.start.split(':')[0]) * 60 + Number(show.start.split(':')[1]);
            const endMin = Number(show.end.split(':')[0]) * 60 + Number(show.end.split(':')[1]);
            const slots = [];
            for (let m = startMin; m < endMin; m += 10) slots.push(`${date}_${m}`);
            perfInfo[show.id] = { ...show, stage, date, slots };
          });
        });
      });

      // --- 第一步：計算同時段分攤 (Artist X) ---
      const userSlotCounts: Record<string, Record<string, number>> = {};
      allGlobal.forEach(s => {
        const info = perfInfo[s.performance_id];
        if (!info) return;
        if (!userSlotCounts[s.user_email]) userSlotCounts[s.user_email] = {};
        info.slots.forEach((slot: string) => {
          userSlotCounts[s.user_email][slot] = (userSlotCounts[s.user_email][slot] || 0) + 1;
        });
      });

      const perfSlotWeights: Record<string, Record<string, number>> = {}; 
      const totalSlotWeight: Record<string, number> = {};
      allGlobal.forEach(s => {
        const info = perfInfo[s.performance_id];
        if (!info) return;
        if (!perfSlotWeights[s.performance_id]) perfSlotWeights[s.performance_id] = {};
        info.slots.forEach((slot: string) => {
          const weight = 1 / (userSlotCounts[s.user_email][slot] || 1);
          perfSlotWeights[s.performance_id][slot] = (perfSlotWeights[s.performance_id][slot] || 0) + weight;
          totalSlotWeight[slot] = (totalSlotWeight[slot] || 0) + weight;
        });
      });

      const artistX: Record<string, number> = {};
      Object.keys(perfInfo).forEach(id => {
        const info = perfInfo[id];
        const proportions = info.slots.map((slot: string) => (perfSlotWeights[id]?.[slot] / totalSlotWeight[slot]) || 0);
        artistX[id] = proportions.reduce((a: number, b: number) => a + b, 0) / (proportions.length || 1);
      });

      const stageGroups: Record<string, number[]> = {};
      Object.keys(perfInfo).forEach(id => {
        const { stage } = perfInfo[id];
        const X = artistX[id];
        if (!stageGroups[stage]) stageGroups[stage] = [];
        stageGroups[stage].push(X);
      });

      // --- 第二步：排名與「絕對人數」判斷 ---
      const newHeatLevels: Record<string, any> = {};

      Object.keys(stageGroups).forEach(stage => {
        const groupX = stageGroups[stage];
        const validGroup = groupX.filter(x => x > 0);
        if (validGroup.length === 0) return;

        const sortedX = [...validGroup].sort((a, b) => b - a);
        const threshold10 = sortedX[Math.floor(sortedX.length * 0.1)] || 0;
        const threshold20 = sortedX[Math.floor(sortedX.length * 0.2)] || 0;
        const threshold30 = sortedX[Math.floor(sortedX.length * 0.3)] || 0;

        Object.keys(perfInfo).forEach(id => {
          if (perfInfo[id].stage === stage) {
            const X = artistX[id];
            const count = rawCounts[id] || 0;
            let level = 0;

            // 💡 相對排名判斷
            if (X >= threshold10) level = 3;
            else if (X >= threshold20) level = 2;
            else if (X >= threshold30) level = 1;

            // 💡 暴力門禁：如果勾選人數 < 總註冊人數的 3%，強制不給火
            if (count < absoluteThreshold) {
              level = 0;
            }

            const mean = groupX.reduce((a, b) => a + b, 0) / groupX.length;
            const variance = groupX.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / groupX.length;
            const sd = Math.sqrt(variance);

            newHeatLevels[id] = { 
              level, 
              votes: X, 
              count: count,
              threshold: absoluteThreshold, // 將門檻存入 debug 備查
              baseline: mean, 
              sd: sd,
              ratio: X > 0 ? `Top ${((sortedX.indexOf(X) / sortedX.length) * 100).toFixed(0)}%` : 'N/A'
            };
          }
        });
      });

      setHeatLevels(newHeatLevels);
    } catch (e) {
      console.error("❌ 運算失敗:", e);
    }
  };

const handlePointerDown = (e: React.PointerEvent, show: any) => {
    activePointers.current.add(e.pointerId);

    // 💡 修正 1：只要回到單指，就重新給予點擊機會
    if (activePointers.current.size === 1) {
      isMultitouch.current = false;
    }

    if (activePointers.current.size > 1) {
      isMultitouch.current = true;
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      return; 
    }

    pointerStartPos.current = { x: e.clientX, y: e.clientY };
    hasMovedSignificant.current = false;
    isLongPress.current = false;
    
    longPressTimer.current = setTimeout(() => {
      if (!hasMovedSignificant.current && !isMultitouch.current) {
        isLongPress.current = true;
        setDetailShow(show);
      }
    }, 600);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isMultitouch.current) return;

    const dx = Math.abs(e.clientX - pointerStartPos.current.x);
    const dy = Math.abs(e.clientY - pointerStartPos.current.y);

    // 💡 修正 2：判定門檻提高到 25，增加點擊成功率
    if (dx > 25 || dy > 25) {
      hasMovedSignificant.current = true;
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent, show: any) => {
    // 1. 先移除目前這隻手指
    activePointers.current.delete(e.pointerId);
    
    const wasMultitouch = isMultitouch.current;
    const wasLongPress = isLongPress.current;
    const wasMoved = hasMovedSignificant.current;

    // 💡 關鍵保險：如果目前的集合已經空了，或者這是觸控點的最後一次事件
    // 強制重置所有狀態，確保下一次點擊是全新的開始
    if (activePointers.current.size === 0) {
      isMultitouch.current = false;
      // 這裡不需要重置 hasMovedSignificant，因為它是給這次判定用的
    }

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // 2. 只有在「完全乾淨」的單指狀態下才執行選取
    // 我們同時檢查 activePointers 的大小，確保真的沒人在螢幕上了
    if (!wasMultitouch && !wasLongPress && !wasMoved && activePointers.current.size === 0) {
      handleToggle(show);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    activePointers.current.clear(); // 直接清空所有手指紀錄
    isMultitouch.current = false;
    hasMovedSignificant.current = false;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMemberColorChange = async (c: string) => {
    setUserColor(c);
    if (currentSquad && email) { await supabase.from('squad_members').update({ user_color: c }).eq('squad_id', currentSquad.id).eq('user_email', email); fetchSquadMembers(); }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('🚨 確定要徹底刪除帳號嗎？')) return;
    await supabase.from('user_selections').delete().eq('user_email', email);
    await supabase.from('squad_members').delete().eq('user_email', email);
    localStorage.removeItem('megaport_email'); setIsLogin(false);
  };

  const selectSquad = async (s: any) => {
    const { data } = await supabase.from('squad_members').select('user_name, user_color').eq('squad_id', s.id).eq('user_email', email).single();
    if (data) { setUserName(data.user_name); setUserColor(data.user_color); }
    localStorage.setItem('megaport_squad_id', s.id); setCurrentSquad(s);
  };

  const handleJoinOrCreate = async (mode: 'join' | 'create') => {
    if (!userName.trim()) return alert('請輸入名稱');
    if (mode === 'join') {
      // 優先使用輸入框內的 code (這時已經被 useEffect 自動填入了)
      const code = inviteCode.trim(); 
      if (!code) return alert('請輸入邀請碼');
      
      const { data: s } = await supabase.from('squads').select('*').eq('invite_code', code).single();
      if (s) { 
        await supabase.from('squad_members').upsert([{ squad_id: s.id, user_email: email, user_name: userName, user_color: userColor }]); 
        fetchMySquads(email, s.id); 
      }
      else alert('邀請碼不正確');
    } else {
      const name = prompt('新小隊名稱：');
      if (!name) return;
      const code = `MEGA-${Math.floor(100000 + Math.random() * 900000)}`;
      const { data: ns } = await supabase.from('squads').insert([{ squad_name: name, invite_code: code }]).select().single();
      if (ns) { await supabase.from('squad_members').insert([{ squad_id: ns.id, user_email: email, user_name: userName, user_color: userColor }]); fetchMySquads(email, ns.id); }
    }
  };

  const handleRenameSquad = async () => {
    if (!currentSquad) return;
    const n = prompt('新的小隊名稱：', currentSquad.squad_name);
    if (n && n.trim() !== '') { await supabase.from('squads').update({ squad_name: n.trim() }).eq('id', currentSquad.id); setCurrentSquad({...currentSquad, squad_name: n.trim()}); }
  };

  const handleCopyInvite = () => { 
    if (!currentSquad) return; 
    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?invite=${currentSquad.invite_code}`)
      .then(() => alert(`邀請連結已複製！\n隊友點開即可自動填入邀請碼：${currentSquad.invite_code}`)); 
  };

  if (!mounted) return null;
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
    <main className="h-screen flex flex-col bg-white overflow-hidden text-black font-sans relative">
      {/* 🗺️ 一、 Header 頂部管理導航欄 */}
      <div className="p-4 bg-white border-b border-zinc-300 flex justify-between items-center z-[100] shrink-0 text-black">
        <div className="flex-1 flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 cursor-pointer group shrink-0" onClick={() => setShowMembers(true)}>
             <span className="font-black text-[12px] uppercase group-hover:text-[#E85427] transition-colors text-black whitespace-nowrap">
  {currentSquad?.squad_name}
</span>
             <button className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full transition-all shadow-sm ${!compareMemberEmail ? 'bg-zinc-100 text-black' : ''}`}
               style={compareMemberEmail ? { backgroundColor: comparedMember?.user_color, color: '#FFFFFF' } : {}}>
                <span className="text-[10px]">{compareMemberEmail ? '🎯' : '👥'}</span>
             </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2 text-black">
          <button onClick={() => setShowArtistList(true)} className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-all shadow-sm text-black">
             <span className="text-[10px]">🎸</span><span className="text-[8px] font-black uppercase tracking-wider">ARTISTS</span>
          </button>
          <button onClick={() => setShowWallpaperMenu(true)} className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-all shadow-sm text-black">
            <span className="text-[8px] font-black uppercase tracking-wider">生成桌布</span>
          </button>
          <div className="flex items-center gap-1 bg-zinc-50 px-2 py-1.5 rounded-full border border-zinc-200 shadow-sm text-black">
            <span className="text-[7px] font-black text-zinc-400 uppercase tracking-tighter">COLOR</span>
            <input type="color" value={userColor} onChange={e => handleMemberColorChange(e.target.value)} className="w-3.5 h-3.5 rounded-full bg-transparent border-none cursor-pointer" />
          </div>
          <div className="flex bg-zinc-100 rounded-lg p-0.5 shadow-sm text-black">
            {['2026-03-21', '2026-03-22'].map(d => (
              <button key={d} onClick={() => { setCurrentDate(d); localStorage.setItem('megaport_current_date', d); }} className={`px-2 py-1.5 rounded-md text-[8px] font-black ${currentDate === d ? 'bg-black text-white' : 'text-zinc-400'}`}>{d.split('-')[2]}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 🗺️ 二、 大港課表主地圖 */}
      <div 
        ref={scrollContainerRef} 
        className="flex-1 overflow-auto relative bg-white no-scrollbar"
        style={{ 
          touchAction: 'auto', // 恢復手機滑動
          WebkitOverflowScrolling: 'touch' 
        }}
      >
        <div style={{ 
          transform: `scale(${zoom})`, 
          transformOrigin: 'top left', 
          width: `${100 / zoom}%`, 
          // 🛠️ 修改高度：將原本的 ${100 / zoom}% 改為固定高度
          // 表格約 2645px，1.5 倍大約是 4000px
          height: '1250px', 
          position: 'relative' 
        }}>
          {/* 內部直接接 inline-grid */}
          <div className="inline-grid p-10 px-20 rounded-3xl" style={{ 
            display: 'grid', 
            gridTemplateColumns: `100px repeat(10, 200px) 100px`, 
            gridTemplateRows: `80px repeat(57, 45px)`, 
            minWidth: '2200px', 
            backgroundColor: '#FFFFFF', 
            border: '2px solid rgba(0,0,0,0.2)', 
            touchAction: 'auto', 
            position: 'relative' 
          }}>
            {/* 🌑 1. 智慧時間遮罩 (層級 200) */}
            {showTimeMask && maskConfig.visible && maskConfig.height > 0 && (
              <div style={{
                gridColumn: '1 / 13', gridRow: '1', position: 'absolute', top: 0, left: 0, right: 0, height: `${maskConfig.height}px`,
                backgroundColor: 'rgba(0, 0, 0, 0.65)', mixBlendMode: 'multiply',
                borderBottom: maskConfig.isPastDay ? 'none' : '4px solid #FFFFFF',
                boxShadow: maskConfig.isPastDay ? 'none' : '0 4px 20px rgba(0,0,0,0.3)',
                zIndex: 200, pointerEvents: 'none', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', paddingLeft: '120px', paddingBottom: '5px'
              }}>
                {!maskConfig.isPastDay && (
                  <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: '60px', color: 'rgba(255, 255, 255, 0.9)', letterSpacing: '-0.02em', whiteSpace: 'nowrap', textShadow: '2px 2px 0px rgba(0, 0, 0, 0.3)' }}>
                    {randomQuote}
                  </span>
                )}
              </div>
            )}

            {/* 2. 左上角日期方塊 (十字路口，層級 500) */}
            <div className="bg-black text-white border-b border-r border-zinc-800 flex items-center justify-center font-black text-[42px] z-[500]" 
                 style={{ 
                   gridColumn: '1', gridRow: '1', paddingBottom: '20px', position: 'relative',
                   transform: 'translate3d(var(--scroll-x, 0px), var(--scroll-y, 0px), 0)', // 同時鎖定 X 與 Y
                   willChange: 'transform'
                 }}>
              {dayNum}
            </div>

            {/* 3. 上方舞台標籤列 (層級 400) */}
            {Object.keys(STAGE_THEME).map((s, idx) => (
              <div key={s} className="flex items-center justify-center font-black text-[42px] z-[400] border border-black" 
                   style={{ 
                     gridColumnStart: idx + 2, gridRow: '1', backgroundColor: STAGE_THEME[s].bg, color: STAGE_THEME[s].text, paddingBottom: '20px', borderBottom: '1px solid #000000',
                     position: 'relative',
                     transform: 'translate3d(0, var(--scroll-y, 0px), 0)', // 只鎖定 Y 軸
                     willChange: 'transform'
                   }}>
                {s}
              </div>
            ))}

            {/* 4. 右上角日期方塊 (層級 400) */}
            <div className="bg-black text-white border-b border-l border-zinc-800 flex items-center justify-center font-black text-[42px] z-[400]" 
                 style={{ 
                   gridColumn: '12', gridRow: '1', paddingBottom: '20px', position: 'relative',
                   transform: 'translate3d(0, var(--scroll-y, 0px), 0)', // 只鎖定 Y 軸
                   willChange: 'transform'
                 }}>
              {dayNum}
            </div>

            {/* 5. 垂直背景底色列 */}
            {Object.keys(STAGE_THEME).map((_, idx) => (
              <div key={`bg-col-${idx}`} style={{ gridColumnStart: idx + 2, gridRow: '2 / 60' }} className={`pointer-events-none z-0 border-r border-zinc-300 ${idx % 2 === 0 ? 'bg-zinc-200' : 'bg-white'}`}></div>
            ))}

            {/* 6. 對照成員時的陰影層 */}
            {compareMemberEmail && <div className="pointer-events-none transition-opacity duration-500" style={{ gridRow: '2 / 60', gridColumn: '2 / 12', backgroundColor: 'rgba(0, 0, 0, 0.3)', zIndex: 45 }} />}

            {/* 7. 時間軸與橫線 (層級 300) */}
            {Array.from({ length: 57 }).map((_, i) => {
              const minutes = (12 * 60 + 30 + i * 10);
              const timeStr = `${Math.floor(minutes / 60)}:${minutes % 60 === 0 ? '00' : minutes % 60}`;
              return (
                <div key={`grid-row-${i}`} className="contents text-black">
                  {/* 左側固定時間 */}
                  <div className="flex items-center justify-center z-[300]" 
                       style={{ 
                         gridRowStart: i + 2, gridColumn: '1', position: 'relative', height: '0px',
                         transform: 'translate3d(var(--scroll-x, 0px), -50%, 0)', // 只鎖定 X 軸位移
                         willChange: 'transform'
                       }}>
                    <span className="bg-[#FFF9E1] px-4 py-1 border border-zinc-400 font-mono font-bold text-[24px] text-zinc-500 rounded-sm">{timeStr}</span>
                  </div>
                  {/* 右側固定時間 (不跟隨 X 軸動) */}
                  <div className="flex items-center justify-center z-[300]" style={{ gridRowStart: i + 2, gridColumn: '12', transform: `translateY(-50%)`, position: 'relative', height: '0px' }}>
                    <span className="bg-[#FFF9E1] px-4 py-1 border border-zinc-400 font-mono font-bold text-[24px] text-zinc-500 rounded-sm">{timeStr}</span>
                  </div>
                  {/* 背景橫線 */}
                  {i < 56 && <div className={`pointer-events-none z-10 ${minutes % 60 === 50 ? 'border-b-[4px] border-zinc-500' : 'border-b border-zinc-300'}`} style={{ gridRowStart: i + 2, gridColumn: '2 / 12' }}></div>}
                </div>
              )
            })}

            {/* --- 表演格子開始 --- */}
            {Object.keys(STAGE_THEME).map((stage, colIndex) => {
              const shows = gridData[stage] || [];
              return shows.map((show: any) => {
                const attendees = allSelections.filter(s => String(s.performance_id) === String(show.id));
                const isMe = attendees.some(a => String(a.user_email) === String(email));
                const isComparedMember = attendees.some(a => String(a.user_email) === String(compareMemberEmail));
                const spotlightActive = compareMemberEmail !== null;
                const isMeSpotlight = compareMemberEmail === email;
                const isFriendSpotlight = spotlightActive && !isMeSpotlight;
                let finalBg = STAGE_THEME[stage].bg; let textColor = 'text-black'; let borderStyle = 'none'; let opacity = 1;
                if (isMeSpotlight) { if (isMe) { finalBg = STAGE_THEME[stage].bg; borderStyle = '6px solid #000000'; } else { opacity = 0.5; textColor = 'text-black/40'; } }
                else if (isFriendSpotlight) { if (isComparedMember) { finalBg = STAGE_THEME[stage].bg; borderStyle = '6px solid #000000'; } if (isMe) { finalBg = '#E85427'; textColor = 'text-white'; } if (!isMe && !isComparedMember) { opacity = 0.5; textColor = 'text-black/40'; } }
                else if (isMe) { finalBg = '#E85427'; textColor = 'text-white'; }
                const startRow = Math.floor(((Number(show.start.split(':')[0]) * 60 + Number(show.start.split(':')[1])) - (12 * 60 + 30)) / 10) + 2;
                const endRow = Math.floor(((Number(show.end.split(':')[0]) * 60 + Number(show.end.split(':')[1])) - (12 * 60 + 30)) / 10) + 2;
                const physicalSize = (isOverview ? 14 : 26.4) / zoom; 
                return (
    <div 
      key={show.id} 
      onPointerDown={(e) => handlePointerDown(e, show)} 
      onPointerMove={handlePointerMove} 
      onPointerUp={(e) => handlePointerUp(e, show)} 
      onPointerCancel={handlePointerCancel}
      className={`mx-[1px] my-[1px] flex items-center justify-center text-center cursor-pointer relative transition-all duration-300 select-none ${isMe && !spotlightActive ? 'shadow-2xl' : ''}`} 
      style={{ 
        gridRow: `${startRow} / ${endRow}`, 
        gridColumnStart: colIndex + 2, 
        backgroundColor: finalBg, 
        border: borderStyle, 
        boxSizing: 'border-box', 
        zIndex: (isComparedMember || (isMeSpotlight && isMe)) ? 60 : 30, 
        opacity: opacity, 
        filter: (spotlightActive && !isMe && !isComparedMember) ? 'brightness(0.7) grayscale(20%)' : 'none',
        
        // 💡 這裡是關鍵修改點：
        touchAction: 'manipulation',      // 1. 允許手勢縮放與捲動，但禁止「雙擊縮放」，避免單擊延遲
        userSelect: 'none',               // 2. 禁止選取文字，避免長按時出現藍色選取區塊
        WebkitUserSelect: 'none',         // 3. iOS 版本的禁止選取文字
        WebkitTouchCallout: 'none',       // 4. 禁止 iOS 長按時彈出系統選單（如：拷貝、查詢）
      }}
    >
                   
                   {/* 🛠️ 最終 Debug 資訊層：包含人數、佔比與排名 */}


                    {/* 🔥 火力預報圖標：放在右上角 */}
                    {showHeatMap && heatLevels[show.id]?.level > 0 && (
  <div className="absolute -top-6 -right-0 z-[100] pointer-events-none select-none drop-shadow-[0_4px_8px_rgba(255,100,0,0.4)]">
    <span className="text-[32px]">
      {"🔥".repeat(heatLevels[show.id].level)}
    </span>
  </div>
)}

                    <p className={`font-black tracking-tighter text-[36px] leading-[1.3] p-2 whitespace-pre-line ${textColor}`}>{show.artist}</p>
                    
                    {/* 💡 加上 showGridIcons 判斷，來決定是否渲染成員圖標 */}
                    {showGridIcons && (isMe || (spotlightActive && isComparedMember) || !spotlightActive) && (
                      <div className={`absolute bottom-1 left-2 max-w-[90%] flex flex-row pointer-events-none overflow-hidden ${isOverview ? '-space-x-3' : '-space-x-1.5'}`}>
                        {attendees.map((f, i) => {
                          const m = memberList.find(ml => ml.user_email === f.user_email);
                          return ( <div key={i} className="rounded-full flex items-center justify-center font-black text-white border border-black shadow-sm" style={{ backgroundColor: m?.user_color || '#000', width: `${physicalSize}px`, height: `${physicalSize}px`, fontSize: `${physicalSize * 0.45}px`, zIndex: attendees.length - i }}>{(m?.user_name || f.user_name || '?').charAt(0)}</div> );
                        })}
                      </div>
                    )}
                  </div>
                );
              });
            })}
          </div>
        </div>
      </div>

      {/* 💡 三、 獨立浮動組件 (Modal 與 Zoom) */}
      {/* 💡 修正：Zoom 切換邏輯，確保其中一檔精準回到預設的 0.28 */}
      <div className="fixed bottom-26 right-4 z-[600]">
        <button 
          onClick={() => {
            // 如果現在是大於 0.3 (近看模式)，就縮回預設的 0.28 (全覽)
            // 如果現在是 0.28，就放大到 0.45 (近看)
            setZoom(zoom > 0.3 ? 0.23 : 0.40);
          }} 
          className="w-14 h-14 bg-white border-2 border-zinc-200 rounded-full shadow-2xl flex items-center justify-center text-2xl active:scale-90 transition-all text-black"
        >
          {zoom > 0.3 ? "🌍" : "🔎"}
        </button>
      </div>

      {showWallpaperMenu && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[800] flex items-center justify-center p-6" onClick={() => setShowWallpaperMenu(false)}>
          <div className="bg-white w-full max-w-xs rounded-[32px] p-8 shadow-2xl flex flex-col items-center space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black italic underline decoration-[#E85427] mb-2 text-black">選擇輸出版本</h3>
            <button onClick={() => { setWallpaperMode('generated'); setShowColorPicker(true); setShowWallpaperMenu(false); }} className="w-full bg-black text-white py-4 rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all text-white">📲 人生音樂版</button>
            <button onClick={() => { setWallpaperMode('static'); setShowContactPrompt(true); setShowWallpaperMenu(false); }} className="w-full bg-[#E85427] text-white py-4 rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all text-white">📍 地圖版</button>
            <button onClick={() => setShowWallpaperMenu(false)} className="text-zinc-400 font-bold text-xs pt-2">取消</button>
          </div>
        </div>
      )}

      {/* 📜 Artist 列表視窗 */}
      {showArtistList && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm" onClick={() => setShowArtistList(false)}>
          <div className="bg-white w-full max-w-lg h-[85vh] rounded-[40px] p-8 shadow-2xl flex flex-col border border-black/10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-4 shrink-0 text-black">
              <h3 className="text-xl font-black uppercase tracking-tighter">ARTISTS</h3>
              <button onClick={() => setShowArtistList(false)} className="py-2 px-4 bg-zinc-100 rounded-xl text-xs font-bold active:scale-95 text-black">關閉</button>
            </div>
            <div className="grid grid-cols-2 gap-3 py-4 shrink-0">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">舞台篩選</label>
                <select value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)} className="w-full p-3 border border-zinc-100 bg-white text-black rounded-2xl font-bold text-xs outline-none focus:border-[#E85427] appearance-none cursor-pointer" style={{ backgroundColor: selectedStage !== '全部舞台' ? STAGE_THEME[selectedStage]?.bg : '#F4F4F5' }}>
                  <option value="全部舞台">全部舞台</option>
                  {Object.keys(STAGE_THEME).map(s => (<option key={s} value={s} style={{ backgroundColor: STAGE_THEME[s].bg }}>{s}</option>))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">列表排序</label>
                <select value={artistSort} onChange={(e) => setArtistSort(e.target.value as any)} className="w-full p-3 bg-zinc-50 text-black border border-zinc-200 rounded-2xl font-bold text-xs outline-none cursor-pointer appearance-none">
                  <option value="time">依照演出時間</option>
                  <option value="alphabet">字母 A-Z</option>
                  <option value="selected">我的選擇優先</option>
                  <option value="popular">隊友最愛優先</option>
                </select>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar pb-10">
              {flatArtistData.map((show: any) => {
                const isMe = allSelections.some(s => s.user_email === email && String(s.performance_id) === String(show.id));
                const hasLink = SPOTIFY_LINKS[show.id]; 
                return (
                  <div key={show.id} onPointerDown={(e) => handlePointerDown(e, show)} onPointerMove={handlePointerMove} onPointerUp={(e) => handlePointerUp(e, show)} className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${isMe ? 'bg-[#E85427] border-[#E85427] shadow-lg scale-[0.98]' : 'bg-white border-zinc-100 hover:border-zinc-300'}`}>
                    <div className="flex flex-col gap-1 flex-1 text-black">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black leading-tight ${isMe ? 'text-white' : 'text-black'}`}>{show.artist.replace(/\n/g, ' ')}</span>
                        {hasLink && <button onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => { e.stopPropagation(); setSpotifyArtist(show); }} className="w-5 h-5 bg-[#C5EBC3] text-black/70 rounded-full flex items-center justify-center shadow-sm shrink-0 active:scale-90"><span className="text-[9px]">🔗</span></button>}
                      </div>
                      <div className={`text-[10px] font-bold flex flex-wrap gap-x-2 gap-y-0.5 ${isMe ? 'text-white/70' : 'text-zinc-400'}`}>
                        <span className="px-1.5 py-0.5 rounded text-[8px] border border-black/5" style={{ backgroundColor: STAGE_THEME[show.stage]?.bg, color: STAGE_THEME[show.stage]?.text }}>{show.stage}</span>
                        <span>{show.date.split('-')[2]}日</span><span>{show.start}-{show.end}</span>
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                      {show.attendees.map((attendee: any, idx: number) => {
                        const m = memberList.find(ml => ml.user_email === attendee.user_email);
                        return ( <div key={idx} className="w-6 h-6 rounded-full border border-white flex items-center justify-center font-black text-white text-[8px] shadow-sm" style={{ backgroundColor: m?.user_color || '#000', zIndex: 10 - idx }}>{(m?.user_name || attendee.user_name || '?').charAt(0)}</div> );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    {/* 💡 三、底部懸浮主控台 */}
<div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-zinc-200 z-[500] px-4 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] text-black">
  <div className="w-full flex flex-col items-start mx-auto" style={{ maxWidth: 'min(100vw, 2200px)' }}>
    
    {/* 隊友按鈕列 */}
    <div className="w-full flex flex-nowrap overflow-x-auto no-scrollbar justify-start items-center gap-2 py-2">
      {sortedMemberList.map((m, i) => (
        <button key={i} onClick={() => setCompareMemberEmail(compareMemberEmail === m.user_email ? null : m.user_email)}
          className={`flex items-center justify-center px-3 py-1.5 rounded-full border-2 transition-all shrink-0 active:scale-95 text-white ${compareMemberEmail === m.user_email ? 'ring-2 ring-black ring-offset-1 scale-105' : 'border-black/5'}`}
          style={{ backgroundColor: m.user_color, color: '#FFFFFF', borderColor: '#000000' }}>
          <span className="text-[10px] font-black tracking-normal whitespace-nowrap">
  {m.user_name} {m.user_email === email && "(我)"}
</span>
        </button>
      ))}
    </div>

    {/* 💡 提示語區與雙開關並排 */}
          <div className="w-full flex justify-between items-end pb-1 px-1">
            
            {/* 左側提示文字 */}
            <div className="flex flex-col text-[8px] leading-tight text-zinc-400 font-bold italic text-left">
              <span>{currentHint[0]}</span>
              <span>{currentHint[1]}</span>
            </div>
            
            {/* 右側：統一的開關膠囊容器 */}
            <div className="flex flex-row items-center gap-4 bg-zinc-100/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-zinc-200 shadow-sm">
              {/* 🔥 人氣開關 */}
              <div className="flex items-center gap-1.5">
                <span className="text-[7px] font-black text-zinc-500 uppercase tracking-tighter whitespace-nowrap">人氣</span>
                <button 
                  onClick={() => {
                    const nextHeatState = !showHeatMap;
                    setShowHeatMap(nextHeatState);
                    localStorage.setItem('megaport_show_heat', String(nextHeatState));
                  }}
                  // 🛠️ 修改：人氣開關啟用時變黃色 (大港金 #FAD390)
                  className={`w-6 h-3.5 rounded-full transition-all relative shrink-0 ${showHeatMap ? 'bg-[#FAD390]' : 'bg-zinc-300'}`}
                >
                  <div className={`w-2 h-2 bg-white rounded-full absolute top-0.5 transition-all ${showHeatMap ? 'left-3.5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="w-[1px] h-3 bg-zinc-300"></div>
              {/* 🌑 遮罩開關 */}
              <div className="flex items-center gap-1.5">
                <span className="text-[7px] font-black text-zinc-500 uppercase tracking-tighter whitespace-nowrap">遮罩</span>
                <button 
                  onClick={() => {
                    const nextMaskState = !showTimeMask;
                    setShowTimeMask(nextMaskState);
                    // 💡 同步儲存到本地紀錄
                    localStorage.setItem('megaport_show_mask', String(nextMaskState));
                  }}
                  // 🛠️ 修改：遮罩開關啟用時變灰色 (灰 #A1A1AA)
                  className={`w-6 h-3.5 rounded-full transition-all relative shrink-0 ${showTimeMask ? 'bg-[#A1A1AA]' : 'bg-zinc-300'}`}
                >
                  <div className={`w-2 h-2 bg-white rounded-full absolute top-0.5 transition-all ${showTimeMask ? 'left-3.5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="w-[1px] h-3 bg-zinc-300"></div>
              {/* 🎨 隊友開關 */}
              <div className="flex items-center gap-1.5">
                <span className="text-[7px] font-black text-zinc-500 uppercase tracking-tighter whitespace-nowrap">隊友</span>
                <button 
                  onClick={() => {
                    const nextState = !showGridIcons;
                    setShowGridIcons(nextState);
                    localStorage.setItem('megaport_show_icons', String(nextState));
                  }}
                  // 🛠️ 修改這裡是 #FF7F50 (珊瑚橘)，比原本的 #E85427 淺一點
                  className={`w-6 h-3.5 rounded-full transition-all relative shrink-0 ${showGridIcons ? 'bg-[#FF7F50]' : 'bg-zinc-300'}`}
                >
                  <div className={`w-2 h-2 bg-white rounded-full absolute top-0.5 transition-all ${showGridIcons ? 'left-3.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div> 
          </div>
  </div>
</div>

      {showMembers && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400] flex items-center justify-center p-6 text-black" onClick={() => setShowMembers(false)}>
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl space-y-6 relative text-black" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start border-b pb-4 relative text-black">
              <div className="flex flex-col gap-1.5 pr-16 group text-black">
                <div className="flex items-center gap-3 text-[#E85427]">
                  <span className="text-[10px] font-black uppercase tracking-widest shrink-0">目前小隊</span>
                  <button onClick={handleCopyInvite} className="flex items-center gap-1 active:scale-95 transition-all"><span className="text-[10px] font-black tracking-tighter">🔗 {currentSquad?.invite_code}</span><span className="text-[10px] font-black">邀請連結</span></button>
                </div>
                <div className="flex items-center gap-2 text-black"><h3 className="text-xl font-black uppercase break-all leading-tight text-black">{currentSquad?.squad_name}</h3><button onClick={handleRenameSquad} className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-all text-[10px] font-black text-black">變更</button></div>
              </div>
              <button onClick={() => { setCurrentSquad(null); setShowMembers(false); }} className="absolute top-0 right-0 py-2 px-3 bg-zinc-100 hover:bg-black hover:text-white text-black font-bold rounded-xl text-[10px] transition-all active:scale-95 shadow-sm text-black">✕ 回清單</button>
            </div>
            <div className="space-y-3 max-h-[40vh] overflow-auto pr-2 text-black">
              {memberList.map((m, i) => (
                <div key={i} onClick={() => { if(m.user_email !== email) { setCompareMemberEmail(m.user_email === compareMemberEmail ? null : m.user_email); setShowMembers(false); } }} 
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${m.user_email === compareMemberEmail ? 'bg-[#E85427] border-[#E85427] text-white shadow-lg' : 'bg-zinc-50 border-zinc-100 hover:border-zinc-300'}`}>
                   <div className="flex items-center gap-3 text-black"><div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white shadow-sm text-white" style={{ backgroundColor: m.user_color }}>{m.user_name?.charAt(0)}</div><span className={`font-bold text-sm ${m.user_email === compareMemberEmail ? 'text-white' : 'text-black'}`}>{m.user_name} {m.user_email === email && "(我)"}</span></div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-zinc-50 text-black"><button onClick={() => { if(confirm(`確定要退出「${currentSquad?.squad_name}」嗎？`)) { supabase.from('squad_members').delete().eq( 'squad_id', currentSquad.id).eq('user_email', email).then(() => { localStorage.removeItem('megaport_squad_id'); setCurrentSquad(null); setShowMembers(false); fetchMySquads(email); }); } }} className="w-full py-4 bg-zinc-50 hover:bg-red-50 text-red-500 font-black rounded-2xl text-sm transition-colors active:scale-95 text-red-500">退出目前小隊</button></div>
          </div>
        </div>
      )}

      

      {spotifyArtist && <SpotifyModal artist={spotifyArtist} onClose={() => setSpotifyArtist(null)} />}
      <WallpaperLayout date={currentDate} bgColor={wallpaperBg} textColor={wallpaperText} wallpaperRef={wallpaperRef} selectedShows={allSelections.filter(s => s.user_email === email && String(s.performance_id).includes(currentDate.split('-')[2]))} mode={wallpaperMode} contactInfo={contactNumber} maskMode={onlyMeWallpaper} />
      
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[800] flex items-center justify-center p-6 text-black" onClick={() => setShowColorPicker(false)}>
          <div className="bg-white w-full max-w-xs rounded-3xl p-8 shadow-2xl flex flex-col items-center space-y-6 text-black" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black italic underline decoration-[#E85427] text-black">人生音樂版輸出</h3>
            <div className="flex flex-col gap-4 w-full text-black">
              <div className="flex justify-between items-center w-full px-2 font-bold text-xs text-black"><span>背景色</span><input type="color" value={wallpaperBg} onChange={e => setWallpaperBg(e.target.value)} className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer" /></div>
              <div className="flex justify-between items-center w-full px-2 font-bold text-xs text-black"><span>大字色</span><input type="color" value={wallpaperText} onChange={e => setWallpaperText(e.target.value)} className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer" /></div>
              <div className="flex justify-between items-center w-full px-2 pt-2 border-t border-zinc-100 text-black"><span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">輸出個人聚焦版</span><button onClick={() => setOnlyMeWallpaper(!onlyMeWallpaper)} className={`w-10 h-5 rounded-full transition-all relative ${onlyMeWallpaper ? 'bg-black' : 'bg-zinc-200'}`}><div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${onlyMeWallpaper ? 'left-6' : 'left-1'}`} /></button></div>
              <div className="w-full pt-2 text-black"><span className="text-[10px] font-black text-zinc-400 uppercase mb-2 block text-black">緊急聯絡電話 (選填 / 零後台)</span><input type="text" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="09XXXXXXXX" className="w-full p-3 border border-zinc-100 bg-zinc-50 rounded-xl font-bold text-sm outline-none focus:border-[#E85427] text-black" /></div>
            </div>
            <button onClick={() => executeDownload('generated')} className="w-full py-4 bg-[#E85427] text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-white">確認下載</button>
            <button onClick={() => setShowColorPicker(false)} className="text-zinc-400 font-bold text-xs text-black">取消</button>
          </div>
        </div>
      )}

      {showContactPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[800] flex items-center justify-center p-6 text-black" onClick={() => setShowContactPrompt(false)}>
          <div className="bg-white w-full max-w-xs rounded-3xl p-8 shadow-2xl flex flex-col items-center space-y-6 text-black" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black italic underline decoration-[#E85427] text-black">地圖版輸出</h3>
            <div className="flex justify-between items-center w-full px-4 py-3 bg-zinc-50 rounded-2xl text-black"><span className="text-[10px] font-black text-zinc-500 uppercase">輸出個人聚焦版</span><button onClick={() => setOnlyMeWallpaper(!onlyMeWallpaper)} className={`w-10 h-5 rounded-full transition-all relative ${onlyMeWallpaper ? 'bg-black' : 'bg-zinc-200'}`}><div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${onlyMeWallpaper ? 'left-6' : 'left-1'}`} /></button></div>
            <div className="w-full text-center text-black"><span className="text-[10px] font-black text-zinc-400 uppercase mb-2 block text-black">緊急聯絡電話 (選填 / 零後台)</span><input type="text" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="09XXXXXXXX" className="w-full p-4 border border-zinc-100 bg-zinc-50 rounded-2xl font-bold text-center outline-none focus:border-[#E85427] text-black" /></div>
            <button onClick={() => executeDownload('static')} className="w-full py-4 bg-[#E85427] text-white font-black rounded-2xl shadow-xl active:scale-95 text-white">確認下載</button>
            <button onClick={() => setShowContactPrompt(false)} className="text-zinc-400 font-bold text-xs text-black">取消</button>
          </div>
        </div>
      )}
    {detailShow && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[700] flex items-center justify-center p-6 text-black" onClick={() => setDetailShow(null)}>
          <div className="bg-white w-full max-w-xs rounded-[40px] p-10 shadow-2xl space-y-4 flex flex-col items-center animate-in fade-in zoom-in duration-200 text-black" onClick={e => e.stopPropagation()}>
            <div className="text-center flex flex-col items-center text-black">
              <div className="flex items-center justify-center gap-3"><h3 className="text-2xl font-black italic underline decoration-[#E85427] tracking-tighter whitespace-pre-line text-black">{detailShow.artist.replace(/\n/g, ' ')}</h3>{SPOTIFY_LINKS[detailShow.id] && <button onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => { e.stopPropagation(); setSpotifyArtist(detailShow); }} className="w-6 h-6 bg-[#C5EBC3] text-black/70 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all shrink-0"><span className="text-[10px]">🔗</span></button>}</div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-1">{detailShow.start} — {detailShow.end}</p>
            </div>
            <div className="w-full bg-zinc-50 rounded-3xl p-6 flex flex-col max-h-[50vh] overflow-hidden text-black">
              <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest block mb-4 text-zinc-400">已選取隊友 (點選可對照)</span>
              <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1">
                {allSelections.filter(s => String(s.performance_id) === String(detailShow.id)).map((attendee, idx) => {
                  const m = memberList.find(ml => ml.user_email === attendee.user_email);
                  return (
                    <div key={idx} onClick={() => { if(attendee.user_email !== email) { setCompareMemberEmail(attendee.user_email === compareMemberEmail ? null : attendee.user_email); setDetailShow(null); } }} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${attendee.user_email === compareMemberEmail ? 'bg-[#E85427] text-white shadow-md' : ''}`}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-white text-[10px] shadow-sm" style={{ backgroundColor: m?.user_color || '#000' }}>{(m?.user_name || attendee.user_name || '?').charAt(0)}</div><span className={`font-bold text-sm ${attendee.user_email === compareMemberEmail ? 'text-white' : 'text-black'}`}>{m?.user_name || attendee.user_name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <button onClick={() => setDetailShow(null)} className="w-full py-4 bg-black text-white rounded-2xl font-black shadow-lg text-white">返回團序</button>
          </div>
        </div>
      )}
      {/* 🎨 加入作者簽名水印 (固定在左下角，Footer 上方) */}
      <div className="fixed bottom-[92px] right-4 z-[550] pointer-events-none select-none">
        <span className="text-[4px] font-black text-zinc-400 opacity-40 uppercase tracking-widest font-mono">
          made by @yuanchou1107
        </span>
      </div>
    </main>
  );
}