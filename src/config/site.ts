export const siteConfig = {
  name: 'CLB Sinh viên 5 Tốt - 5SS UET',
  shortName: '5SS UET',
  slogan: 'Hợp tác – Dẫn dắt – Tài năng – Tỏa sáng',
  description:
    'Không gian giới thiệu CLB Sinh viên 5 Tốt - 5SS UET và hành trình rèn luyện năm tiêu chí Sinh viên 5 Tốt toàn diện.',
  logoSrc: '/assets/sv5t-mark.png?v=2' as string | null,
  emailDomain: null as string | null,
  demoMode: true,
  recruitmentUrl: null as string | null,
} as const

export interface RouteNavItem {
  type: 'route'
  label: string
  href: string
}

export interface AnchorNavItem {
  type: 'anchor'
  label: string
  href: string
  hash: string
  description: string
}

/** Top-level About section navigation */
export const aboutNavigation: AnchorNavItem = {
  type: 'anchor',
  label: 'Giới thiệu',
  href: '/#gioi-thieu',
  hash: '#gioi-thieu',
  description: 'Mục tiêu, sứ mệnh & giá trị cốt lõi',
} as const

/** Primary page-level navigation (Top-level routes) */
export const primaryNavigation: readonly RouteNavItem[] = [
  { type: 'route', label: 'Hành trình 5 Tốt', href: '/hanh-trinh-5-tot' },
  { type: 'route', label: 'Hoạt động', href: '/hoat-dong' },
] as const

/** Explore dropdown navigation (Home secondary section anchors) */
export const exploreNavigation: readonly AnchorNavItem[] = [
  {
    type: 'anchor',
    label: 'FAQ',
    href: '/#faq',
    hash: '#faq',
    description: 'Giải đáp thắc mắc thường gặp',
  },
  {
    type: 'anchor',
    label: 'Liên hệ',
    href: '/#lien-he',
    hash: '#lien-he',
    description: 'Kênh kết nối và thông tin CLB',
  },
] as const

/** Full Explore list for Footer */
export const footerExploreNavigation: readonly AnchorNavItem[] = [
  aboutNavigation,
  ...exploreNavigation,
] as const

/** Action CTA on the right of the header */
export const headerCta = {
  get label(): string {
    return siteConfig.recruitmentUrl ? 'Ứng tuyển ngay' : 'Tìm hiểu thêm'
  },
  get href(): string | null {
    return siteConfig.recruitmentUrl
  },
  get isExternal(): boolean {
    return Boolean(siteConfig.recruitmentUrl)
  },
  hash: '#gioi-thieu',
} as const

export interface BreadcrumbItem {
  label: string
  href?: string
}

export const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  '/hanh-trinh-5-tot': [
    { label: 'Trang chủ', href: '/' },
    { label: 'Hành trình 5 Tốt' },
  ],
  '/hoat-dong': [
    { label: 'Trang chủ', href: '/' },
    { label: 'Hoạt động' },
  ],
}
