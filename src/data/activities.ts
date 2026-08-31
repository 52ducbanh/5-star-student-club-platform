export type NewsItem = {
  id: string
  title: string
  date: string
  excerpt: string
  body: string[]
  tag: string
  image: string | null
}

export type EventStatus = 'upcoming' | 'past'
export type EventItem = {
  id: string
  title: string
  date: string
  time: string
  location: string
  status: EventStatus
  excerpt: string
  body: string[]
  registrationOpen: boolean
  image: string | null
}

export const newsItems: NewsItem[] = [
  { id: 'news-1', title: 'Khởi động hành trình 5 tốt: bắt đầu từ đâu?', date: '18.08.2026', excerpt: 'Gợi ý cách chia hành trình thành những bước nhỏ, rõ ràng và phù hợp nhịp sống sinh viên.', body: ['Bài viết minh họa giới thiệu cách tự đánh giá năm tiêu chí và chọn một điểm bắt đầu phù hợp.', 'Thông tin chính thức về tiêu chí và hồ sơ cần được đối chiếu với thông báo của đơn vị phụ trách.'], tag: 'Hành trình', image: null },
  { id: 'news-2', title: 'Ba cách duy trì nhịp học tập bền vững', date: '12.08.2026', excerpt: 'Từ mục tiêu học kỳ đến lịch học tuần: những gợi ý nhỏ để tạo đà tiến bộ.', body: ['Nội dung demo đề xuất chia mục tiêu thành tuần, theo dõi tiến độ và dành thời gian phản tư.', 'Mỗi sinh viên nên điều chỉnh phương pháp theo lịch học và điều kiện cá nhân.'], tag: 'Kỹ năng', image: null },
  { id: 'news-3', title: 'Khi hoạt động cộng đồng trở thành bài học', date: '03.08.2026', excerpt: 'Nhìn lại giá trị của trải nghiệm tình nguyện đối với kỹ năng và sự trưởng thành.', body: ['Một hoạt động ý nghĩa không chỉ nằm ở số giờ tham gia mà còn ở mức độ chủ động và bài học rút ra.', 'Đây là bài viết mẫu dùng để minh họa cấu trúc tin tức của website.'], tag: 'Tình nguyện', image: null },
  { id: 'news-4', title: 'Checklist chuẩn bị cho một workshop hiệu quả', date: '26.07.2026', excerpt: 'Chuẩn bị câu hỏi, ghi chú và một hành động tiếp nối sau mỗi buổi chia sẻ.', body: ['Người tham dự có thể chuẩn bị mục tiêu trước chương trình và ghi lại một hành động sẽ thử ngay sau đó.', 'Nội dung chương trình thực tế sẽ do CLB cập nhật.'], tag: 'Hoạt động', image: null },
  { id: 'news-5', title: 'Vận động ngắn, năng lượng dài', date: '19.07.2026', excerpt: 'Một vài cách đưa vận động vào lịch học bận rộn mà không tạo thêm áp lực.', body: ['Hãy chọn hình thức vận động an toàn, vừa sức và duy trì đều đặn.', 'Các khuyến nghị sức khỏe chuyên môn không nằm trong phạm vi của bản demo này.'], tag: 'Thể lực', image: null },
  { id: 'news-6', title: 'Kỹ năng hội nhập trong thời đại số', date: '08.07.2026', excerpt: 'Ngoại ngữ, giao tiếp và tư duy số cùng tạo nên năng lực hội nhập linh hoạt.', body: ['Bài viết mẫu gợi ý sinh viên lựa chọn một kỹ năng để thực hành trong dự án hoặc hoạt động giao lưu.', 'Chứng chỉ và điều kiện cụ thể cần được xác minh theo quy định chính thức.'], tag: 'Hội nhập', image: null },
]

export const eventItems: EventItem[] = [
  { id: 'event-1', title: 'Workshop: Thiết kế hành trình 5 tốt cá nhân', date: '12.09.2026', time: '14:00 – 16:30', location: 'Địa điểm sẽ được CLB cập nhật', status: 'upcoming', excerpt: 'Buổi thực hành demo giúp sinh viên phác thảo mục tiêu và lộ trình cho từng tiêu chí.', body: ['Người tham dự sẽ thử tự đánh giá, chọn tiêu chí ưu tiên và tạo kế hoạch hành động ngắn hạn.', 'Lịch và địa điểm trong bản demo chưa phải thông báo chính thức.'], registrationOpen: true, image: null },
  { id: 'event-2', title: '5SS Connect: Gặp gỡ và chia sẻ kinh nghiệm', date: '27.09.2026', time: '18:30 – 20:30', location: 'Không gian sinh hoạt UET · chờ xác nhận', status: 'upcoming', excerpt: 'Không gian kết nối giữa sinh viên quan tâm tới hành trình rèn luyện toàn diện.', body: ['Chương trình minh họa gồm chia sẻ nhóm nhỏ, hỏi đáp và kết nối bạn đồng hành.', 'Thông tin diễn giả và nội dung chính thức sẽ được CLB cập nhật.'], registrationOpen: true, image: null },
  { id: 'event-3', title: 'Ngày hội vận động cùng 5SS', date: '20.06.2026', time: '07:00 – 10:00', location: 'Khuôn viên UET · nội dung minh họa', status: 'past', excerpt: 'Hoạt động mẫu khuyến khích vận động vừa sức và tinh thần đồng đội.', body: ['Sự kiện này là dữ liệu minh họa cho trạng thái “Đã kết thúc”.', 'Không dùng nội dung này làm căn cứ xác nhận tham gia thực tế.'], registrationOpen: false, image: null },
  { id: 'event-4', title: 'Chuyên đề: Từ hoạt động đến minh chứng', date: '25.05.2026', time: '19:00 – 20:30', location: 'Trực tiếp tại UET · chờ cập nhật', status: 'past', excerpt: 'Buổi chia sẻ mẫu về cách sắp xếp ghi chú và tài liệu cá nhân sau hoạt động.', body: ['Nội dung minh họa tập trung vào thói quen lưu trữ có hệ thống.', 'Yêu cầu minh chứng chính thức cần được đối chiếu với hướng dẫn của đơn vị phụ trách.'], registrationOpen: false, image: null },
]
