import dataSource from '../data-source';
import { News } from '../../modules/news/entities/news.entity';
import { Event } from '../../modules/events/entities/event.entity';

// Explicit parser for Vietnam timezone (+07:00)
function parseVNDateTime(dateStr: string, timeStr = '00:00'): Date {
  const [day, month, year] = dateStr.split('.');
  const [hour, minute] = timeStr.split(':');
  return new Date(`${year}-${month}-${day}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00+07:00`);
}

/**
 * Legacy demo slugs to be cleaned up safely so they do not linger in the database.
 */
const legacyDemoNewsSlugs = [
  'khoi-dong-hanh-trinh-5-tot-bat-dau-tu-dau',
  'ba-cach-duy-tri-nhip-hoc-tap-ben-vung',
  'khi-hoat-dong-cong-dong-tro-thanh-bai-hoc',
  'checklist-chuan-bi-cho-mot-workshop-hieu-qua',
  'van-dong-ngan-nang-luong-dai',
  'ky-nang-hoi-nhap-trong-thoi-dai-so',
  'nhap-hoc-cung-5-tot-challenge', // Clean up legacy news slug since this is now an Event
];

const legacyDemoEventSlugs = [
  'workshop-thiet-ke-hanh-trinh-5-tot-ca-nhan',
  '5ss-connect-gap-go-va-chia-se-kinh-nghiem',
  'ngay-hoi-van-dong-cung-5ss',
  'chuyen-de-tu-hoat-dong-den-minh-chung',
];

/**
 * Real News items backed directly by Data/In4.docx and official Proposal.
 * Personnel rule: ONLY Lê Thúy Hà is included as approved public leadership.
 * Bùi Đức Mạnh is mentioned strictly in the context of the international exchange article from UET-News.
 */
