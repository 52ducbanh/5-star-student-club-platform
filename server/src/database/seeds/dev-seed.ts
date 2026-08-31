import dataSource from '../data-source';
import { News } from '../../modules/news/entities/news.entity';
import { Event } from '../../modules/events/entities/event.entity';

// Explicit parser for Vietnam timezone (+07:00)
function parseVNDateTime(dateStr: string, timeStr = '00:00'): Date {
  const [day, month, year] = dateStr.split('.');
  const [hour, minute] = timeStr.split(':');
  return new Date(`${year}-${month}-${day}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00+07:00`);
}

const seedNews = [
  {
    slug: 'khoi-dong-hanh-trinh-5-tot-bat-dau-tu-dau',
    title: 'Khởi động hành trình 5 tốt: bắt đầu từ đâu?',
    excerpt: 'Gợi ý cách chia hành trình thành những bước nhỏ, rõ ràng và phù hợp nhịp sống sinh viên.',
    body: [
      'Bài viết minh họa giới thiệu cách tự đánh giá năm tiêu chí và chọn một điểm bắt đầu phù hợp.',
      'Thông tin chính thức về tiêu chí và hồ sơ cần được đối chiếu với thông báo của đơn vị phụ trách.',
    ],
    tag: 'Hành trình',
    imageUrl: null,
    publishedAt: parseVNDateTime('18.08.2026', '08:00'),
  },
  {
    slug: 'ba-cach-duy-tri-nhip-hoc-tap-ben-vung',
    title: 'Ba cách duy trì nhịp học tập bền vững',
    excerpt: 'Từ mục tiêu học kỳ đến lịch học tuần: những gợi ý nhỏ để tạo đà tiến bộ.',
    body: [
      'Nội dung demo đề xuất chia mục tiêu thành tuần, theo dõi tiến độ và dành thời gian phản tư.',
      'Mỗi sinh viên nên điều chỉnh phương pháp theo lịch học và điều kiện cá nhân.',
    ],
    tag: 'Kỹ năng',
    imageUrl: null,
    publishedAt: parseVNDateTime('12.08.2026', '09:00'),
  },
  {
    slug: 'khi-hoat-dong-cong-dong-tro-thanh-bai-hoc',
    title: 'Khi hoạt động cộng đồng trở thành bài học',
    excerpt: 'Nhìn lại giá trị của trải nghiệm tình nguyện đối với kỹ năng và sự trưởng thành.',
    body: [
      'Một hoạt động ý nghĩa không chỉ nằm ở số giờ tham gia mà còn ở mức độ chủ động và bài học rút ra.',
      'Đây là bài viết mẫu dùng để minh họa cấu trúc tin tức của website.',
    ],
    tag: 'Tình nguyện',
    imageUrl: null,
    publishedAt: parseVNDateTime('03.08.2026', '10:00'),
  },
  {
    slug: 'checklist-chuan-bi-cho-mot-workshop-hieu-qua',
    title: 'Checklist chuẩn bị cho một workshop hiệu quả',
    excerpt: 'Chuẩn bị câu hỏi, ghi chú và một hành động tiếp nối sau mỗi buổi chia sẻ.',
    body: [
      'Người tham dự có thể chuẩn bị mục tiêu trước chương trình và ghi lại một hành động sẽ thử ngay sau đó.',
      'Nội dung chương trình thực tế sẽ do CLB cập nhật.',
    ],
    tag: 'Hoạt động',
    imageUrl: null,
    publishedAt: parseVNDateTime('26.07.2026', '14:00'),
  },
  {
    slug: 'van-dong-ngan-nang-luong-dai',
    title: 'Vận động ngắn, năng lượng dài',
    excerpt: 'Một vài cách đưa vận động vào lịch học bận rộn mà không tạo thêm áp lực.',
    body: [
      'Hãy chọn hình thức vận động an toàn, vừa sức và duy trì đều đặn.',
      'Các khuyến nghị sức khỏe chuyên môn không nằm trong phạm vi của bản demo này.',
    ],
    tag: 'Thể lực',
    imageUrl: null,
    publishedAt: parseVNDateTime('19.07.2026', '07:30'),
  },
  {
    slug: 'ky-nang-hoi-nhap-trong-thoi-dai-so',
    title: 'Kỹ năng hội nhập trong thời đại số',
    excerpt: 'Ngoại ngữ, giao tiếp và tư duy số cùng tạo nên năng lực hội nhập linh hoạt.',
    body: [
      'Bài viết mẫu gợi ý sinh viên lựa chọn một kỹ năng để thực hành trong dự án hoặc hoạt động giao lưu.',
      'Chứng chỉ và điều kiện cụ thể cần được xác minh theo quy định chính thức.',
    ],
    tag: 'Hội nhập',
    imageUrl: null,
    publishedAt: parseVNDateTime('08.07.2026', '16:00'),
  },
];

