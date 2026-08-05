export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  isCompleted?: boolean;
  isLocked?: boolean;
}

export interface CourseCategory {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  lessons: Lesson[];
}

export interface CourseCategory {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export const COURSE_CATEGORIES: CourseCategory[] = [
  {
    id: "trading-foundations",
    title: "Trading Foundations",
    thumbnail: "/images/courses/trading-foundations.jpg",
    description:
      "Learn the essential concepts every trader needs before entering the financial markets.",
    lessons: [
      {
        id: "introduction-to-trading",
        title: "Introduction to Trading",
        description:
          "Understand financial markets, trading instruments, and how professional traders operate.",
        duration: "12:40",
        videoUrl: "/videos/courses/trading-foundations/introduction-to-trading.mp4",
        isCompleted: true,
      },
      {
        id: "market-structure",
        title: "Understanding Market Structure",
        description:
          "Learn how price moves through trends, consolidations, highs, and lows.",
        duration: "18:25",
        videoUrl: "/videos/courses/trading-foundations/market-structure.mp4",
      },
      {
        id: "trading-platform",
        title: "Setting Up Your Trading Platform",
        description:
          "A complete walkthrough of charts, tools, watchlists, and platform settings.",
        duration: "15:10",
        videoUrl: "/videos/courses/trading-foundations/trading-platform.mp4",
      },
      {
        id: "trading-terminology",
        title: "Important Trading Terminology",
        description:
          "Understand leverage, margin, spreads, order types, and other essential terms.",
        duration: "16:35",
        videoUrl: "/videos/courses/trading-foundations/trading-terminology.mp4",
        // isLocked: true,
      },
    ],
  },
  {
    id: "technical-analysis",
    title: "Technical Analysis",
    thumbnail: "/images/courses/trading-foundations.jpg",
    description:
      "Study charts, identify price behaviour, and build technically informed trade ideas.",
    lessons: [
      {
        id: "candlestick-basics",
        title: "Candlestick Basics",
        description:
          "Learn how candlesticks represent price movement and trader behaviour.",
        duration: "14:20",
        videoUrl: "/videos/courses/technical-analysis/candlestick-basics.mp4",
        isCompleted: true,
      },
      {
        id: "support-resistance",
        title: "Support and Resistance",
        description:
          "Identify important price levels where the market may react or reverse.",
        duration: "21:05",
        videoUrl: "/videos/courses/technical-analysis/support-resistance.mp4",
      },
      {
        id: "trend-analysis",
        title: "Trend Analysis",
        description: "Recognise bullish, bearish, and sideways market conditions.",
        duration: "17:45",
        videoUrl: "/videos/courses/technical-analysis/trend-analysis.mp4",
      },
      {
        id: "chart-patterns",
        title: "High-Probability Chart Patterns",
        description:
          "Study continuation and reversal patterns commonly seen in the market.",
        duration: "25:30",
        videoUrl: "/videos/courses/technical-analysis/chart-patterns.mp4",
        isLocked: true,
      },
    ],
  },
  {
    id: "risk-management",
    title: "Risk Management",
    thumbnail: "/images/courses/trading-foundations.jpg",
    description:
      "Protect your trading capital through position sizing, disciplined risk, and controlled exposure.",
    lessons: [
      {
        id: "risk-per-trade",
        title: "Risk Per Trade",
        description: "Learn how much capital should be risked on every individual trade.",
        duration: "13:50",
        videoUrl: "/videos/courses/risk-management/risk-per-trade.mp4",
      },
      {
        id: "position-sizing",
        title: "Position Sizing",
        description:
          "Calculate your position size based on account balance and stop-loss distance.",
        duration: "19:15",
        videoUrl: "/videos/courses/risk-management/position-sizing.mp4",
      },
      {
        id: "risk-reward",
        title: "Risk-to-Reward Ratio",
        description: "Understand how to compare potential profit against potential loss.",
        duration: "16:40",
        videoUrl: "/videos/courses/risk-management/risk-reward.mp4",
      },
    ],
  },
  {
    id: "trading-psychology",
    title: "Trading Psychology",
    thumbnail: "/images/courses/trading-foundations.jpg",
    description:
      "Develop emotional discipline, patience, confidence, and consistency as a trader.",
    lessons: [
      {
        id: "trader-mindset",
        title: "Developing a Trader's Mindset",
        description:
          "Understand the mental habits required for long-term trading consistency.",
        duration: "17:20",
        videoUrl: "/videos/courses/trading-psychology/trader-mindset.mp4",
      },
      {
        id: "fear-and-greed",
        title: "Managing Fear and Greed",
        description:
          "Recognise emotional decisions before they damage your trading performance.",
        duration: "20:10",
        videoUrl: "/videos/courses/trading-psychology/fear-and-greed.mp4",
      },
      {
        id: "trading-discipline",
        title: "Building Trading Discipline",
        description:
          "Create repeatable habits and follow your plan without unnecessary deviation.",
        duration: "18:45",
        videoUrl: "/videos/courses/trading-psychology/trading-discipline.mp4",
      },
    ],
  },
];

export function getCourseCategory(categoryId: string) {
  return COURSE_CATEGORIES.find((category) => category.id === categoryId);
}