const seedNews = [
  {
    // Source: Data/In4.docx — Tuyển quân section
    slug: 'uet-5ss-mo-don-tuyen-thanh-vien-gen-01',
    title: '[UET 5SS] MỞ ĐƠN TUYỂN THÀNH VIÊN GEN 01',
    excerpt: 'Chuyến tàu mang số hiệu UET 5-Star Student Club (UET 5SS) đã chính thức khởi hành – Mở đơn tuyển thành viên Gen 01!',
    body: [
      'Ding doong… Ding doong… Cuối cùng sau bao nhiêu ngày mong ngóng và chờ đợi thì chuyến tàu mang số hiệu UET 5-Star Student Club (UET 5SS) đã chính thức khởi hành rồi đây!',
      'Chắc hẳn bạn đang tìm kiếm một CLB có thể đáp ứng được các tiêu chí như: được tự tin rèn luyện và phát huy tiềm năng của bản thân, được kết nối với những người bạn chung mục tiêu chinh phục danh hiệu "Sinh viên 5 tốt", được học hỏi thêm kinh nghiệm từ các anh chị và có với nhau những khoảnh khắc “đỉnh nóc kịch trần, bay phấp phới”? Vậy thì UET 5SS chính là địa điểm lý tưởng có thể thực hiện hóa những mong muốn của bạn bởi bạn sẽ có cơ hội được gặp gỡ và làm việc trong một môi trường năng động, được góp mặt trong các sự kiện thú vị và hơn thế nữa là được rèn luyện cùng đại gia đình UET 5SS.',
      'Vậy thì còn chần chừ gì nữa mà không nhấp vào đường link để điền đơn nhỉ? Đừng bỏ lỡ cơ hội tuyệt vời này để tham gia vào hành trình rèn luyện thanh xuân cùng UET 5SS nhé!',
      'Thông tin đợt tuyển thành viên Gen 01:',
      '• Đối tượng: Sinh viên K68 - K70 trường Đại học Công nghệ, Đại học Quốc gia Hà Nội.',
      '• Deadline nộp đơn: 23h59’ ngày 20/08/2026.',
      '• Link đơn đăng ký: https://forms.gle/Rhh1XmwhFxBE1m6q8',
      '• Bài đăng Facebook: https://www.facebook.com/share/p/1J1L9M8rUz/',
    ],
    tag: 'Tuyển quân',
    imageUrl: '/uploads/tuyen-quan-sv5t.png',
    publishedAt: parseVNDateTime('20.08.2026', '08:00'),
  },
  {
    // Source: Data/In4.docx — Trại hè quốc tế section & UET News link
    slug: 'sinh-vien-uet-trao-doi-quoc-te-tai-dh-su-pham-quang-tay',
    title: 'Sinh viên UET trao đổi quốc tế tại ĐH Sư phạm Quảng Tây (Trung Quốc): Đi để hội nhập, học để bứt phá',
    excerpt: 'Chương trình trao đổi quốc tế mang đến trải nghiệm quý giá về học thuật, robot, giao lưu văn hóa và kỹ năng hội nhập cho sinh viên UET.',
    body: [
      'Không chỉ là cơ hội học tập trong môi trường quốc tế, chương trình trao đổi giữa Trường Đại học Công nghệ – Đại học Quốc gia Hà Nội (VNU-UET) và Trường Đại học Sư phạm Quảng Tây (Trung Quốc) còn mang đến cho sinh viên những trải nghiệm quý giá về học thuật, văn hóa và kỹ năng hội nhập. Với sinh viên Lê Thúy Hà (QH-2023) và Bùi Đức Mạnh (QH-2022), chuyến đi ngắn ngày đã mở ra những góc nhìn mới về công nghệ, nghề nghiệp và hành trình phát triển bản thân.',
      'Mỗi sinh viên mang về những trải nghiệm và bài học khác nhau, nhưng cả Lê Thúy Hà và Bùi Đức Mạnh đều có chung cảm nhận rằng chương trình trao đổi tại Trường Đại học Sư phạm Quảng Tây không chỉ giúp mở rộng kiến thức chuyên môn mà còn bồi đắp tư duy hội nhập, khả năng thích nghi và sự tự tin khi bước ra môi trường quốc tế.',
      'Thông qua những giờ học về robot, các hoạt động giao lưu đa văn hóa và cơ hội kết nối với sinh viên nhiều quốc gia, chương trình tiếp tục khẳng định hiệu quả của mối quan hệ hợp tác giữa Trường Đại học Công nghệ và Trường Đại học Sư phạm Quảng Tây trong việc tạo dựng môi trường học tập quốc tế, góp phần trang bị cho sinh viên UET những năng lực cần thiết để sẵn sàng hội nhập và phát triển trong kỷ nguyên số.',
      'Nguồn: UET-News (https://uet.vnu.edu.vn/sinh-vien-uet-trao-doi-quoc-te-tai-dh-su-pham-quang-tay-trung-quoc-di-de-hoi-nhap-hoc-de-but-pha/)',
    ],
    tag: 'Hội nhập',
    imageUrl: '/uploads/trai-he.jpg',
    publishedAt: parseVNDateTime('15.08.2026', '09:00'),
  },
  {
    // Source: Data/Bản sao của ĐỀ ÁN THÀNH LẬP CLB SINH VIÊN 5 TỐT.docx (Thành lập: 28/01/2026)
    slug: 'thanh-lap-clb-sinh-vien-5-tot-truong-dai-hoc-cong-nghe',
    title: 'Thành lập Câu lạc bộ Sinh viên 5 Tốt Trường Đại học Công nghệ (UET 5SS)',
    excerpt: 'Hội Sinh viên Trường ĐH Công nghệ chính thức ra quyết định thành lập CLB Sinh viên 5 Tốt nhằm tạo môi trường rèn luyện toàn diện cho sinh viên.',
    body: [
      'Hội Sinh viên Trường Đại học Công nghệ ra quyết định thành lập Câu lạc bộ Sinh viên 5 tốt (UET 5SS) nhằm mục đích hỗ trợ, tuyên truyền cho các bạn sinh viên phấn đấu đạt danh hiệu Sinh viên 5 tốt các cấp.',
      'CLB được định hướng xây dựng môi trường rèn luyện toàn diện theo 5 tiêu chí: Đạo đức tốt, Học tập tốt, Thể lực tốt, Tình nguyện tốt và Hội nhập tốt. Tạo cộng đồng kết nối những cá nhân ưu tú, chia sẻ kinh nghiệm học tập, nghiên cứu khoa học và kỹ năng mềm trong môi trường kỹ thuật công nghệ.',
      'Đại diện Ban Chủ nhiệm: Lê Thúy Hà (Chủ nhiệm CLB). Địa điểm sinh hoạt chính thức tại 144 Xuân Thủy, Cầu Giấy, Hà Nội.',
    ],
    tag: 'Tin tức',
    imageUrl: '/uploads/logo-5ss.png',
    publishedAt: parseVNDateTime('28.01.2026', '08:00'),
  },
];

/**
 * Confirmed Events:
 * "Nhập học cùng 5 tốt" confirmed by organizers with official banner (03/09 - 05/09/2026)
 * and Google Form registration link.
 */
