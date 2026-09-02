// Canonical 50-Question Bank from official BA 'Solve' Google Sheet
// Exactly 10 questions per category across 5 categories = 50 questions total.

export interface SolveQuestionV2Def {
  id: string;
  index: number;
  category: 'pattern_sequence' | 'visual_precision' | 'quick_logic' | 'rule_shift' | 'general_5ss';
  categoryName: string;
  question: string;
  options: Array<{ id: 'a' | 'b' | 'c' | 'd' | 'e'; text: string }>;
  correctOptionId: 'a' | 'b' | 'c' | 'd' | 'e';
  explanation: string;
}

export const SOLVE_CATEGORIES = [
  'pattern_sequence',
  'visual_precision',
  'quick_logic',
  'rule_shift',
  'general_5ss',
] as const;

export type SolveCategoryId = (typeof SOLVE_CATEGORIES)[number];

export const SOLVE_50_QUESTIONS: readonly SolveQuestionV2Def[] = [
  {
    "id": "sv2-patt-1",
    "index": 1,
    "category": "pattern_sequence",
    "categoryName": "Pattern / Sequence",
    "question": "3, 6, 9, 12, ?",
    "options": [
      {
        "id": "a",
        "text": "13"
      },
      {
        "id": "b",
        "text": "14"
      },
      {
        "id": "c",
        "text": "15"
      },
      {
        "id": "d",
        "text": "16"
      },
      {
        "id": "e",
        "text": "18"
      }
    ],
    "correctOptionId": "c",
    "explanation": "Quy luật cộng 3 (+3)"
  },
  {
    "id": "sv2-patt-2",
    "index": 2,
    "category": "pattern_sequence",
    "categoryName": "Pattern / Sequence",
    "question": "1, 4, 9, 16, ?",
    "options": [
      {
        "id": "a",
        "text": "20"
      },
      {
        "id": "b",
        "text": "25"
      },
      {
        "id": "c",
        "text": "30"
      },
      {
        "id": "d",
        "text": "36"
      },
      {
        "id": "e",
        "text": "49"
      }
    ],
    "correctOptionId": "b",
    "explanation": "Dãy số chính phương (12,22,32,42,52)"
  },
  {
    "id": "sv2-patt-3",
    "index": 3,
    "category": "pattern_sequence",
    "categoryName": "Pattern / Sequence",
    "question": "A, C, E, G, ?",
    "options": [
      {
        "id": "a",
        "text": "H"
      },
      {
        "id": "b",
        "text": "I"
      },
      {
        "id": "c",
        "text": "K"
      },
      {
        "id": "d",
        "text": "L"
      },
      {
        "id": "e",
        "text": "M"
      }
    ],
    "correctOptionId": "b",
    "explanation": "Bỏ qua 1 chữ cái trong bảng alphabet"
  },
  {
    "id": "sv2-patt-4",
    "index": 4,
    "category": "pattern_sequence",
    "categoryName": "Pattern / Sequence",
    "question": "50, 45, 40, 35, ?",
    "options": [
      {
        "id": "a",
        "text": "25"
      },
      {
        "id": "b",
        "text": "30"
      },
      {
        "id": "c",
        "text": "32"
      },
      {
        "id": "d",
        "text": "34"
      },
      {
        "id": "e",
        "text": "20"
      }
    ],
    "correctOptionId": "b",
    "explanation": "Quy luật trừ 5 (-5)"
  },
  {
    "id": "sv2-patt-5",
    "index": 5,
    "category": "pattern_sequence",
    "categoryName": "Pattern / Sequence",
    "question": "2, 6, 12, 20, ?",
    "options": [
      {
        "id": "a",
        "text": "24"
      },
      {
        "id": "b",
        "text": "28"
      },
      {
        "id": "c",
        "text": "30"
      },
      {
        "id": "d",
        "text": "32"
      },
      {
        "id": "e",
        "text": "36"
      }
    ],
    "correctOptionId": "c",
    "explanation": "Tăng dần khoảng cách: +4, +6, +8, +10"
  },
  {
    "id": "sv2-visu-6",
    "index": 6,
    "category": "visual_precision",
    "categoryName": "Visual Precision",
    "question": "Tìm từ viết sai chính tả:",
    "options": [
      {
        "id": "a",
        "text": "Thành công"
      },
      {
        "id": "b",
        "text": "Nỗ lực"
      },
      {
        "id": "c",
        "text": "Sáng tạo"
      },
      {
        "id": "d",
        "text": "Kiên chì"
      },
      {
        "id": "e",
        "text": "Tích cực"
      }
    ],
    "correctOptionId": "d",
    "explanation": "Viết đúng phải là \"Kiên trì\""
  },
  {
    "id": "sv2-visu-7",
    "index": 7,
    "category": "visual_precision",
    "categoryName": "Visual Precision",
    "question": "Tìm chữ số lẻ lạc loài trong dãy:",
    "options": [
      {
        "id": "a",
        "text": "2468"
      },
      {
        "id": "b",
        "text": "8642"
      },
      {
        "id": "c",
        "text": "2486"
      },
      {
        "id": "d",
        "text": "2478"
      },
      {
        "id": "e",
        "text": "8264"
      }
    ],
    "correctOptionId": "d",
    "explanation": "Chứa số lẻ 7, các phương án khác toàn số chẵn"
  },
  {
    "id": "sv2-visu-8",
    "index": 8,
    "category": "visual_precision",
    "categoryName": "Visual Precision",
    "question": "Tìm ký hiệu khác biệt nhất:",
    "options": [
      {
        "id": "a",
        "text": "◼"
      },
      {
        "id": "b",
        "text": "◆"
      },
      {
        "id": "c",
        "text": "▲"
      },
      {
        "id": "d",
        "text": "●"
      },
      {
        "id": "e",
        "text": "★"
      }
    ],
    "correctOptionId": "d",
    "explanation": "Hình tròn (●) không có góc/cạnh thẳng"
  },
  {
    "id": "sv2-visu-9",
    "index": 9,
    "category": "visual_precision",
    "categoryName": "Visual Precision",
    "question": "Cặp từ nào KHÔNG phải từ trái nghĩa?",
    "options": [
      {
        "id": "a",
        "text": "Đen - Trắng"
      },
      {
        "id": "b",
        "text": "Cao - Thấp"
      },
      {
        "id": "c",
        "text": "Nhanh - Chậm"
      },
      {
        "id": "d",
        "text": "Sớm - Muộn"
      },
      {
        "id": "e",
        "text": "Chăm - Ngoan"
      }
    ],
    "correctOptionId": "e",
    "explanation": "Chăm - Ngoan là hai từ đồng hướng/khen ngợi, không trái nghĩa"
  },
  {
    "id": "sv2-visu-10",
    "index": 10,
    "category": "visual_precision",
    "categoryName": "Visual Precision",
    "question": "Tìm nhóm ký tự bị đảo ngược quy luật:",
    "options": [
      {
        "id": "a",
        "text": "ABC"
      },
      {
        "id": "b",
        "text": "DEF"
      },
      {
        "id": "c",
        "text": "GHI"
      },
      {
        "id": "d",
        "text": "LKJ"
      },
      {
        "id": "e",
        "text": "MNO"
      }
    ],
    "correctOptionId": "d",
    "explanation": "LKJ đi lùi, các nhóm khác theo thứ tự alphabet"
  },
  {
    "id": "sv2-quic-11",
    "index": 11,
    "category": "quick_logic",
    "categoryName": "Quick Logic",
    "question": "Lan cao hơn Mai, Mai cao hơn Hoa. Ai thấp nhất?",
    "options": [
      {
        "id": "a",
        "text": "Lan"
      },
      {
        "id": "b",
        "text": "Mai"
      },
      {
        "id": "c",
        "text": "Hoa"
      },
      {
        "id": "d",
        "text": "Mai và Hoa"
      },
      {
        "id": "e",
        "text": "Không xác định"
      }
    ],
    "correctOptionId": "c",
    "explanation": "Thứ tự: Lan > Mai > Hoa"
  },
  {
    "id": "sv2-quic-12",
    "index": 12,
    "category": "quick_logic",
    "categoryName": "Quick Logic",
    "question": "Mọi con mèo đều thích cá. Miu là một con mèo. Vậy:",
    "options": [
      {
        "id": "a",
        "text": "Miu sợ nước"
      },
      {
        "id": "b",
        "text": "Miu thích cá"
      },
      {
        "id": "c",
        "text": "Miu bắt chuột giỏi"
      },
      {
        "id": "d",
        "text": "Miu màu vàng"
      },
      {
        "id": "e",
        "text": "Miu rất lười"
      }
    ],
    "correctOptionId": "b",
    "explanation": "Suy luận tất yếu từ tiền đề"
  },
  {
    "id": "sv2-quic-13",
    "index": 13,
    "category": "quick_logic",
    "categoryName": "Quick Logic",
    "question": "Hôm nay là thứ Tư. 3 ngày trước là ngày nào?",
    "options": [
      {
        "id": "a",
        "text": "Thứ Hai"
      },
      {
        "id": "b",
        "text": "Chủ Nhật"
      },
      {
        "id": "c",
        "text": "Thứ Bảy"
      },
      {
        "id": "d",
        "text": "Thứ Sáu"
      },
      {
        "id": "e",
        "text": "Thứ Năm"
      }
    ],
    "correctOptionId": "b",
    "explanation": "Đếm lùi 3 ngày từ thứ Tư: Ba -> Hai -> Chủ Nhật"
  },
  {
    "id": "sv2-quic-14",
    "index": 14,
    "category": "quick_logic",
    "categoryName": "Quick Logic",
    "question": "Tủ sách có 3 tầng. Sách Toán ở trên Văn, Văn ở trên Sử. Sách Sử ở đâu?",
    "options": [
      {
        "id": "a",
        "text": "Tầng 1 (dưới cùng)"
      },
      {
        "id": "b",
        "text": "Tầng 2 (ở giữa)"
      },
      {
        "id": "c",
        "text": "Tầng 3 (trên cùng)"
      },
      {
        "id": "d",
        "text": "Tầng 2 hoặc 3"
      },
      {
        "id": "e",
        "text": "Cùng tầng với Toán"
      }
    ],
    "correctOptionId": "a",
    "explanation": "Thứ tự từ trên xuống: Toán (3) -> Văn (2) -> Sử (1)"
  },
  {
    "id": "sv2-quic-15",
    "index": 15,
    "category": "quick_logic",
    "categoryName": "Quick Logic",
    "question": "Nếu trời mưa thì đường ướt. Hiện tại đường không ướt. Kết luận:",
    "options": [
      {
        "id": "a",
        "text": "Trời sắp mưa"
      },
      {
        "id": "b",
        "text": "Trời đã tạnh"
      },
      {
        "id": "c",
        "text": "Trời không mưa"
      },
      {
        "id": "d",
        "text": "Trời có tuyết"
      },
      {
        "id": "e",
        "text": "Đường mới làm"
      }
    ],
    "correctOptionId": "c",
    "explanation": "Phủ định hệ quả (modus tollens): không ướt thì chắc chắn không mưa"
  },
  {
    "id": "sv2-rule-16",
    "index": 16,
    "category": "rule_shift",
    "categoryName": "Rule Shift",
    "question": "Quy tắc: Đảo ngược từ. \"NGOI\" thành:",
    "options": [
      {
        "id": "a",
        "text": "OING"
      },
      {
        "id": "b",
        "text": "IONG"
      },
      {
        "id": "c",
        "text": "IOGN"
      },
      {
        "id": "d",
        "text": "OGNI"
      },
      {
        "id": "e",
        "text": "GINO"
      }
    ],
    "correctOptionId": "c",
    "explanation": "Đọc ngược từ phải qua trái: I-O-N-G"
  },
  {
    "id": "sv2-rule-17",
    "index": 17,
    "category": "rule_shift",
    "categoryName": "Rule Shift",
    "question": "Nếu 1 = 5, 2 = 10, 3 = 15, thì 4 = ?",
    "options": [
      {
        "id": "a",
        "text": "16"
      },
      {
        "id": "b",
        "text": "18"
      },
      {
        "id": "c",
        "text": "20"
      },
      {
        "id": "d",
        "text": "25"
      },
      {
        "id": "e",
        "text": "30"
      }
    ],
    "correctOptionId": "c",
    "explanation": "Quy tắc nhân 5 (4×5=20)"
  },
  {
    "id": "sv2-rule-18",
    "index": 18,
    "category": "rule_shift",
    "categoryName": "Rule Shift",
    "question": "Đổi dấu: (+) thành nhân (×). Tính: 3+4=?",
    "options": [
      {
        "id": "a",
        "text": "7"
      },
      {
        "id": "b",
        "text": "1"
      },
      {
        "id": "c",
        "text": "12"
      },
      {
        "id": "d",
        "text": "0"
      },
      {
        "id": "e",
        "text": "14"
      }
    ],
    "correctOptionId": "c",
    "explanation": "3×4=12"
  },
  {
    "id": "sv2-rule-19",
    "index": 19,
    "category": "rule_shift",
    "categoryName": "Rule Shift",
    "question": "Gán: A = 1, B = 2, C = 3. Giá trị của \"CAB\" là:",
    "options": [
      {
        "id": "a",
        "text": "312"
      },
      {
        "id": "b",
        "text": "123"
      },
      {
        "id": "c",
        "text": "321"
      },
      {
        "id": "d",
        "text": "213"
      },
      {
        "id": "e",
        "text": "132"
      }
    ],
    "correctOptionId": "a",
    "explanation": "C(3) - A(1) - B(2) = 312"
  },
  {
    "id": "sv2-rule-20",
    "index": 20,
    "category": "rule_shift",
    "categoryName": "Rule Shift",
    "question": "Quy ước: Số chẵn thì +1, số lẻ thì -1. Số 8 biến thành:",
    "options": [
      {
        "id": "a",
        "text": "6"
      },
      {
        "id": "b",
        "text": "7"
      },
      {
        "id": "c",
        "text": "8"
      },
      {
        "id": "d",
        "text": "9"
      },
      {
        "id": "e",
        "text": "10"
      }
    ],
    "correctOptionId": "d",
    "explanation": "8 là số chẵn →8+1=9"
  },
  {
    "id": "sv2-gene-21",
    "index": 21,
    "category": "general_5ss",
    "categoryName": "General / 5SS",
    "question": "Danh hiệu \"Sinh viên 5 Tốt\" gồm bao nhiêu tiêu chí?",
    "options": [
      {
        "id": "a",
        "text": "3"
      },
      {
        "id": "b",
        "text": "4"
      },
      {
        "id": "c",
        "text": "5"
      },
      {
        "id": "d",
        "text": "6"
      },
      {
        "id": "e",
        "text": "7"
      }
    ],
    "correctOptionId": "c",
    "explanation": "Gồm 5 tiêu chí"
  },
  {
    "id": "sv2-gene-22",
    "index": 22,
    "category": "general_5ss",
    "categoryName": "General / 5SS",
    "question": "Đâu KHÔNG phải là một trong 5 tiêu chí SV5T?",
    "options": [
      {
        "id": "a",
        "text": "Đạo đức tốt"
      },
      {
        "id": "b",
        "text": "Học tập tốt"
      },
      {
        "id": "c",
        "text": "Thể lực tốt"
      },
      {
        "id": "d",
        "text": "Hội nhập tốt"
      },
      {
        "id": "e",
        "text": "Gia cảnh tốt"
      }
    ],
    "correctOptionId": "e",
    "explanation": "Tiêu chí đúng: Đạo đức, Học tập, Thể lực, Tình nguyện, Hội nhập"
  },
  {
    "id": "sv2-gene-23",
    "index": 23,
    "category": "general_5ss",
    "categoryName": "General / 5SS",
    "question": "Màu áo truyền thống của Hội Sinh viên Việt Nam là màu gì?",
    "options": [
      {
        "id": "a",
        "text": "Đỏ"
      },
      {
        "id": "b",
        "text": "Xanh lá"
      },
      {
        "id": "c",
        "text": "Xanh dương"
      },
      {
        "id": "d",
        "text": "Trắng"
      },
      {
        "id": "e",
        "text": "Cam"
      }
    ],
    "correctOptionId": "c",
    "explanation": "Màu xanh dương đậm (xanh thanh niên/sinh viên)"
  },
  {
    "id": "sv2-gene-24",
    "index": 24,
    "category": "general_5ss",
    "categoryName": "General / 5SS",
    "question": "Ngày truyền thống Học sinh - Sinh viên Việt Nam là ngày nào?",
    "options": [
      {
        "id": "a",
        "text": "09/01"
      },
      {
        "id": "b",
        "text": "26/03"
      },
      {
        "id": "c",
        "text": "15/10"
      },
      {
        "id": "d",
        "text": "20/11"
      },
      {
        "id": "e",
        "text": "30/04"
      }
    ],
    "correctOptionId": "a",
    "explanation": "Ngày 9 tháng 1 hàng năm"
  },
  {
    "id": "sv2-gene-25",
    "index": 25,
    "category": "general_5ss",
    "categoryName": "General / 5SS",
    "question": "5SS là viết tắt đại diện cho phong trào nào?",
    "options": [
      {
        "id": "a",
        "text": "Sinh viên 5 Sao"
      },
      {
        "id": "b",
        "text": "Sinh viên 5 Tốt"
      },
      {
        "id": "c",
        "text": "Sinh viên Sáng tạo"
      },
      {
        "id": "d",
        "text": "Sinh viên Sẵn sàng"
      },
      {
        "id": "e",
        "text": "Sống Sạch Sành Sỏi"
      }
    ],
    "correctOptionId": "b",
    "explanation": "5SS = 5-Skill/5-Standard Students (Sinh viên 5 Tốt)"
  },
  {
    "id": "sv2-patt-26",
    "index": 26,
    "category": "pattern_sequence",
    "categoryName": "Pattern / Sequence",
    "question": "2, 4, 8, 16, ?",
    "options": [
      {
        "id": "a",
        "text": "20"
      },
      {
        "id": "b",
        "text": "24"
      },
      {
        "id": "c",
        "text": "30"
      },
      {
        "id": "d",
        "text": "32"
      },
      {
        "id": "e",
        "text": "64"
      }
    ],
    "correctOptionId": "d",
    "explanation": "Quy luật nhân 2 (x2)"
  },
  {
    "id": "sv2-patt-27",
    "index": 27,
    "category": "pattern_sequence",
    "categoryName": "Pattern / Sequence",
    "question": "100, 90, 80, 70, ?",
    "options": [
      {
        "id": "a",
        "text": "50"
      },
      {
        "id": "b",
        "text": "60"
      },
      {
        "id": "c",
        "text": "65"
      },
      {
        "id": "d",
        "text": "75"
      },
      {
        "id": "e",
        "text": "85"
      }
    ],
    "correctOptionId": "b",
    "explanation": "Quy luật trừ 10 (-10)"
  },
  {
    "id": "sv2-patt-28",
    "index": 28,
    "category": "pattern_sequence",
    "categoryName": "Pattern / Sequence",
    "question": "B, D, F, H, ?",
    "options": [
      {
        "id": "a",
        "text": "I"
      },
      {
        "id": "b",
        "text": "J"
      },
      {
        "id": "c",
        "text": "K"
      },
      {
        "id": "d",
        "text": "L"
      },
      {
        "id": "e",
        "text": "M"
      }
    ],
    "correctOptionId": "b",
    "explanation": "Bỏ qua 1 chữ cái trong bảng alphabet"
  },
  {
    "id": "sv2-patt-29",
    "index": 29,
    "category": "pattern_sequence",
    "categoryName": "Pattern / Sequence",
    "question": "1, 8, 27, 64, ?",
    "options": [
      {
        "id": "a",
        "text": "81"
      },
      {
        "id": "b",
        "text": "100"
      },
      {
        "id": "c",
        "text": "121"
      },
      {
        "id": "d",
        "text": "125"
      },
      {
        "id": "e",
        "text": "144"
      }
    ],
    "correctOptionId": "d",
    "explanation": "Dãy lập phương (1^3, 2^3, 3^3, 4^3, 5^3)"
  },
  {
    "id": "sv2-patt-30",
    "index": 30,
    "category": "pattern_sequence",
    "categoryName": "Pattern / Sequence",
    "question": "3, 5, 8, 12, ?",
    "options": [
      {
        "id": "a",
        "text": "15"
      },
      {
        "id": "b",
        "text": "16"
      },
      {
        "id": "c",
        "text": "17"
      },
      {
        "id": "d",
        "text": "18"
      },
      {
        "id": "e",
        "text": "19"
      }
    ],
    "correctOptionId": "c",
    "explanation": "Khoảng cách tăng dần: +2, +3, +4, +5"
  },
  {
    "id": "sv2-visu-31",
    "index": 31,
    "category": "visual_precision",
    "categoryName": "Visual Precision",
    "question": "Tìm từ viết sai chính tả:",
    "options": [
      {
        "id": "a",
        "text": "Gọn gàng"
      },
      {
        "id": "b",
        "text": "Sạch sẽ"
      },
      {
        "id": "c",
        "text": "Suất xắc"
      },
      {
        "id": "d",
        "text": "Chăm chỉ"
      },
      {
        "id": "e",
        "text": "Nhanh nhẹn"
      }
    ],
    "correctOptionId": "c",
    "explanation": "Viết đúng phải là \"Xuất sắc\""
  },
  {
    "id": "sv2-visu-32",
    "index": 32,
    "category": "visual_precision",
    "categoryName": "Visual Precision",
    "question": "Tìm nhóm số chẵn lạc loài:",
    "options": [
      {
        "id": "a",
        "text": "1357"
      },
      {
        "id": "b",
        "text": "7531"
      },
      {
        "id": "c",
        "text": "1367"
      },
      {
        "id": "d",
        "text": "3175"
      },
      {
        "id": "e",
        "text": "5713"
      }
    ],
    "correctOptionId": "c",
    "explanation": "Chứa số chẵn 6, các phương án khác toàn số lẻ"
  },
  {
    "id": "sv2-visu-33",
    "index": 33,
    "category": "visual_precision",
    "categoryName": "Visual Precision",
    "question": "Tìm ký hiệu khác biệt nhất:",
    "options": [
      {
        "id": "a",
        "text": "♠"
      },
      {
        "id": "b",
        "text": "♣"
      },
      {
        "id": "c",
        "text": "♥"
      },
      {
        "id": "d",
        "text": "♦"
      },
      {
        "id": "e",
        "text": "♞"
      }
    ],
    "correctOptionId": "e",
    "explanation": "Quân cờ (♞), còn lại là chất bài tây"
  },
  {
    "id": "sv2-visu-34",
    "index": 34,
    "category": "visual_precision",
    "categoryName": "Visual Precision",
    "question": "Cặp từ nào KHÔNG phải từ trái nghĩa?",
    "options": [
      {
        "id": "a",
        "text": "Lên - Xuống"
      },
      {
        "id": "b",
        "text": "Ra - Vào"
      },
      {
        "id": "c",
        "text": "Trong - Ngoài"
      },
      {
        "id": "d",
        "text": "Đi - Chạy"
      },
      {
        "id": "e",
        "text": "Sáng - Tối"
      }
    ],
    "correctOptionId": "d",
    "explanation": "Đi - Chạy là từ chỉ hành động di chuyển, không trái nghĩa"
  },
  {
    "id": "sv2-visu-35",
    "index": 35,
    "category": "visual_precision",
    "categoryName": "Visual Precision",
    "question": "Tìm nhóm số bị đảo ngược quy luật:",
    "options": [
      {
        "id": "a",
        "text": "123"
      },
      {
        "id": "b",
        "text": "234"
      },
      {
        "id": "c",
        "text": "345"
      },
      {
        "id": "d",
        "text": "543"
      },
      {
        "id": "e",
        "text": "456"
      }
    ],
    "correctOptionId": "d",
    "explanation": "543 đi lùi, các nhóm khác tiến lên"
  },
  {
    "id": "sv2-quic-36",
    "index": 36,
    "category": "quick_logic",
    "categoryName": "Quick Logic",
    "question": "A chạy nhanh hơn B, B chạy nhanh hơn C. Ai chậm nhất?",
    "options": [
      {
        "id": "a",
        "text": "A"
      },
      {
        "id": "b",
        "text": "B"
      },
      {
        "id": "c",
        "text": "C"
      },
      {
        "id": "d",
        "text": "A và B"
      },
      {
        "id": "e",
        "text": "Không xác định"
      }
    ],
    "correctOptionId": "c",
    "explanation": "Thứ tự: A > B > C"
  },
  {
    "id": "sv2-quic-37",
    "index": 37,
    "category": "quick_logic",
    "categoryName": "Quick Logic",
    "question": "Hôm qua là thứ Hai, ngày mai là thứ mấy?",
    "options": [
      {
        "id": "a",
        "text": "Thứ Ba"
      },
      {
        "id": "b",
        "text": "Thứ Tư"
      },
      {
        "id": "c",
        "text": "Thứ Năm"
      },
      {
        "id": "d",
        "text": "Thứ Sáu"
      },
      {
        "id": "e",
        "text": "Thứ Bảy"
      }
    ],
    "correctOptionId": "b",
    "explanation": "Hôm qua thứ Hai -> Hôm nay thứ Ba -> Ngày mai thứ Tư"
  },
  {
    "id": "sv2-quic-38",
    "index": 38,
    "category": "quick_logic",
    "categoryName": "Quick Logic",
    "question": "Mọi loài chim đều có cánh. Đà điểu là chim. Vậy:",
    "options": [
      {
        "id": "a",
        "text": "Đà điểu biết bay"
      },
      {
        "id": "b",
        "text": "Đà điểu có cánh"
      },
      {
        "id": "c",
        "text": "Đà điểu chạy nhanh"
      },
      {
        "id": "d",
        "text": "Đà điểu to lớn"
      },
      {
        "id": "e",
        "text": "Đà điểu đẻ trứng"
      }
    ],
    "correctOptionId": "b",
    "explanation": "Suy luận tất yếu từ tiền đề"
  },
  {
    "id": "sv2-quic-39",
    "index": 39,
    "category": "quick_logic",
    "categoryName": "Quick Logic",
    "question": "Nếu học chăm thì điểm cao. Lan điểm không cao. Kết luận:",
    "options": [
      {
        "id": "a",
        "text": "Lan học rất giỏi"
      },
      {
        "id": "b",
        "text": "Lan học bình thường"
      },
      {
        "id": "c",
        "text": "Lan không học chăm"
      },
      {
        "id": "d",
        "text": "Đề thi quá khó"
      },
      {
        "id": "e",
        "text": "Lan bị ốm"
      }
    ],
    "correctOptionId": "c",
    "explanation": "Phủ định hệ quả: điểm không cao thì chắc chắn không học chăm"
  },
  {
    "id": "sv2-quic-40",
    "index": 40,
    "category": "quick_logic",
    "categoryName": "Quick Logic",
    "question": "Hộp xanh to hơn hộp đỏ, hộp đỏ to hơn hộp vàng. Hộp nào nhỏ nhất?",
    "options": [
      {
        "id": "a",
        "text": "Hộp xanh"
      },
      {
        "id": "b",
        "text": "Hộp đỏ"
      },
      {
        "id": "c",
        "text": "Hộp vàng"
      },
      {
        "id": "d",
        "text": "Cả 3 bằng nhau"
      },
      {
        "id": "e",
        "text": "Không xác định"
      }
    ],
    "correctOptionId": "c",
    "explanation": "Thứ tự từ lớn đến nhỏ: Xanh > Đỏ > Vàng"
  },
  {
    "id": "sv2-rule-41",
    "index": 41,
    "category": "rule_shift",
    "categoryName": "Rule Shift",
    "question": "Quy tắc: +2 rồi x2. Số 3 thành:",
    "options": [
      {
        "id": "a",
        "text": "8"
      },
      {
        "id": "b",
        "text": "9"
      },
      {
        "id": "c",
        "text": "10"
      },
      {
        "id": "d",
        "text": "11"
      },
      {
        "id": "e",
        "text": "12"
      }
    ],
    "correctOptionId": "c",
    "explanation": "(3+2) x 2 = 10"
  },
  {
    "id": "sv2-rule-42",
    "index": 42,
    "category": "rule_shift",
    "categoryName": "Rule Shift",
    "question": "Đổi chữ: A->B, B->C, C->D. \"CAB\" thành:",
    "options": [
      {
        "id": "a",
        "text": "DBC"
      },
      {
        "id": "b",
        "text": "BCD"
      },
      {
        "id": "c",
        "text": "CDB"
      },
      {
        "id": "d",
        "text": "BCA"
      },
      {
        "id": "e",
        "text": "ABD"
      }
    ],
    "correctOptionId": "a",
    "explanation": "C->D, A->B, B->C => DBC"
  },
  {
    "id": "sv2-rule-43",
    "index": 43,
    "category": "rule_shift",
    "categoryName": "Rule Shift",
    "question": "Gán: Đỏ=1, Xanh=2, Vàng=3. \"Đỏ Xanh\" là:",
    "options": [
      {
        "id": "a",
        "text": "11"
      },
      {
        "id": "b",
        "text": "12"
      },
      {
        "id": "c",
        "text": "21"
      },
      {
        "id": "d",
        "text": "23"
      },
      {
        "id": "e",
        "text": "31"
      }
    ],
    "correctOptionId": "b",
    "explanation": "Đỏ(1) - Xanh(2) = 12"
  },
  {
    "id": "sv2-rule-44",
    "index": 44,
    "category": "rule_shift",
    "categoryName": "Rule Shift",
    "question": "Quy ước: Chẵn chia 2, lẻ nhân 3. Số 6 thành:",
    "options": [
      {
        "id": "a",
        "text": "2"
      },
      {
        "id": "b",
        "text": "3"
      },
      {
        "id": "c",
        "text": "12"
      },
      {
        "id": "d",
        "text": "18"
      },
      {
        "id": "e",
        "text": "4"
      }
    ],
    "correctOptionId": "b",
    "explanation": "6 là số chẵn -> 6/2 = 3"
  },
  {
    "id": "sv2-rule-45",
    "index": 45,
    "category": "rule_shift",
    "categoryName": "Rule Shift",
    "question": "Đảo chữ: \"MEO\" thành:",
    "options": [
      {
        "id": "a",
        "text": "EOM"
      },
      {
        "id": "b",
        "text": "OME"
      },
      {
        "id": "c",
        "text": "MOE"
      },
      {
        "id": "d",
        "text": "OEM"
      },
      {
        "id": "e",
        "text": "EMO"
      }
    ],
    "correctOptionId": "d",
    "explanation": "Đọc ngược từ phải qua trái: O-E-M"
  },
  {
    "id": "sv2-gene-46",
    "index": 46,
    "category": "general_5ss",
    "categoryName": "General / 5SS",
    "question": "Tiêu chí \"Hội nhập tốt\" thường yêu cầu chứng chỉ gì?",
    "options": [
      {
        "id": "a",
        "text": "Lái xe"
      },
      {
        "id": "b",
        "text": "Ngoại ngữ"
      },
      {
        "id": "c",
        "text": "Bơi lội"
      },
      {
        "id": "d",
        "text": "Sơ cấp cứu"
      },
      {
        "id": "e",
        "text": "Nấu ăn"
      }
    ],
    "correctOptionId": "b",
    "explanation": "Thường yêu cầu chứng chỉ Ngoại ngữ hoặc Tin học"
  },
  {
    "id": "sv2-gene-47",
    "index": 47,
    "category": "general_5ss",
    "categoryName": "General / 5SS",
    "question": "Phong trào Sinh viên 5 Tốt do tổ chức nào phát động?",
    "options": [
      {
        "id": "a",
        "text": "Đoàn Thanh niên"
      },
      {
        "id": "b",
        "text": "Hội Sinh viên"
      },
      {
        "id": "c",
        "text": "Hội Liên hiệp Thanh niên"
      },
      {
        "id": "d",
        "text": "Đội Thiếu niên"
      },
      {
        "id": "e",
        "text": "Đảng Cộng sản"
      }
    ],
    "correctOptionId": "b",
    "explanation": "Do Hội Sinh viên Việt Nam phát động"
  },
  {
    "id": "sv2-gene-48",
    "index": 48,
    "category": "general_5ss",
    "categoryName": "General / 5SS",
    "question": "Cấp xét duyệt Sinh viên 5 Tốt cao nhất là?",
    "options": [
      {
        "id": "a",
        "text": "Cấp Chi hội"
      },
      {
        "id": "b",
        "text": "Cấp Khoa"
      },
      {
        "id": "c",
        "text": "Cấp Trường"
      },
      {
        "id": "d",
        "text": "Cấp Tỉnh/Thành"
      },
      {
        "id": "e",
        "text": "Cấp Trung ương"
      }
    ],
    "correctOptionId": "e",
    "explanation": "Cấp Trung ương là cấp cao nhất"
  },
  {
    "id": "sv2-gene-49",
    "index": 49,
    "category": "general_5ss",
    "categoryName": "General / 5SS",
    "question": "Tiêu chí \"Thể lực tốt\" có thể đạt được qua hoạt động nào?",
    "options": [
      {
        "id": "a",
        "text": "Thi học sinh giỏi"
      },
      {
        "id": "b",
        "text": "Nghiên cứu khoa học"
      },
      {
        "id": "c",
        "text": "Tham gia giải thể thao"
      },
      {
        "id": "d",
        "text": "Hiến máu nhân đạo"
      },
      {
        "id": "e",
        "text": "Thi văn nghệ"
      }
    ],
    "correctOptionId": "c",
    "explanation": "Tham gia các giải thể thao, hội thao"
  },
  {
    "id": "sv2-gene-50",
    "index": 50,
    "category": "general_5ss",
    "categoryName": "General / 5SS",
    "question": "Sinh viên 5 Tốt cấp Trung ương được nhận bằng khen của ai?",
    "options": [
      {
        "id": "a",
        "text": "Thủ tướng Chính phủ"
      },
      {
        "id": "b",
        "text": "Bộ trưởng Bộ GD&ĐT"
      },
      {
        "id": "c",
        "text": "Trung ương Hội Sinh viên"
      },
      {
        "id": "d",
        "text": "Chủ tịch nước"
      },
      {
        "id": "e",
        "text": "Bí thư thứ nhất TW Đoàn"
      }
    ],
    "correctOptionId": "c",
    "explanation": "Bằng khen của Ban Chấp hành Trung ương Hội Sinh viên Việt Nam"
  }
];

export const SOLVE_QUESTIONS_BY_ID = new Map<string, SolveQuestionV2Def>(
  SOLVE_50_QUESTIONS.map((q) => [q.id, q]),
);

export const SOLVE_QUESTIONS_BY_CATEGORY = SOLVE_CATEGORIES.reduce((acc, cat) => {
  acc[cat] = SOLVE_50_QUESTIONS.filter((q) => q.category === cat);
  return acc;
}, {} as Record<SolveCategoryId, SolveQuestionV2Def[]>);
