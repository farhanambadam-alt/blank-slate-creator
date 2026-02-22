import { useState, useRef, useEffect, useCallback } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import type { Artist, Review } from '@/types/salon';

interface ReviewsSectionProps {
  artists: Artist[];
  reviews: Review[];
  selectedArtist: string | null;
  onSelectArtist: (id: string | null) => void;
}

const ReviewsSection = ({ artists, reviews, selectedArtist, onSelectArtist }: ReviewsSectionProps) => {
  const [reviewFilter, setReviewFilter] = useState<string>('all');
  const [isJiggling, setIsJiggling] = useState(false);
  const [tabStyle, setTabStyle] = useState<{ left: number; width: number } | null>(null);

  const artistRowRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredReviews = reviews.filter((r) => {
    if (selectedArtist && r.artistId !== selectedArtist) return false;
    if (reviewFilter === 'all') return true;
    if (reviewFilter === '5') return r.rating === 5;
    if (reviewFilter === '4') return r.rating >= 4;
    if (reviewFilter === 'photos') return r.hasPhoto;
    return true;
  });

  const currentArtist = artists.find((a) => a.id === selectedArtist);
  const avgRating = filteredReviews.length > 0
    ? (filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length).toFixed(1)
    : '0.0';

  const reviewPhotos = [
    'https://images.unsplash.com/photo-1585747860019-8e8e13c2e4f2?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?w=300&h=300&fit=crop',
  ];

  const PILL_COLOR = 'hsl(30 42% 94%)';

  // Measure and position the sliding tab
  const updateTabPosition = useCallback(() => {
    const key = selectedArtist ?? '_all';
    const btn = buttonRefs.current.get(key);
    const row = artistRowRef.current;
    if (!btn || !row) return;

    const rowRect = row.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    setTabStyle({
      left: btnRect.left - rowRect.left,
      width: btnRect.width,
    });
  }, [selectedArtist]);

  useEffect(() => {
    updateTabPosition();
    window.addEventListener('resize', updateTabPosition);
    return () => window.removeEventListener('resize', updateTabPosition);
  }, [updateTabPosition]);

  // Trigger jiggle on artist change
  useEffect(() => {
    setIsJiggling(true);
    const timer = setTimeout(() => setIsJiggling(false), 600);
    return () => clearTimeout(timer);
  }, [selectedArtist]);

  const setButtonRef = (key: string) => (el: HTMLButtonElement | null) => {
    if (el) buttonRefs.current.set(key, el);
    else buttonRefs.current.delete(key);
  };

  return (
    <div className="animate-fade-in-up" style={{ animationDuration: '300ms' }}>
      {/* Our Stylists Header */}
      <div className="px-5 pt-5 pb-1">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-serif text-xl text-truffle italic">Our Stylists</h2>
          <button className="text-[11px] font-sans font-semibold text-bronze uppercase tracking-widest">
            View All
          </button>
        </div>

        {/* Artist Selector */}
        <div className="relative" ref={artistRowRef}>
          {/* Jelly Pill — Layer 1: behind avatars (z-1), in front of nothing */}
          {tabStyle && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: tabStyle.left - 12,
                width: tabStyle.width + 24,
                top: -8,
                bottom: -28,
                background: PILL_COLOR,
                borderRadius: '40px 40px 0 0',
                transition: 'left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                animation: isJiggling ? 'jelly 0.55s ease' : 'none',
                transformOrigin: 'bottom center',
                zIndex: 1,
              }}
            />
          )}

          {/* Artists Row — Layer 2: above pill */}
          <div
            className="flex overflow-x-auto scrollbar-hide pb-4 items-end justify-evenly relative"
            style={{ zIndex: 2 }}
          >
            {/* "All" button */}
            <button
              ref={setButtonRef('_all')}
              onClick={() => onSelectArtist(null)}
              className="flex flex-col items-center gap-2 flex-shrink-0 min-w-[72px]"
            >
              <div
                className={`rounded-full bg-champagne flex items-center justify-center text-[11px] font-sans font-bold text-truffle border-2 transition-all duration-300 ease-out ${
                  !selectedArtist
                    ? 'w-16 h-16 border-bronze/40 shadow-md'
                    : 'w-12 h-12 border-transparent opacity-50'
                }`}
                style={!selectedArtist && isJiggling ? { animation: 'jelly 0.55s ease', transformOrigin: 'bottom center' } : undefined}
              >
                ALL
              </div>
              <span className={`text-[9px] font-sans uppercase tracking-widest transition-all duration-200 ${
                !selectedArtist ? 'font-bold text-truffle' : 'font-medium text-bronze/40'
              }`}>
                All Artists
              </span>
            </button>

            {/* Individual artists */}
            {artists.map((artist) => {
              const isSelected = selectedArtist === artist.id;
              return (
                <button
                  key={artist.id}
                  ref={setButtonRef(artist.id)}
                  onClick={() => onSelectArtist(isSelected ? null : artist.id)}
                  className="flex flex-col items-center gap-2 flex-shrink-0 min-w-[72px]"
                >
                  <div
                    className={`rounded-full overflow-hidden border-2 transition-all duration-300 ease-out ${
                      isSelected
                        ? 'w-16 h-16 border-bronze/40 shadow-md'
                        : 'w-12 h-12 border-transparent opacity-50'
                    }`}
                    style={isSelected && isJiggling ? { animation: 'jelly 0.55s ease', transformOrigin: 'bottom center' } : undefined}
                  >
                    <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                  </div>
                  <span className={`text-[9px] font-sans uppercase tracking-widest whitespace-nowrap transition-all duration-200 ${
                    isSelected ? 'font-bold text-truffle' : 'font-medium text-bronze/40'
                  }`}>
                    {artist.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews Container — Layer 3: on top of everything, negative margin overlaps pill */}
      <div
        ref={containerRef}
        className="mx-3 relative"
        style={{
          marginTop: -20,
          zIndex: 3,
          background: PILL_COLOR,
          borderRadius: '1.25rem',
          padding: '2px',
          animation: isJiggling ? 'jelly-container 0.5s ease' : 'none',
          transformOrigin: 'top center',
        }}
      >
        {/* Reviews Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="font-serif text-[19px]">
            {currentArtist ? (
              <>
                <span className="text-truffle font-normal">{currentArtist.name}</span>{' '}
                <span className="italic text-bronze">Reviews</span>
              </>
            ) : (
              <>
                <span className="text-truffle font-normal">All</span>{' '}
                <span className="italic text-bronze">Reviews</span>
              </>
            )}
          </h3>
          <div className="flex items-center gap-1.5 bg-card rounded-full px-3 py-1.5 shadow-sm">
            <Star size={13} className="text-bronze fill-bronze" />
            <span className="text-sm font-sans font-bold text-truffle">{avgRating}</span>
          </div>
        </div>

        {/* Review Cards */}
        <div className="space-y-3 px-2 pb-3">
          {filteredReviews.map((review, index) => (
            <div
              key={review.id}
              className="bg-card rounded-[28px] p-5 border border-border/60 shadow-sm"
              style={{
                animation: `fade-in-up 0.4s ease-out ${index * 80}ms both`,
              }}
            >
              {/* Reviewer info */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-champagne flex items-center justify-center flex-shrink-0 border border-border/50">
                    <span className="font-serif text-base font-semibold text-truffle">
                      {review.userName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-sans font-semibold text-[13px] text-truffle">{review.userName}</span>
                      <CheckCircle2 size={13} className="text-bronze/60 fill-bronze/10" />
                    </div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className={i < review.rating ? 'text-bronze fill-bronze' : 'text-border'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-sans text-bronze/60 uppercase tracking-widest whitespace-nowrap pt-1">
                  {review.date}
                </span>
              </div>

              {/* Service tag */}
              <div className="mb-3">
                <span className="inline-block text-[9px] font-sans font-bold text-truffle uppercase tracking-widest bg-champagne border border-border/50 px-3.5 py-1 rounded-full">
                  {review.service}
                </span>
              </div>

              {/* Review text */}
              <p className="text-[13px] font-sans text-truffle/75 leading-relaxed italic">
                "{review.text}"
              </p>

              {/* Review photos */}
              {review.hasPhoto && (
                <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                  {reviewPhotos.map((photo, i) => (
                    <div key={i} className="w-36 h-36 flex-shrink-0 rounded-2xl overflow-hidden">
                      <img src={photo} alt={`Review photo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <div className="text-center py-14">
              <p className="font-serif text-base text-bronze/50 italic">
                No reviews yet for this stylist...
              </p>
              <p className="text-[10px] font-sans text-bronze/30 mt-2 tracking-wide">
                Be the first to share your experience
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;