const seedEvents: Array<{
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  location: string;
  imageUrl: string | null;
  startAt: Date;
  endAt: Date | null;
  registrationDeadline: Date | null;
  capacity: number | null;
  registrationEnabled: boolean;
  published: boolean;
}> = [
  {
    // Source: Banner Take 01 (03/09 - 05/09/2026) & Form đăng ký chính thức
    slug: 'nhap-hoc-cung-5-tot-rinh-ngay-100k',
    title: 'Nhập học cùng 5 tốt – Rinh ngay 100K (Take 01)',
    excerpt: 'Thử thách chào đón tân sinh viên: Nhập học cùng 5 tốt – Rinh ngay 100K cùng CLB Sinh viên 5 Tốt Trường Đại học Công nghệ (UET 5SS).',
    body: [
      'Chào đón các bạn tân sinh viên gia nhập đại gia đình Trường Đại học Công nghệ – ĐHQGHN! CLB Sinh viên 5 Tốt (UET 5SS) mang đến chuỗi sự kiện và thử thách đặc biệt "Nhập học cùng 5 tốt – Rinh ngay 100K" (Take 01).',
      'Đây là cơ hội tuyệt vời để các bạn tân sinh viên tìm hiểu phong trào Sinh viên 5 Tốt ngay từ những ngày đầu tựu trường, kết nối cùng các anh chị và nhận ngay phần thưởng 100.000 VNĐ cùng các quà tặng đặc quyền từ CLB.',
      'Thời gian diễn ra: 03/09/2026 – 05/09/2026.',
      'Địa điểm: Trường Đại học Công nghệ - ĐHQGHN (144 Xuân Thủy, Cầu Giấy, Hà Nội).',
      'Link biểu mẫu đăng ký tham gia: https://forms.gle/BnS6i2pu7K6hKUsN8',
      'Hãy nhanh tay điền form đăng ký để nhận ngay những phần quà hấp dẫn và khởi đầu hành trình rèn luyện rực rỡ cùng UET 5SS!',
    ],
    location: 'Trường ĐH Công nghệ - ĐHQGHN (144 Xuân Thủy, Cầu Giấy, Hà Nội)',
    imageUrl: '/uploads/nhap-hoc-cung-5-tot.png',
    startAt: parseVNDateTime('03.09.2026', '08:00'),
    endAt: parseVNDateTime('05.09.2026', '23:59'),
    registrationDeadline: parseVNDateTime('05.09.2026', '23:59'),
    capacity: null, // Không giới hạn số lượng
    registrationEnabled: true,
    published: true,
  },
];

async function seed() {
  console.log('Connecting to database...');
  await dataSource.initialize();
  console.log('Connected.');

  const newsRepo = dataSource.getRepository(News);
  const eventRepo = dataSource.getRepository(Event);

  // 1. Clean up known legacy demo news slugs
  for (const demoSlug of legacyDemoNewsSlugs) {
    const existing = await newsRepo.findOne({ where: { slug: demoSlug } });
    if (existing) {
      await newsRepo.delete(existing.id);
      console.log(`Removed legacy demo news: ${demoSlug}`);
    }
  }

  // 2. Clean up known legacy demo event slugs
  for (const demoSlug of legacyDemoEventSlugs) {
    const existing = await eventRepo.findOne({ where: { slug: demoSlug } });
    if (existing) {
      await eventRepo.delete(existing.id);
      console.log(`Removed legacy demo event: ${demoSlug}`);
    }
  }

  // 3. Upsert real News items
  console.log(`Seeding ${seedNews.length} real news items (upsert by slug)...`);
  for (const item of seedNews) {
    const existing = await newsRepo.findOne({ where: { slug: item.slug } });
    if (existing) {
      await newsRepo.update(existing.id, item);
      console.log(`Updated news: ${item.slug}`);
    } else {
      await newsRepo.save(newsRepo.create(item));
      console.log(`Inserted news: ${item.slug}`);
    }
  }

  // 4. Seed confirmed Events (if any)
  if (seedEvents.length > 0) {
    console.log(`Seeding ${seedEvents.length} events (upsert by slug)...`);
    for (const item of seedEvents) {
      const existing = await eventRepo.findOne({ where: { slug: item.slug } });
      if (existing) {
        await eventRepo.update(existing.id, item);
        console.log(`Updated event: ${item.slug}`);
      } else {
        await eventRepo.save(eventRepo.create(item));
        console.log(`Inserted event: ${item.slug}`);
      }
    }
  } else {
    console.log('No unconfirmed events seeded (awaiting confirmed event schedules from club).');
  }

  console.log('Real data seed complete.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