const seedEvents = [
  {
    slug: 'workshop-thiet-ke-hanh-trinh-5-tot-ca-nhan',
    title: 'Workshop: Thiết kế hành trình 5 tốt cá nhân',
    excerpt: 'Buổi thực hành demo giúp sinh viên phác thảo mục tiêu và lộ trình cho từng tiêu chí.',
    body: [
      'Người tham dự sẽ thử tự đánh giá, chọn tiêu chí ưu tiên và tạo kế hoạch hành động ngắn hạn.',
      'Lịch và địa điểm trong bản demo chưa phải thông báo chính thức.',
    ],
    location: 'Địa điểm sẽ được CLB cập nhật',
    imageUrl: null,
    startAt: parseVNDateTime('12.09.2026', '14:00'),
    endAt: parseVNDateTime('12.09.2026', '16:30'),
    registrationDeadline: parseVNDateTime('11.09.2026', '23:59'),
    capacity: 50,
    registrationEnabled: true,
    published: true,
  },
  {
    slug: '5ss-connect-gap-go-va-chia-se-kinh-nghiem',
    title: '5SS Connect: Gặp gỡ và chia sẻ kinh nghiệm',
    excerpt: 'Không gian kết nối giữa sinh viên quan tâm tới hành trình rèn luyện toàn diện.',
    body: [
      'Chương trình minh họa gồm chia sẻ nhóm nhỏ, hỏi đáp và kết nối bạn đồng hành.',
      'Thông tin diễn giả và nội dung chính thức sẽ được CLB cập nhật.',
    ],
    location: 'Không gian sinh hoạt UET · chờ xác nhận',
    imageUrl: null,
    startAt: parseVNDateTime('27.09.2026', '18:30'),
    endAt: parseVNDateTime('27.09.2026', '20:30'),
    registrationDeadline: parseVNDateTime('26.09.2026', '23:59'),
    capacity: 40,
    registrationEnabled: true,
    published: true,
  },
  {
    slug: 'ngay-hoi-van-dong-cung-5ss',
    title: 'Ngày hội vận động cùng 5SS',
    excerpt: 'Hoạt động mẫu khuyến khích vận động vừa sức và tinh thần đồng đội.',
    body: [
      'Sự kiện này là dữ liệu minh họa cho trạng thái “Đã kết thúc”.',
      'Không dùng nội dung này làm căn cứ xác nhận tham gia thực tế.',
    ],
    location: 'Khu khuôn viên UET · nội dung minh họa',
    imageUrl: null,
    startAt: parseVNDateTime('20.06.2026', '07:00'),
    endAt: parseVNDateTime('20.06.2026', '10:00'),
    registrationDeadline: parseVNDateTime('19.06.2026', '23:59'),
    capacity: 100,
    registrationEnabled: false,
    published: true,
  },
  {
    slug: 'chuyen-de-tu-hoat-dong-den-minh-chung',
    title: 'Chuyên đề: Từ hoạt động đến minh chứng',
    excerpt: 'Buổi chia sẻ mẫu về cách sắp xếp ghi chú và tài liệu cá nhân sau hoạt động.',
    body: [
      'Nội dung minh họa tập trung vào thói quen lưu trữ có hệ thống.',
      'Yêu cầu minh chứng chính thức cần được đối chiếu với hướng dẫn của đơn vị phụ trách.',
    ],
    location: 'Trực tiếp tại UET · chờ cập nhật',
    imageUrl: null,
    startAt: parseVNDateTime('25.05.2026', '19:00'),
    endAt: parseVNDateTime('25.05.2026', '20:30'),
    registrationDeadline: parseVNDateTime('24.05.2026', '23:59'),
    capacity: 60,
    registrationEnabled: false,
    published: true,
  },
];

async function seed() {
  console.log('Connecting to database...');
  await dataSource.initialize();
  console.log('Connected.');

  const newsRepo = dataSource.getRepository(News);
  const eventRepo = dataSource.getRepository(Event);

  console.log(`Seeding ${seedNews.length} news items (upsert by slug)...`);
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

  console.log('Development seed complete.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
