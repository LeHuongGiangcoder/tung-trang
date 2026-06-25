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
  nav: { visa: string; travel: string; rsvp: string; };
  visa: {
    subtitle: string;
    title: string;
    introParagraph1: string;
    applyLabel: string;
    btnPortal: string;
    btnMoreInfo: string;
    keyDetails: { title: string; items: { value: string; label: string; description: string }[] };
    whatYouNeed: { title: string; items: string[] };
    afterApproval: { title: string; items: string[] };
    arrivalTips: { title: string; items: string[] };
  };
  travel: {
    subtitle: string;
    title: string;
    body: string;
  };
  rsvp: {
    subtitle: string;
    title: string;
    description: string;
    nameLabel: string;
    namePlaceholder: string;
    nameHelper: string;
    submitBtn: string;
    submitBtnLoading: string;
    successMsg: string;
    errorRequired: string;
    errorNotFound: string;
    errorWebhook: string;
    attendingLabel: string;
    attendingYes: string;
    attendingNo: string;

    mealLabel: string;
    mealPlaceholder: string;
    wishesLabel: string;
    wishesPlaceholder: string;
    submitDetailsBtn: string;
  };
  thankYou: {
    title: string;
    body: string;
  };
  eventDetails: {
    schedule: string;
    dresscode: string;
    comingSoon: string;
  };
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
    nav: { visa: 'Visa', travel: 'Travel', rsvp: 'RSVP' },
    visa: {
      subtitle: 'TRAVEL INFORMATION',
      title: 'E-Visa Guide',
      introParagraph1: 'If you are not a Vietnamese citizen, you may need to obtain a visa to enter Vietnam. The process is <strong><em>simple, affordable, and completed online.</em></strong>',
      applyLabel: 'Apply here:',
      btnPortal: 'E-Visa Portal',
      btnMoreInfo: 'Entry/Exit Info',
      keyDetails: {
        title: 'Key Details',
        items: [
          { value: '90', label: 'DAYS', description: 'Max. Validity (Single/Multiple)' },
          { value: '$25', label: 'FEE', description: '/ $50 (Multiple) — Non-refundable' },
          { value: '~5', label: 'BUSINESS DAYS', description: 'Apply 1-2 weeks early for peace of mind' }
        ]
      },
      whatYouNeed: {
        title: 'What You’ll Need',
        items: [
          'Passport valid for 6+ months with at least one blank page',
          'Scanned passport bio page',
          'Passport photo (4×6 cm, white background, no glasses)',
          'Credit/debit card for payment'
        ]
      },
      afterApproval: {
        title: 'After Approval',
        items: [
          'Download and print at least 2 copies of your e-visa',
          'Present your e-visa + passport at immigration upon arrival'
        ]
      },
      arrivalTips: {
        title: 'Arrival Tips',
        items: [
          'You must enter/exit through designated international border gates',
          'Keep both digital and printed copies of your visa handy'
        ]
      }
    },
    travel: {
      subtitle: 'TRAVEL GUIDE',
      title: 'Vietnam',
      body: 'Vietnam: 100 million people, 2,000 miles of coast, and arguably the <strong><em>best street food on Earth.</em></strong>'
    },
    rsvp: {
      subtitle: 'RSVP',
      title: 'Will You Join Us?',
      description: 'Please let us know if you can make it by completing the form below.',
      nameLabel: 'Full Name',
      namePlaceholder: 'e.g. John Smith',
      nameHelper: 'Please write your full name with capitalized first letters.',
      submitBtn: 'Send',
      submitBtnLoading: 'Sending...',
      successMsg: 'Thank you! Your RSVP has been successfully sent.',
      errorRequired: 'Please enter your full name.',
      errorNotFound: "Hmm... we can not find your name on our list. Please check the spelling and try again!",
      errorWebhook: 'Something went wrong. Please try again or contact us directly.',
      attendingLabel: 'Will you be attending?',
      attendingYes: 'Yes, I will attend',
      attendingNo: 'No, I cannot attend',

      mealLabel: 'Meal preferences (optional)',
      mealPlaceholder: 'e.g. Vegetarian, food allergies...',
      wishesLabel: 'Your message to us',
      wishesPlaceholder: 'Write your wishes here...',
      submitDetailsBtn: 'Confirm RSVP'
    },
    thankYou: {
      title: 'Thank You',
      body: "We can't wait to see you!"
    },
    eventDetails: {
      schedule: 'Schedule',
      dresscode: 'Dresscode',
      comingSoon: 'Coming soon...'
    }
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
    nav: { visa: 'Visa', travel: 'Du lịch', rsvp: 'Xác nhận' },
    visa: {
      subtitle: 'THÔNG TIN DU LỊCH',
      title: 'Hướng dẫn E-Visa',
      introParagraph1: 'Nếu bạn không phải là công dân Việt Nam, bạn có thể cần có visa để nhập cảnh vào Việt Nam. Quy trình xin visa <strong><em>rất đơn giản, chi phí hợp lý và được thực hiện hoàn toàn trực tuyến.</em></strong>',
      applyLabel: 'Đăng ký tại đây:',
      btnPortal: 'Cổng E-Visa',
      btnMoreInfo: 'Xuất/Nhập cảnh',
      keyDetails: {
        title: 'Thông tin chính',
        items: [
          { value: '90', label: 'NGÀY', description: 'Thời hạn tối đa (Một/Nhiều lần)' },
          { value: '$25', label: 'PHÍ', description: '/ $50 (Nhiều lần) — Không hoàn lại' },
          { value: '~5', label: 'NGÀY LÀM VIỆC', description: 'Nên nộp trước 1-2 tuần cho an tâm' }
        ]
      },
      whatYouNeed: {
        title: 'Bạn cần chuẩn bị',
        items: [
          'Hộ chiếu còn hạn trên 6 tháng và còn ít nhất một trang trống',
          'Bản scan trang thông tin cá nhân của hộ chiếu',
          'Ảnh thẻ (4×6 cm, nền trắng, không đeo kính)',
          'Thẻ tín dụng/ghi nợ để thanh toán'
        ]
      },
      afterApproval: {
        title: 'Sau khi được duyệt',
        items: [
          'Tải xuống và in ít nhất 2 bản sao e-visa của bạn',
          'Xuất trình e-visa + hộ chiếu tại quầy nhập cảnh khi đến nơi'
        ]
      },
      arrivalTips: {
        title: 'Lưu ý khi đến',
        items: [
          'Bạn phải nhập cảnh/xuất cảnh qua các cửa khẩu quốc tế được chỉ định',
          'Luôn mang theo cả bản kỹ thuật số và bản in của visa'
        ]
      }
    },
    travel: {
      subtitle: 'HƯỚNG DẪN DU LỊCH',
      title: 'Việt Nam',
      body: 'Việt Nam: 100 triệu dân, hơn 3.200 km bờ biển, và có lẽ là nơi có <strong><em>ẩm thực đường phố tuyệt vời nhất hành tinh.</em></strong>'
    },
    rsvp: {
      subtitle: 'XÁC NHẬN THAM DỰ',
      title: 'Bạn sẽ tham dự chứ?',
      description: 'Vui lòng cho chúng mình biết sự hiện diện của bạn bằng cách điền vào mẫu bên dưới.',
      nameLabel: 'Họ và tên',
      namePlaceholder: 'VD: Nguyễn Văn A',
      nameHelper: 'Vui lòng viết đầy đủ họ và tên, viết hoa các chữ cái đầu.',
      submitBtn: 'Gửi xác nhận',
      submitBtnLoading: 'Đang gửi...',
      successMsg: 'Cảm ơn bạn! Thông tin xác nhận tham dự đã được gửi thành công.',
      errorRequired: 'Vui lòng nhập họ và tên của bạn.',
      errorNotFound: 'Hmm... chúng mình chưa tìm thấy tên của bạn trong danh sách. Bạn thử kiểm tra lại chính tả xem sao nhé!',
      errorWebhook: 'Đã xảy ra sự cố. Vui lòng thử lại hoặc liên hệ trực tiếp với chúng mình.',
      attendingLabel: 'Bạn sẽ tham dự chứ?',
      attendingYes: 'Có, mình sẽ tham dự',
      attendingNo: 'Rất tiếc không thể tham dự',

      mealLabel: 'Yêu cầu đặc biệt về ăn uống (nếu có)',
      mealPlaceholder: 'VD: Ăn chay, dị ứng hải sản...',
      wishesLabel: 'Lời chúc gửi tới cặp đôi',
      wishesPlaceholder: 'Nhập lời chúc của bạn tại đây...',
      submitDetailsBtn: 'Gửi xác nhận'
    },
    thankYou: {
      title: 'Cảm Ơn Bạn',
      body: 'Rất mong được gặp bạn!'
    },
    eventDetails: {
      schedule: 'Lịch trình',
      dresscode: 'Trang phục',
      comingSoon: 'Sắp ra mắt...'
    }
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
