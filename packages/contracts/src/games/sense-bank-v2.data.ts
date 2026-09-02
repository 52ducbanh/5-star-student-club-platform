// Canonical 15-Scenario / 75-Option Bank from official BA 'Sense questions' Google Sheet
// 5 Groups (A, B, C, D, E) x 3 Scenarios per group = 15 scenarios.
// 5 Options per scenario = 75 options.

import type { TraitId } from '../starprints';

export type SenseGroupCode = 'A' | 'B' | 'C' | 'D' | 'E';
export type SenseTendency = 'CARE' | 'ACT' | 'ALIGN' | 'ADAPT' | 'REFLECT';

export interface SenseOptionV2Def {
  id: 'a' | 'b' | 'c' | 'd' | 'e';
  optionId: string;
  text: string;
  primaryTendency: SenseTendency;
  secondaryTendency: SenseTendency | null;
  weightPrimary: number; // 0.80 default
  weightSecondary: number; // 0.20 default
}

export interface SenseScenarioV2Def {
  id: string;
  group: SenseGroupCode;
  groupName: string;
  title: string;
  situation: string;
  options: SenseOptionV2Def[];
}

export const SENSE_GROUPS: readonly SenseGroupCode[] = ['A', 'B', 'C', 'D', 'E'];

export const SENSE_15_SCENARIOS: readonly SenseScenarioV2Def[] = [
  {
    "id": "SENSE-A1",
    "group": "A",
    "groupName": "A — Trách nhiệm trong tập thể",
    "title": "Thành viên báo chưa xong việc vào phút chót",
    "situation": "Nhóm bạn thuyết trình sáng mai. Tối nay, một thành viên nhắn là chưa làm xong phần của mình và không nói lý do.",
    "options": [
      {
        "id": "a",
        "optionId": "SENSE-A1-A",
        "text": "Cắt bớt phần đó khỏi bài để nhóm vừa sức làm nốt.",
        "primaryTendency": "ADAPT",
        "secondaryTendency": "ACT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "b",
        "optionId": "SENSE-A1-B",
        "text": "Nhắn hỏi bạn ấy có ổn không trước khi bàn tới phần việc.",
        "primaryTendency": "CARE",
        "secondaryTendency": "REFLECT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "c",
        "optionId": "SENSE-A1-C",
        "text": "Đưa lên nhóm chat để cả nhóm cùng quyết cách xử lý.",
        "primaryTendency": "ALIGN",
        "secondaryTendency": "CARE",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "d",
        "optionId": "SENSE-A1-D",
        "text": "Nhận làm luôn phần đó trong tối nay cho chắc chắn kịp.",
        "primaryTendency": "ACT",
        "secondaryTendency": "ADAPT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "e",
        "optionId": "SENSE-A1-E",
        "text": "Tìm hiểu vì sao tới sát giờ mới báo, rồi mới tính cách xử lý.",
        "primaryTendency": "REFLECT",
        "secondaryTendency": "CARE",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      }
    ]
  },
  {
    "id": "SENSE-A2",
    "group": "A",
    "groupName": "A — Trách nhiệm trong tập thể",
    "title": "Việc dồn vào một số ít người",
    "situation": "Bạn là nhóm trưởng. Hai tuần liền, phần lớn công việc dồn vào ba người, số còn lại làm rất ít.",
    "options": [
      {
        "id": "a",
        "optionId": "SENSE-A2-A",
        "text": "Hỏi riêng từng bạn đang làm ít xem các bạn gặp khó gì.",
        "primaryTendency": "CARE",
        "secondaryTendency": "REFLECT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "b",
        "optionId": "SENSE-A2-B",
        "text": "Chia việc thành các phần nhỏ hơn để ai cũng nhận được.",
        "primaryTendency": "ADAPT",
        "secondaryTendency": "ACT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "c",
        "optionId": "SENSE-A2-C",
        "text": "Họp nhóm, cùng nhìn lại cách phân việc hiện tại.",
        "primaryTendency": "ALIGN",
        "secondaryTendency": "REFLECT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "d",
        "optionId": "SENSE-A2-D",
        "text": "Xem lại cách nhóm nhận và phân việc ngay từ đầu kỳ.",
        "primaryTendency": "REFLECT",
        "secondaryTendency": "ALIGN",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "e",
        "optionId": "SENSE-A2-E",
        "text": "Giao lại việc cụ thể cho từng người ngay trong hôm nay.",
        "primaryTendency": "ACT",
        "secondaryTendency": "ALIGN",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      }
    ]
  },
  {
    "id": "SENSE-A3",
    "group": "A",
    "groupName": "A — Trách nhiệm trong tập thể",
    "title": "Nhận việc quá sức mình",
    "situation": "Bạn đã nhận phụ trách một đầu việc, nhưng nhận ra mình không đủ thời gian làm tốt. Còn năm ngày nữa tới hạn.",
    "options": [
      {
        "id": "a",
        "optionId": "SENSE-A3-A",
        "text": "Thu hẹp phần việc xuống mức mình chắc chắn làm tốt.",
        "primaryTendency": "ADAPT",
        "secondaryTendency": "ACT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "b",
        "optionId": "SENSE-A3-B",
        "text": "Đưa ra nhóm để cả nhóm cùng sắp xếp lại.",
        "primaryTendency": "ALIGN",
        "secondaryTendency": "CARE",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "c",
        "optionId": "SENSE-A3-C",
        "text": "Báo ngay và bàn giao phần mình không kham nổi.",
        "primaryTendency": "ACT",
        "secondaryTendency": "REFLECT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "d",
        "optionId": "SENSE-A3-D",
        "text": "Rủ một bạn cùng làm để không ai phải gánh một mình.",
        "primaryTendency": "CARE",
        "secondaryTendency": "ACT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "e",
        "optionId": "SENSE-A3-E",
        "text": "Xem lại vì sao mình nhận quá sức, rồi mới quyết.",
        "primaryTendency": "REFLECT",
        "secondaryTendency": "ADAPT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      }
    ]
  },
  {
    "id": "SENSE-B1",
    "group": "B",
    "groupName": "B — Con người và nguyên tắc",
    "title": "Bạn thân ghi sai số liệu trong báo cáo chung",
    "situation": "Bạn phát hiện một người bạn thân ghi sai số liệu trong báo cáo chung. Báo cáo đã gửi cho ban tổ chức.",
    "options": [
      {
        "id": "a",
        "optionId": "SENSE-B1-A",
        "text": "Báo ban tổ chức ngay để kịp đính chính.",
        "primaryTendency": "ACT",
        "secondaryTendency": "REFLECT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "b",
        "optionId": "SENSE-B1-B",
        "text": "Nói riêng với bạn ấy trước để bạn ấy tự báo và tự sửa.",
        "primaryTendency": "CARE",
        "secondaryTendency": "ALIGN",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "c",
        "optionId": "SENSE-B1-C",
        "text": "Sửa phần còn kịp trước, phần đã gửi thì xử lý sau.",
        "primaryTendency": "ADAPT",
        "secondaryTendency": "ACT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "d",
        "optionId": "SENSE-B1-D",
        "text": "Tìm hiểu vì sao sai để tránh lặp lại, rồi mới nói chuyện.",
        "primaryTendency": "REFLECT",
        "secondaryTendency": "CARE",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "e",
        "optionId": "SENSE-B1-E",
        "text": "Cùng bạn ấy báo với nhóm rồi thống nhất cách xử lý.",
        "primaryTendency": "ALIGN",
        "secondaryTendency": "CARE",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      }
    ]
  },
  {
    "id": "SENSE-B2",
    "group": "B",
    "groupName": "B — Con người và nguyên tắc",
    "title": "Người làm tốt nhưng hay đi trễ",
    "situation": "Một thành viên thường xuyên đi trễ họp nhưng phần việc luôn hoàn thành tốt. Vài bạn khác bắt đầu thấy không công bằng.",
    "options": [
      {
        "id": "a",
        "optionId": "SENSE-B2-A",
        "text": "Điều chỉnh giờ họp cho hợp lịch của mọi người hơn.",
        "primaryTendency": "ADAPT",
        "secondaryTendency": "ALIGN",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "b",
        "optionId": "SENSE-B2-B",
        "text": "Đưa ra nhóm để thống nhất lại quy ước chung về giờ giấc.",
        "primaryTendency": "ALIGN",
        "secondaryTendency": "REFLECT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "c",
        "optionId": "SENSE-B2-C",
        "text": "Nhắc thẳng bạn ấy trong buổi họp gần nhất.",
        "primaryTendency": "ACT",
        "secondaryTendency": "ALIGN",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "d",
        "optionId": "SENSE-B2-D",
        "text": "Xem việc đi trễ thực sự ảnh hưởng tới nhóm ở mức nào.",
        "primaryTendency": "REFLECT",
        "secondaryTendency": "ADAPT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "e",
        "optionId": "SENSE-B2-E",
        "text": "Hỏi bạn ấy vì sao hay trễ trước khi nói gì thêm.",
        "primaryTendency": "CARE",
        "secondaryTendency": "REFLECT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      }
    ]
  },
  {
    "id": "SENSE-B3",
    "group": "B",
    "groupName": "B — Con người và nguyên tắc",
    "title": "Chấm bài của người quen",
    "situation": "Bạn được nhờ chấm bài dự thi và nhận ra một bài là của người quen. Bài đó khá tốt nhưng không nổi bật.",
    "options": [
      {
        "id": "a",
        "optionId": "SENSE-B3-A",
        "text": "Chấm đúng theo bộ tiêu chí chung như với mọi bài khác.",
        "primaryTendency": "ALIGN",
        "secondaryTendency": "REFLECT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "b",
        "optionId": "SENSE-B3-B",
        "text": "Nhờ thêm một người nữa chấm cùng bài đó cho khách quan.",
        "primaryTendency": "ADAPT",
        "secondaryTendency": "ALIGN",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "c",
        "optionId": "SENSE-B3-C",
        "text": "Chấm bình thường rồi góp ý riêng để bạn ấy tiến bộ.",
        "primaryTendency": "CARE",
        "secondaryTendency": "REFLECT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "d",
        "optionId": "SENSE-B3-D",
        "text": "Đọc kỹ lại tiêu chí xem mình có đang nghiêng vì quen biết không.",
        "primaryTendency": "REFLECT",
        "secondaryTendency": "ADAPT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "e",
        "optionId": "SENSE-B3-E",
        "text": "Báo ban tổ chức về mối quen biết và xin đổi bài chấm.",
        "primaryTendency": "ACT",
        "secondaryTendency": "REFLECT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      }
    ]
  },
  {
    "id": "SENSE-C1",
    "group": "C",
    "groupName": "C — Phân bổ nguồn lực",
    "title": "Hai khu vực cùng thiếu người",
    "situation": "Ngày sự kiện, hai khu vực cùng báo thiếu người. Bạn chỉ điều được một nhóm hỗ trợ.",
    "options": [
      {
        "id": "a",
        "optionId": "SENSE-C1-A",
        "text": "Đưa người tới khu đang gấp nhất ngay lập tức.",
        "primaryTendency": "ACT",
        "secondaryTendency": "ADAPT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "b",
        "optionId": "SENSE-C1-B",
        "text": "Chia đôi nhóm hỗ trợ, mỗi bên một nửa.",
        "primaryTendency": "ADAPT",
        "secondaryTendency": "ACT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "c",
        "optionId": "SENSE-C1-C",
        "text": "Xem khu nào ảnh hưởng tới nhiều người hơn rồi quyết.",
        "primaryTendency": "REFLECT",
        "secondaryTendency": "ALIGN",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "d",
        "optionId": "SENSE-C1-D",
        "text": "Ưu tiên khu có người đang quá tải và mệt nhất.",
        "primaryTendency": "CARE",
        "secondaryTendency": "ALIGN",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "e",
        "optionId": "SENSE-C1-E",
        "text": "Hỏi hai khu tự trao đổi xem bên nào cần hơn.",
        "primaryTendency": "ALIGN",
        "secondaryTendency": "CARE",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      }
    ]
  },
  {
    "id": "SENSE-C2",
    "group": "C",
    "groupName": "C — Phân bổ nguồn lực",
    "title": "Khoản kinh phí cuối kỳ",
    "situation": "CLB còn một khoản kinh phí nhỏ. Có thể dùng để cảm ơn cộng tác viên kỳ này, hoặc để dành cho hoạt động kỳ sau.",
    "options": [
      {
        "id": "a",
        "optionId": "SENSE-C2-A",
        "text": "Chia nhỏ: một phần cảm ơn, một phần để dành.",
        "primaryTendency": "ADAPT",
        "secondaryTendency": "ACT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "b",
        "optionId": "SENSE-C2-B",
        "text": "Dùng để cảm ơn những người đã làm suốt kỳ vừa rồi.",
        "primaryTendency": "CARE",
        "secondaryTendency": "ALIGN",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "c",
        "optionId": "SENSE-C2-C",
        "text": "Xem khoản nào tạo giá trị lâu dài hơn cho CLB.",
        "primaryTendency": "REFLECT",
        "secondaryTendency": "ADAPT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "d",
        "optionId": "SENSE-C2-D",
        "text": "Đưa ban điều hành cùng bàn rồi quyết theo số đông.",
        "primaryTendency": "ALIGN",
        "secondaryTendency": "CARE",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "e",
        "optionId": "SENSE-C2-E",
        "text": "Quyết luôn theo kế hoạch đã định từ đầu kỳ.",
        "primaryTendency": "ACT",
        "secondaryTendency": "REFLECT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      }
    ]
  },
  {
    "id": "SENSE-C3",
    "group": "C",
    "groupName": "C — Phân bổ nguồn lực",
    "title": "Hai lịch trùng giờ",
    "situation": "Buổi tổng duyệt của CLB trùng giờ với buổi học nhóm môn bạn sắp thi. Cả hai đều đã hẹn từ trước.",
    "options": [
      {
        "id": "a",
        "optionId": "SENSE-C3-A",
        "text": "Hỏi cả hai bên xem có thể đổi giờ được không.",
        "primaryTendency": "ALIGN",
        "secondaryTendency": "CARE",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "b",
        "optionId": "SENSE-C3-B",
        "text": "Dự nửa buổi mỗi bên rồi bù phần thiếu sau.",
        "primaryTendency": "ADAPT",
        "secondaryTendency": "ACT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "c",
        "optionId": "SENSE-C3-C",
        "text": "Chọn bên mà mọi người đang trông vào mình nhiều hơn.",
        "primaryTendency": "CARE",
        "secondaryTendency": "ALIGN",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "d",
        "optionId": "SENSE-C3-D",
        "text": "Cân xem bỏ bên nào thì hậu quả khó bù hơn.",
        "primaryTendency": "REFLECT",
        "secondaryTendency": "ADAPT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "e",
        "optionId": "SENSE-C3-E",
        "text": "Chọn ngay một bên và báo bên kia sớm nhất có thể.",
        "primaryTendency": "ACT",
        "secondaryTendency": "CARE",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      }
    ]
  },
  {
    "id": "SENSE-D1",
    "group": "D",
    "groupName": "D — Quyết định dưới áp lực",
    "title": "Sự cố kỹ thuật trước giờ khai mạc",
    "situation": "Mười phút nữa khai mạc. Máy chiếu không lên hình và người phụ trách kỹ thuật chưa có mặt.",
    "options": [
      {
        "id": "a",
        "optionId": "SENSE-D1-A",
        "text": "Xác định lỗi nằm ở đâu trước khi thử sửa.",
        "primaryTendency": "REFLECT",
        "secondaryTendency": "ADAPT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "b",
        "optionId": "SENSE-D1-B",
        "text": "Tự thử các cách sửa nhanh nhất có thể.",
        "primaryTendency": "ACT",
        "secondaryTendency": "ADAPT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "c",
        "optionId": "SENSE-D1-C",
        "text": "Chuyển sang phương án trình bày không cần máy chiếu.",
        "primaryTendency": "ADAPT",
        "secondaryTendency": "ACT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "d",
        "optionId": "SENSE-D1-D",
        "text": "Báo khán giả để mọi người khỏi sốt ruột, rồi mới xử lý.",
        "primaryTendency": "CARE",
        "secondaryTendency": "ACT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "e",
        "optionId": "SENSE-D1-E",
        "text": "Gọi nhanh ban tổ chức để cùng quyết phương án.",
        "primaryTendency": "ALIGN",
        "secondaryTendency": "ACT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      }
    ]
  },
  {
    "id": "SENSE-D2",
    "group": "D",
    "groupName": "D — Quyết định dưới áp lực",
    "title": "Khách mời báo tới trễ",
    "situation": "Chương trình đang chạy thì khách mời báo tới trễ 20 phút. Bạn là người điều phối.",
    "options": [
      {
        "id": "a",
        "optionId": "SENSE-D2-A",
        "text": "Hỏi nhanh MC và ban nội dung rồi thống nhất.",
        "primaryTendency": "ALIGN",
        "secondaryTendency": "ACT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "b",
        "optionId": "SENSE-D2-B",
        "text": "Đảo thứ tự các phần để lấp chỗ trống.",
        "primaryTendency": "ADAPT",
        "secondaryTendency": "ACT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "c",
        "optionId": "SENSE-D2-C",
        "text": "Ước lượng 20 phút đó ảnh hưởng tới cả chương trình ra sao.",
        "primaryTendency": "REFLECT",
        "secondaryTendency": "ALIGN",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "d",
        "optionId": "SENSE-D2-D",
        "text": "Xem khán giả đang thế nào để chọn cách ít gây khó chịu nhất.",
        "primaryTendency": "CARE",
        "secondaryTendency": "REFLECT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "e",
        "optionId": "SENSE-D2-E",
        "text": "Cho chạy tiếp phần kế và tính sau.",
        "primaryTendency": "ACT",
        "secondaryTendency": "ADAPT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      }
    ]
  },
  {
    "id": "SENSE-D3",
    "group": "D",
    "groupName": "D — Quyết định dưới áp lực",
    "title": "Thiếu chữ ký sát giờ nộp",
    "situation": "Sát giờ nộp hồ sơ, bạn phát hiện thiếu một chữ ký. Người cần ký thì đang không liên lạc được.",
    "options": [
      {
        "id": "a",
        "optionId": "SENSE-D3-A",
        "text": "Xem chữ ký đó có thật sự bắt buộc không đã.",
        "primaryTendency": "REFLECT",
        "secondaryTendency": "ADAPT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "b",
        "optionId": "SENSE-D3-B",
        "text": "Tìm người khác có thẩm quyền ký thay.",
        "primaryTendency": "ADAPT",
        "secondaryTendency": "ACT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "c",
        "optionId": "SENSE-D3-C",
        "text": "Nộp phần đang có trước, bổ sung chữ ký sau.",
        "primaryTendency": "ACT",
        "secondaryTendency": "ADAPT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "d",
        "optionId": "SENSE-D3-D",
        "text": "Báo cả nhóm biết ngay để không ai bị bất ngờ.",
        "primaryTendency": "CARE",
        "secondaryTendency": "ALIGN",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "e",
        "optionId": "SENSE-D3-E",
        "text": "Hỏi ban tổ chức xem có cách nào thay thế không.",
        "primaryTendency": "ALIGN",
        "secondaryTendency": "ACT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      }
    ]
  },
  {
    "id": "SENSE-E1",
    "group": "E",
    "groupName": "E — Xung đột lợi ích",
    "title": "Lịch họp thuận cho số đông",
    "situation": "Lịch họp mới thuận tiện cho phần lớn thành viên, nhưng khiến ba bạn ở xa gần như không tham gia được.",
    "options": [
      {
        "id": "a",
        "optionId": "SENSE-E1-A",
        "text": "Giữ lịch mới nhưng cho ba bạn tham gia trực tuyến.",
        "primaryTendency": "ADAPT",
        "secondaryTendency": "CARE",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "b",
        "optionId": "SENSE-E1-B",
        "text": "Đưa cả hai phương án ra cho nhóm cùng chọn.",
        "primaryTendency": "ALIGN",
        "secondaryTendency": "CARE",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "c",
        "optionId": "SENSE-E1-C",
        "text": "Ưu tiên giữ cho ba bạn ở xa vẫn tham gia được.",
        "primaryTendency": "CARE",
        "secondaryTendency": "REFLECT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "d",
        "optionId": "SENSE-E1-D",
        "text": "Xem về lâu dài cách nào giữ được nhiều người gắn bó hơn.",
        "primaryTendency": "REFLECT",
        "secondaryTendency": "CARE",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "e",
        "optionId": "SENSE-E1-E",
        "text": "Chốt theo số đông rồi hỗ trợ riêng ba bạn kia.",
        "primaryTendency": "ACT",
        "secondaryTendency": "CARE",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      }
    ]
  },
  {
    "id": "SENSE-E2",
    "group": "E",
    "groupName": "E — Xung đột lợi ích",
    "title": "Một suất tham dự, hai người xứng đáng",
    "situation": "CLB có một suất tham dự hội thảo. Một bạn đã đóng góp nhiều nhất, một bạn khác đang rất cần cơ hội này.",
    "options": [
      {
        "id": "a",
        "optionId": "SENSE-E2-A",
        "text": "Đặt tiêu chí rõ ràng rồi xét theo đúng tiêu chí đó.",
        "primaryTendency": "ALIGN",
        "secondaryTendency": "REFLECT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "b",
        "optionId": "SENSE-E2-B",
        "text": "Ưu tiên bạn đang cần cơ hội hơn.",
        "primaryTendency": "CARE",
        "secondaryTendency": "ADAPT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "c",
        "optionId": "SENSE-E2-C",
        "text": "Cho một bạn đi, bạn còn lại nhận cơ hội tương đương lần tới.",
        "primaryTendency": "ADAPT",
        "secondaryTendency": "CARE",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "d",
        "optionId": "SENSE-E2-D",
        "text": "Xem suất này tạo ra giá trị lớn hơn ở phía nào.",
        "primaryTendency": "REFLECT",
        "secondaryTendency": "ALIGN",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "e",
        "optionId": "SENSE-E2-E",
        "text": "Quyết theo đóng góp đã có và nói rõ lý do.",
        "primaryTendency": "ACT",
        "secondaryTendency": "ALIGN",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      }
    ]
  },
  {
    "id": "SENSE-E3",
    "group": "E",
    "groupName": "E — Xung đột lợi ích",
    "title": "Quy định mới làm mất quyền của một nhóm",
    "situation": "Một quy định mới giúp CLB vận hành gọn hơn, nhưng khiến nhóm cộng tác viên mất bớt quyền tham gia.",
    "options": [
      {
        "id": "a",
        "optionId": "SENSE-E3-A",
        "text": "Áp dụng thử một kỳ rồi điều chỉnh.",
        "primaryTendency": "ADAPT",
        "secondaryTendency": "REFLECT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "b",
        "optionId": "SENSE-E3-B",
        "text": "Áp dụng luôn và giải thích rõ lý do cho mọi người.",
        "primaryTendency": "ACT",
        "secondaryTendency": "ALIGN",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "c",
        "optionId": "SENSE-E3-C",
        "text": "Mời cộng tác viên cùng bàn trước khi áp dụng.",
        "primaryTendency": "ALIGN",
        "secondaryTendency": "CARE",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "d",
        "optionId": "SENSE-E3-D",
        "text": "Xem quy định này giải quyết vấn đề gì và có cách khác không.",
        "primaryTendency": "REFLECT",
        "secondaryTendency": "ADAPT",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      },
      {
        "id": "e",
        "optionId": "SENSE-E3-E",
        "text": "Giữ lại phần quyền quan trọng nhất với cộng tác viên.",
        "primaryTendency": "CARE",
        "secondaryTendency": "ALIGN",
        "weightPrimary": 0.8,
        "weightSecondary": 0.2
      }
    ]
  }
];

export const SENSE_SCENARIOS_BY_ID = new Map<string, SenseScenarioV2Def>(
  SENSE_15_SCENARIOS.map((s) => [s.id, s]),
);

export const SENSE_SCENARIOS_BY_GROUP = SENSE_GROUPS.reduce((acc, grp) => {
  acc[grp] = SENSE_15_SCENARIOS.filter((s) => s.group === grp);
  return acc;
}, {} as Record<SenseGroupCode, SenseScenarioV2Def[]>);

/**
 * Official BA Tendency -> Hidden Trait Matrix
 * Source: spec SENSE section 2.6 / Google Sheet GID 1683291018
 */
export const TENDENCY_TRAIT_MATRIX: Record<SenseTendency, Record<TraitId, number>> = {
  CARE: {
    sharpness: 0.0,
    insight: 0.0,
    precision: 0.0,
    initiative: 0.0,
    connection: 1.0,
    adaptation: 0.3,
    persistence: 0.2,
  },
  ACT: {
    sharpness: 0.3,
    insight: 0.0,
    precision: 0.0,
    initiative: 1.0,
    connection: 0.0,
    adaptation: 0.0,
    persistence: 0.1,
  },
  ALIGN: {
    sharpness: 0.0,
    insight: 0.3,
    precision: 0.5,
    initiative: 0.0,
    connection: 0.7,
    adaptation: 0.0,
    persistence: 0.0,
  },
  ADAPT: {
    sharpness: 0.0,
    insight: 0.4,
    precision: 0.0,
    initiative: 0.2,
    connection: 0.0,
    adaptation: 1.0,
    persistence: 0.0,
  },
  REFLECT: {
    sharpness: 0.0,
    insight: 0.8,
    precision: 0.5,
    initiative: 0.0,
    connection: 0.0,
    adaptation: 0.0,
    persistence: 0.4,
  },
};

/**
 * Official BA Response-Time Modifiers (Section 2.9)
 */
export function getResponseTimeModifier(responseTimeMs: number, timedOut: boolean): Partial<Record<TraitId, number>> {
  if (timedOut) return {};
  const seconds = responseTimeMs / 1000;
  if (seconds <= 3) {
    return { sharpness: 0.20, initiative: 0.10 };
  }
  if (seconds >= 7 && seconds <= 10) {
    return { insight: 0.10, precision: 0.10 };
  }
  return {}; // 3-7s neutral
}

/**
 * Consistency multiplier: 1.10 if all 3 chosen options share the same primary tendency
 */
export const SENSE_CONSISTENCY_MULTIPLIER = 1.10;
