import { ToneOfVoice } from './types';

export const TONE_OPTIONS: ToneOfVoice[] = [
  ToneOfVoice.Professional,
  ToneOfVoice.Friendly,
  ToneOfVoice.Urgent,
  ToneOfVoice.Informative,
  ToneOfVoice.Playful,
];

export const SAMPLE_PROMPTS = [
  {
    goal: "Launch our new eco-friendly coffee subscription box.",
    audience: "Young professionals (25-35) who are environmentally conscious and active on social media.",
    message: "We're launching a new subscription box! It features ethically sourced, single-origin coffee beans with 100% compostable packaging. First-time subscribers get a free reusable travel mug. We want to emphasize sustainability and quality.",
    tone: ToneOfVoice.Friendly,
  },
  {
    goal: "Announce a 48-hour flash sale for our online clothing store.",
    audience: "Previous customers and email subscribers who have shown interest in women's fashion.",
    message: "It's a flash sale! Everything on the site is 30% off for the next 48 hours only. We want to create a sense of urgency and drive immediate sales. Mention the code FLASH30 at checkout.",
    tone: ToneOfVoice.Urgent,
  },
  {
    goal: "Send a final reminder for an upcoming webinar on digital marketing.",
    audience: "Professionals who registered for the webinar but haven't attended one of our events before.",
    message: "This is a final reminder that our webinar 'The Future of SEO' is happening tomorrow at 2 PM EST. We will cover topics like AI in search, voice search optimization, and link-building strategies for 2024. Don't miss out on these valuable insights.",
    tone: ToneOfVoice.Informative,
  },
  {
    goal: "Promote our new mobile game, 'Galaxy Raiders'.",
    audience: "Gamers aged 16-25 who enjoy sci-fi and strategy games.",
    message: "Get ready for an adventure! Our new game, Galaxy Raiders, is now available for download on iOS and Android. Build your fleet, battle aliens, and conquer the galaxy. We want the email to be exciting and fun, with a clear link to download the game.",
    tone: ToneOfVoice.Playful,
  },
];
