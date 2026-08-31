export type JourneyCriterion = {
  id: string
  order: number
  shortName: string
  title: string
  meaning: string
  guidance: string[]
  conditions: string[]
  support: string[]
  roadmap: string[]
  evidence: string[]
  checklist: { id: string; label: string }[]
  color: string
}

export const journeyCriteria: JourneyCriterion[] = [
  {
    id: 'dao-duc',
    order: 1,
    shortName: 'Đạo đức',
    title: 'Đạo đức tốt',
    meaning: 'Rèn luyện lối sống trách nhiệm, trung thực và chủ động đóng góp cho tập thể.',
    guidance: [
      'Ý thức rèn luyện đạo đức và tác phong tích cực trong học tập',
      'Gương mẫu trong lối sống và môi trường học đường văn minh',
      'Tích cực tham gia các buổi sinh hoạt chuyên đề và hoạt động tập thể',
    ],
    conditions: [
      'Duy trì ý thức, tác phong tích cực trong học tập và sinh hoạt.',
      'Tham gia hoạt động xây dựng môi trường học đường văn minh.',
    ],
    support: [
      'Chuỗi chia sẻ về văn hóa ứng xử và trách nhiệm số.',
      'Hoạt động cộng đồng, sinh hoạt chuyên đề theo nhóm.',
    ],
    roadmap: [
      'Tự đánh giá thói quen hiện tại.',
      'Chọn một hoạt động rèn luyện phù hợp.',
      'Ghi lại thay đổi và minh chứng theo tháng.',
    ],
    evidence: [
      'Xác nhận hoặc giấy chứng nhận hoạt động.',
      'Bản ghi nhận quá trình rèn luyện cá nhân.',
    ],
    checklist: [
      { id: 'dao-duc-1', label: 'Đã đọc nội dung tiêu chí gợi ý' },
      { id: 'dao-duc-2', label: 'Đã chọn một thói quen muốn cải thiện' },
      { id: 'dao-duc-3', label: 'Đã lưu một minh chứng rèn luyện phù hợp' },
    ],
    color: '#ffd467',
  },
  {
    id: 'hoc-tap',
    order: 2,
    shortName: 'Học tập',
    title: 'Học tập tốt',
    meaning: 'Xây dựng năng lực chuyên môn, tinh thần tự học và khả năng giải quyết vấn đề.',
    guidance: [
      'Xây dựng nhịp học tập chủ động và mục tiêu điểm số theo từng kỳ',
      'Tham gia nghiên cứu khoa học, Olympic hoặc các dự án công nghệ',
      'Chủ động chia sẻ phương pháp học tập và kỹ năng chuyên môn',
    ],
    conditions: [
      'Theo dõi kết quả học tập theo từng học kỳ.',
      'Tham gia ít nhất một hoạt động học thuật phù hợp mục tiêu cá nhân.',
    ],
    support: [
      'Nhóm học tập và phiên chia sẻ phương pháp.',
      'Workshop nghiên cứu, công nghệ và kỹ năng chuyên môn.',
    ],
    roadmap: [
      'Đặt mục tiêu học kỳ.',
      'Lập nhịp học tập hằng tuần.',
      'Đánh giá kết quả và điều chỉnh kế hoạch.',
    ],
    evidence: [
      'Bảng điểm hoặc xác nhận kết quả phù hợp.',
      'Chứng nhận/cuộc thi/sản phẩm học thuật nếu có.',
    ],
    checklist: [
      { id: 'hoc-tap-1', label: 'Đã viết mục tiêu học tập cho học kỳ' },
      { id: 'hoc-tap-2', label: 'Đã chọn một hoạt động học thuật hoặc NCKH' },
      { id: 'hoc-tap-3', label: 'Đã lưu kết quả hoặc sản phẩm học tập' },
    ],
    color: '#6cd5f7',
  },
  {
    id: 'the-luc',
    order: 3,
    shortName: 'Thể lực',
    title: 'Thể lực tốt',
    meaning: 'Duy trì sức khỏe, kỷ luật vận động và tinh thần cân bằng trong đời sống sinh viên.',
    guidance: [
      'Duy trì thói quen rèn luyện thể chất đều đặn mỗi tuần',
      'Tham gia giải thể thao cấp trường/khoa hoặc các thử thách vận động',
      'Xây dựng lối sống năng động và chế độ sinh hoạt cân bằng',
    ],
    conditions: [
      'Xây dựng lịch vận động phù hợp thể trạng.',
      'Tham gia hoạt động thể thao hoặc thử thách sức khỏe.',
    ],
    support: [
      'Ngày hội thể thao và thử thách theo đội.',
      'Nhóm đồng hành duy trì thói quen vận động.',
    ],
    roadmap: [
      'Chọn hình thức vận động an toàn.',
      'Duy trì lịch tập tối thiểu mỗi tuần.',
      'Theo dõi tiến bộ và điều chỉnh cường độ.',
    ],
    evidence: [
      'Xác nhận tham gia hoạt động thể thao.',
      'Nhật ký luyện tập hoặc kết quả thử thách.',
    ],
    checklist: [
      { id: 'the-luc-1', label: 'Đã chọn hoạt động vận động phù hợp' },
      { id: 'the-luc-2', label: 'Đã lập lịch rèn luyện cá nhân' },
      { id: 'the-luc-3', label: 'Đã hoàn thành một mốc thử thách thể lực' },
    ],
    color: '#5fe3a1',
  },
  {
    id: 'tinh-nguyen',
    order: 4,
    shortName: 'Tình nguyện',
    title: 'Tình nguyện tốt',
    meaning: 'Biến sự quan tâm thành hành động thiết thực cho cộng đồng và môi trường xung quanh.',
    guidance: [
      'Tham gia các chiến dịch tình nguyện (Mùa hè xanh, Tiếp sức mùa thi...)',
      'Chủ động hỗ trợ các dự án phục vụ cộng đồng và học đường',
      'Gắn kết, lan tỏa tinh thần sẻ chia và trách nhiệm xã hội',
    ],
    conditions: [
      'Tham gia hoạt động tình nguyện phù hợp khả năng.',
      'Có ý thức phản hồi, rút kinh nghiệm sau hoạt động.',
    ],
    support: [
      'Chiến dịch tình nguyện theo mùa.',
      'Các dự án nhỏ do thành viên đề xuất và triển khai.',
    ],
    roadmap: [
      'Chọn vấn đề cộng đồng quan tâm.',
      'Đăng ký vai trò phù hợp.',
      'Tổng kết đóng góp và bài học nhận được.',
    ],
    evidence: [
      'Xác nhận hoặc chứng nhận tham gia.',
      'Ảnh, nhật ký hoặc sản phẩm đóng góp.',
    ],
    checklist: [
      { id: 'tinh-nguyen-1', label: 'Đã chọn một hoạt động cộng đồng phù hợp' },
      { id: 'tinh-nguyen-2', label: 'Đã tham gia hỗ trợ một chương trình tình nguyện' },
      { id: 'tinh-nguyen-3', label: 'Đã ghi nhận đóng góp và bài học sau hoạt động' },
    ],
    color: '#ff8b72',
  },
  {
    id: 'hoi-nhap',
    order: 5,
    shortName: 'Hội nhập',
    title: 'Hội nhập tốt',
    meaning: 'Mở rộng năng lực ngoại ngữ, kỹ năng số và tư duy sẵn sàng kết nối trong môi trường đa dạng.',
    guidance: [
      'Rèn luyện chứng chỉ ngoại ngữ (IELTS, TOEIC, VSTEP...) và kỹ năng số',
      'Tham gia các diễn đàn giao lưu, hội thảo học thuật hoặc workshop kỹ năng',
      'Hoàn thiện kỹ năng giao tiếp, làm việc nhóm và hồ sơ năng lực',
    ],
    conditions: [
      'Xây dựng mục tiêu ngoại ngữ hoặc kỹ năng hội nhập.',
      'Tham gia hoạt động giao lưu, kỹ năng hoặc môi trường đa văn hóa.',
    ],
    support: [
      'Câu lạc bộ kỹ năng, ngoại ngữ và giao lưu.',
      'Workshop CV, giao tiếp và cơ hội quốc tế.',
    ],
    roadmap: [
      'Xác định năng lực cần cải thiện.',
      'Thực hành trong môi trường thật.',
      'Ghi nhận phản hồi và hoàn thiện hồ sơ năng lực.',
    ],
    evidence: [
      'Chứng chỉ hoặc kết quả đánh giá nếu có.',
      'Xác nhận hoạt động giao lưu/kỹ năng.',
    ],
    checklist: [
      { id: 'hoi-nhap-1', label: 'Đã chọn một mục tiêu ngoại ngữ hoặc kỹ năng số' },
      { id: 'hoi-nhap-2', label: 'Đã tham gia một hoạt động giao lưu hoặc workshop' },
      { id: 'hoi-nhap-3', label: 'Đã cập nhật hồ sơ năng lực cá nhân' },
    ],
    color: '#b794f6',
  },
]

export const journeyStorageKey = 'uet5ss:journey-progress:v1'
export const journeyDisclaimer = 'Nội dung minh họa mang tính gợi ý rèn luyện – không thay thế tiêu chuẩn chính thức của Hội Sinh viên.'
