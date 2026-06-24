'use client';

import { useEffect, useState, useRef } from 'react';
import { useLang } from '@/hooks/useLang';
import { COPY } from '@/lib/constants';
import { Heading, Subtitle, Body } from '@/components/ui/Typography';

export default function Travel() {
  const { lang } = useLang();
  const copy = COPY[lang].travel;
  const [isVisible, setIsVisible] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showHanoiDetails, setShowHanoiDetails] = useState(false);
  const [hanoiSlide, setHanoiSlide] = useState<0 | 1>(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Show Hanoi details card automatically after zoom animation finishes
  useEffect(() => {
    if (isZoomed) {
      const timer = setTimeout(() => setShowHanoiDetails(true), 800);
      return () => clearTimeout(timer);
    } else {
      setShowHanoiDetails(false);
    }
  }, [isZoomed]);

  const revealStyle = (delay: number): React.CSSProperties => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.99)',
    transition: 'opacity 1200ms var(--ease-out-quart), transform 1200ms var(--ease-out-quart)',
    transitionDelay: `${delay}ms`,
  });

  const hanoiPlacesEn = [
    { name: 'Hoan Kiem Lake', desc: 'The beating heart of Hanoi. A jade-green lake wrapped by old trees, where locals practice tai chi at dawn and lovers stroll at dusk.' },
    { name: 'Old Quarter (36 Phố Phường)', desc: 'A maze of narrow streets, each named after the trade it once sold. Silver, silk, paper, tin. Get lost on purpose.' },
    { name: 'Train Street', desc: 'A residential alley where the railway runs inches from front doors. Sip egg coffee, then brace yourself as the train roars past.' },
    { name: 'West Lake (Hồ Tây)', desc: "The city's largest lake. Sunset here is a local ritual. Trấn Quốc Pagoda sits on its edge, glowing red against the water." },
    { name: 'Dong Xuan Market', desc: 'Four floors of everything. Fabric, dried fish, plastic flowers, knockoff sneakers. Chaotic, theatrical, essential.' },
    { name: 'Bat Trang Ceramic Village', desc: '30 minutes from the center. Watch potters at work, then throw your own bowl on a wheel.' }
  ];

  const hanoiPlacesVi = [
    { name: 'Hồ Hoàn Kiếm', desc: 'Trái tim của Hà Nội. Mặt hồ xanh ngọc bích được bao bọc bởi những rễ cây cổ thụ, nơi người dân tập thái cực quyền lúc bình minh và các cặp đôi dạo bước khi chiều buông.' },
    { name: 'Khu Phố Cổ (36 Phố Phường)', desc: 'Mê cung của những con phố nhỏ hẹp, mỗi con phố mang tên mặt hàng từng được bày bán: Hàng Bạc, Hàng Đào, Hàng Mã. Hãy thử một lần đi lạc có chủ đích.' },
    { name: 'Phố Đường Tàu', desc: 'Một con ngõ dân sinh nơi đường sắt chạy sát sạt trước cửa nhà. Nhâm nhi tách cà phê trứng, và nín thở khi chuyến tàu ầm ầm lao qua.' },
    { name: 'Hồ Tây', desc: 'Hồ nước lớn nhất thành phố. Ngắm hoàng hôn ở đây là một nghi thức của người bản địa. Chùa Trấn Quốc toạ lạc bên rìa hồ, rực rỡ sắc đỏ in bóng xuống mặt nước.' },
    { name: 'Chợ Đồng Xuân', desc: 'Khu chợ sầm uất bán đủ mọi thứ trên đời. Từ vải vóc, đồ khô cho đến hàng lưu niệm. Ồn ào, đậm chất địa phương nhưng là một phần không thể thiếu.' },
    { name: 'Làng gốm Bát Tràng', desc: 'Cách trung tâm 30 phút. Chiêm ngưỡng các nghệ nhân làm việc và tự tay vuốt cho mình một chiếc bát gốm trên bàn xoay.' }
  ];

  const hanoiPlaces = lang === 'en' ? hanoiPlacesEn : hanoiPlacesVi;

  return (
    <section 
      id="travel" 
      ref={sectionRef} 
      className="w-full max-w-7xl mx-auto px-5 md:px-10 py-24 md:py-32 overflow-hidden border-t border-ink/10"
    >
      <style>{`
        @keyframes finger-tap {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.95;
          }
          50% {
            transform: translate(-3px, -3px) scale(0.85);
            opacity: 1;
          }
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(0.4);
            opacity: 0;
          }
          50% {
            opacity: 0.45;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        .animate-tap {
          animation: finger-tap 1.6s ease-in-out infinite;
        }
        .animate-pulse-ring {
          animation: pulse-ring 1.6s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
        }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center px-4 md:px-0">
        {/* Left Column: Text */}
        <div 
          style={revealStyle(0)} 
          className="md:col-span-6 flex flex-col items-center md:items-start text-center md:text-left"
        >
          <Subtitle as="div" className="mb-4">
            {copy.subtitle}
          </Subtitle>
          <Heading variant="h2" className="mb-6">
            {copy.title}
          </Heading>
          <div className="w-12 h-[1px] bg-ink/20 mb-8 hidden md:block"></div>
          <div className="max-w-md">
            <Body variant="regular" className="text-ink-soft leading-relaxed" dangerouslySetInnerHTML={{ __html: copy.body }} />
          </div>
        </div>

        {/* Right Column: Image Frame */}
        <div 
          style={revealStyle(200)} 
          className="md:col-span-6 flex justify-center w-full"
        >
          <div 
            onClick={() => {
              setIsZoomed(!isZoomed);
              setHasInteracted(true);
            }}
            className={`relative w-full max-w-md overflow-hidden rounded-none p-6 bg-white/20 backdrop-blur-sm select-none transition-all duration-500 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
          >
            <div className="relative overflow-hidden aspect-[3/4] w-full flex items-center justify-center">
              {/* Zoomable Wrapper Container */}
              <div 
                className="relative w-full h-full"
                style={{
                  transform: isZoomed ? 'scale(1.85) translateY(-2%)' : 'scale(1) translateY(0)',
                  transformOrigin: '50% 15%',
                  transition: 'transform 1000ms var(--ease-out-quart)',
                }}
              >
                <img
                  src="/images/vietnam.png"
                  alt="Illustration of Vietnam"
                  className="w-full h-full object-contain select-none block mix-blend-multiply"
                  draggable={false}
                />
                
                {/* Hanoi Location Pin */}
                {isZoomed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHanoiDetails(true);
                    }}
                    className="absolute z-20 flex items-center justify-center cursor-pointer transition-opacity duration-500"
                    style={{ 
                      top: '20%', 
                      left: '43%',
                      transform: 'translate(-50%, -85%) scale(0.54)', // Counteract scale(1.85) so pin size remains 1:1 on screen
                      transformOrigin: 'bottom center',
                    }}
                  >
                    {/* Pulsing ring underneath */}
                    <span className="absolute bottom-0 inline-flex h-8 w-8 rounded-full bg-tan/40 animate-ping -translate-y-2"></span>
                    
                    {/* Map Pin SVG */}
                    <svg 
                      width="28" 
                      height="28" 
                      viewBox="0 0 24 24" 
                      fill="currentColor" 
                      className="text-tan drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] stroke-white stroke-[1.5]"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {!hasInteracted && isVisible && (
              <div 
                className="absolute pointer-events-none z-10"
                style={{
                  top: '60%',
                  left: '72%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="relative flex items-center justify-center w-16 h-16">
                  {/* Pulse Rings */}
                  <div className="absolute w-12 h-12 rounded-full border border-ink/30 bg-ink/5 animate-pulse-ring"></div>
                  <div className="absolute w-12 h-12 rounded-full border border-ink/10 bg-ink/5 animate-pulse-ring" style={{ animationDelay: '0.8s' }}></div>
                  
                  {/* Hand Pointer */}
                  <div className="relative text-ink animate-tap translate-x-3 translate-y-3">
                    <div className="-rotate-[28deg]">
                      <svg 
                        width="28" 
                        height="28" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M12 11V6a1.5 1.5 0 0 1 3 0v5" />
                        <path d="M8 11v-2a1.5 1.5 0 0 1 3 0v2" />
                        <path d="M15 11V9.5a1.5 1.5 0 0 1 3 0v1.5" />
                        <path d="M5 14a5 5 0 0 1 5-5h1a1 1 0 0 1 1 1v4" />
                        <path d="M18 11a1.5 1.5 0 0 1 1.5 1.5v3a5.5 5.5 0 0 1-11 0V14" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status indicator badge */}
            <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm border border-ink/10 w-8 h-8 rounded-full flex items-center justify-center text-ink-soft opacity-60 hover:opacity-100 transition-opacity duration-300">
              {isZoomed ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              )}
            </div>

            {/* Hanoi Detail Card Overlay */}
            <div 
              onClick={(e) => e.stopPropagation()} // Prevent clicking card from zooming out
              className={`absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-ink/10 p-4 transition-transform duration-500 ease-out z-30 flex flex-col gap-3 h-[85%] max-h-[420px] ${showHanoiDetails ? 'translate-y-0' : 'translate-y-full'}`}
            >
              <div className="flex items-start justify-between mb-1 shrink-0">
                <div className="flex flex-col">
                  <span className="font-display italic text-lg text-ink font-light leading-tight">
                    {lang === 'en' ? 'Hanoi Capital' : 'Thủ đô Hà Nội'}
                  </span>
                  <span className="text-[10px] text-ink-muted uppercase tracking-wider font-light mt-0.5">
                    {lang === 'en' ? 'Where the wedding takes place' : 'Nơi tổ chức đám cưới của chúng mình'}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex gap-1.5">
                    <button onClick={() => setHanoiSlide(0)} className={`w-1.5 h-1.5 rounded-full transition-colors ${hanoiSlide === 0 ? 'bg-ink' : 'bg-ink/20'}`} aria-label="Slide 1" />
                    <button onClick={() => setHanoiSlide(1)} className={`w-1.5 h-1.5 rounded-full transition-colors ${hanoiSlide === 1 ? 'bg-ink' : 'bg-ink/20'}`} aria-label="Slide 2" />
                  </div>
                  <button 
                    onClick={() => {
                      setShowHanoiDetails(false);
                      setTimeout(() => setHanoiSlide(0), 300); // Reset slide after closing
                    }}
                    className="w-6 h-6 rounded-full hover:bg-ink/5 flex items-center justify-center text-ink-soft/60 hover:text-ink transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Slider Container */}
              <div className="relative w-full overflow-hidden flex-1 flex flex-col min-h-0">
                <div 
                  className="flex flex-1 min-h-0 transition-transform duration-500 ease-in-out w-[200%]"
                  style={{ transform: hanoiSlide === 0 ? 'translateX(0)' : 'translateX(-50%)' }}
                >
                  {/* Slide 0: Places List */}
                  <div className="w-1/2 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto touch-pan-y pr-3 flex flex-col gap-4 pb-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-ink/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {hanoiPlaces.map((place, idx) => (
                        <div key={idx} className="flex flex-col gap-1.5 mb-1">
                          <span className="font-display text-[15px] md:text-base text-ink font-light leading-none">{place.name}</span>
                          <span className="font-body text-[11px] md:text-xs text-ink-soft leading-relaxed font-light">{place.desc}</span>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => setHanoiSlide(1)}
                      className="w-full mt-1 shrink-0 py-1.5 text-[9px] md:text-[10px] tracking-widest uppercase text-ink-soft hover:text-ink transition-colors flex items-center justify-end gap-1.5 group pr-2"
                    >
                      <span>{lang === 'en' ? 'Next: Video & Food Guide' : 'Tiếp theo: Video & Ẩm thực'}</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>

                  {/* Slide 1: Video and Michelin */}
                  <div className="w-1/2 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto touch-pan-y pr-3 flex flex-col gap-4 pb-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-ink/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {/* YouTube Video Embed Link */}
                      <a 
                        href="https://www.youtube.com/watch?v=u9VswvjJtfI" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="relative group w-full aspect-video rounded-none overflow-hidden border border-ink/10 block shadow-sm hover:shadow transition-shadow duration-300 shrink-0"
                      >
                        <img 
                          src="https://img.youtube.com/vi/u9VswvjJtfI/hqdefault.jpg" 
                          alt="Explore Hanoi YouTube Video" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-ink/20 opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/95 shadow-md flex items-center justify-center text-ink-soft transition-transform duration-300 group-hover:scale-110">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-3 text-[10px] text-white/90 uppercase tracking-widest bg-ink/40 px-2 py-0.5 rounded-sm backdrop-blur-[2px]">
                          {lang === 'en' ? 'Click to explore' : 'Nhấp để khám phá'}
                        </div>
                      </a>
                      
                      {/* Michelin Guide Link */}
                      <a 
                        href="https://guide.michelin.com/vn/en/ha-noi/ha-noi_2974158/restaurants" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between gap-4 p-4 bg-ink/5 hover:bg-ink/10 border border-ink/10 transition-colors group shrink-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl text-ink/80 group-hover:text-ink transition-colors shrink-0">✿</span>
                          <div className="flex flex-col">
                            <span className="font-display italic text-base text-ink font-medium">Michelin Food Guide</span>
                            <span className="font-body text-[8.5px] text-ink-muted uppercase tracking-[0.1em] mt-0.5 leading-snug">
                              {lang === 'en' ? 'Skip food tour means you have never visited Hanoi.' : 'Đến Hà Nội là phải đi food tour.'}
                            </span>
                          </div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-soft group-hover:text-ink group-hover:translate-x-1 transition-all shrink-0">
                          <path d="M5 12h14"></path>
                          <path d="M12 5l7 7-7 7"></path>
                        </svg>
                      </a>
                    </div>

                    <button 
                      onClick={() => setHanoiSlide(0)}
                      className="w-full mt-1 shrink-0 py-1.5 text-[9px] md:text-[10px] tracking-widest uppercase text-ink-soft hover:text-ink transition-colors flex items-center justify-start gap-1.5 group pl-2"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                      <span>{lang === 'en' ? 'Back to Places' : 'Quay lại danh sách'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
