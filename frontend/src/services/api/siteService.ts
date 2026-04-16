import { publicApi } from './client';

export type SiteSettings = {
  site_name: string;
  logo_url: string;
  header_text: string;
  footer_text: string;
  hero_badge_text: string;
  hero_title: string;
  hero_title_highlight: string;
  hero_description: string;
  hero_cta_primary_label: string;
  hero_cta_primary_url: string;
  hero_cta_secondary_label: string;
  hero_cta_secondary_url: string;
  hero_image_url: string;
  hero_background_image_url: string;
  promo_title: string;
  promo_title_highlight: string;
  promo_description: string;
  promo_cta_label: string;
  promo_cta_url: string;
  homepage_banner_image_url: string;
  primary_color: string;
  secondary_color: string;
  button_color: string;
  link_color: string;
  background_color: string;
  footer_color: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  default_currency: 'USD' | 'BDT';
  usd_to_bdt_rate: number;
};

export const siteService = {
  async getSettings(): Promise<SiteSettings> {
    const { data } = await publicApi.get<SiteSettings>('/site/settings/');
    return data;
  },
};

