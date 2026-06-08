export type Lang = 'en' | 'vi';

export const WEDDING = {
  groom: 'Tung',
  bride: 'Trang',
  dateISO: '2027-01-23T16:00:00+07:00',
  city: 'Hanoi',
  country: 'Vietnam',
} as const;

export const COPY: Record<Lang, {
  entrance: { hint: string; whisper: string };
  hero: { eyebrow: string; ampersand: string; dateLine: string; location: string };
  nav: { story: string; details: string; rsvp: string };
}> = {
  en: {
    entrance: {
      hint: "Let's sketch with us",
      whisper: 'draw anywhere on the screen',
    },
    hero: {
      eyebrow: 'save the date',
      ampersand: 'and',
      dateLine: 'Saturday, 23 January 2027',
      location: 'Hanoi, Vietnam',
    },
    nav: { story: 'Story', details: 'Details', rsvp: 'RSVP' },
  },
  vi: {
    entrance: {
      hint: 'Cùng phác hoạ với chúng mình',
      whisper: 'hãy vẽ tự do trên màn hình',
    },
    hero: {
      eyebrow: 'lưu lại ngày',
      ampersand: 'và',
      dateLine: 'Thứ bảy, 23 tháng 01 năm 2027',
      location: 'Hà Nội, Việt Nam',
    },
    nav: { story: 'Câu chuyện', details: 'Thông tin', rsvp: 'Xác nhận' },
  },
};

export const FLASHBACK_IMAGES = [
  '/images/moment-02-beach.webp',
  '/images/moment-03-crosswalk.webp',
  '/images/moment-04-shadows.webp',
  '/images/moment-05-doors.webp',
  '/images/moment-06-street.webp',
  '/images/moment-07-ring.webp',
] as const;
