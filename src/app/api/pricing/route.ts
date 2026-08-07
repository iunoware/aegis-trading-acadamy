import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequiredSuperAdmin } from "@/lib/current-user";

type PricingPlanPayload = {
  id: "monthly" | "yearly";
  name: string;
  price: number;
  billingCycle: "Monthly" | "Yearly";
  badge: "Popular" | "Best Value" | "Recommended" | "None";
  status: boolean;
  description: string;
  features: {
    id?: string;
    text: string;
  }[];
};

type PricingPayload = {
  monthly: PricingPlanPayload;
  yearly: PricingPlanPayload;
};

const planTypeMap = {
  monthly: "MONTHLY",
  yearly: "YEARLY",
} as const;

const badgeToDatabaseMap = {
  Popular: "POPULAR",
  "Best Value": "BEST_VALUE",
  Recommended: "RECOMMENDED",
  None: "NONE",
} as const;

const badgeToFrontendMap = {
  POPULAR: "Popular",
  BEST_VALUE: "Best Value",
  RECOMMENDED: "Recommended",
  NONE: "None",
} as const;

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        deletedAt: null,
        type: {
          in: ["MONTHLY", "YEARLY"],
        },
      },
      include: {
        features: {
          where: {
            active: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    const monthlyPlan = plans.find((plan) => plan.type === "MONTHLY");
    const yearlyPlan = plans.find((plan) => plan.type === "YEARLY");

    const pricing = {
      monthly: monthlyPlan ? formatPlan(monthlyPlan) : null,
      yearly: yearlyPlan ? formatPlan(yearlyPlan) : null,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Pricing plans fetched successfully.",
        data: pricing,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/pricing error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch pricing plans.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await getRequiredSuperAdmin();

    const body = (await request.json()) as Partial<PricingPayload>;

    const monthly = body.monthly;
    const yearly = body.yearly;

    if (!monthly || !yearly) {
      return NextResponse.json(
        {
          success: false,
          message: "Monthly and yearly plans are required.",
        },
        { status: 400 },
      );
    }

    const monthlyValidationError = validatePlan(monthly);
    const yearlyValidationError = validatePlan(yearly);

    if (monthlyValidationError) {
      return NextResponse.json(
        {
          success: false,
          message: `Monthly plan: ${monthlyValidationError}`,
        },
        { status: 400 },
      );
    }

    if (yearlyValidationError) {
      return NextResponse.json(
        {
          success: false,
          message: `Yearly plan: ${yearlyValidationError}`,
        },
        { status: 400 },
      );
    }

    const updatedPlans = await prisma.$transaction(async (tx) => {
      const monthlyPlan = await upsertPlan(tx, monthly, 1);
      const yearlyPlan = await upsertPlan(tx, yearly, 2);

      return {
        monthly: monthlyPlan,
        yearly: yearlyPlan,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Pricing plans updated successfully.",
        data: {
          monthly: formatPlan(updatedPlans.monthly),
          yearly: formatPlan(updatedPlans.yearly),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PUT /api/pricing error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update pricing plans.",
      },
      { status: 500 },
    );
  }
}

function validatePlan(plan: PricingPlanPayload): string | null {
  if (!plan.id || !["monthly", "yearly"].includes(plan.id)) {
    return "Invalid plan ID.";
  }

  if (!plan.name?.trim()) {
    return "Plan name is required.";
  }

  if (typeof plan.price !== "number" || !Number.isFinite(plan.price) || plan.price < 0) {
    return "Price must be a valid positive number.";
  }

  if (!plan.description?.trim()) {
    return "Description is required.";
  }

  if (!Array.isArray(plan.features)) {
    return "Features must be an array.";
  }

  const hasEmptyFeature = plan.features.some((feature) => !feature.text?.trim());

  if (hasEmptyFeature) {
    return "Feature text cannot be empty.";
  }

  return null;
}

async function upsertPlan(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  plan: PricingPlanPayload,
  displayOrder: number,
) {
  const planType = planTypeMap[plan.id];
  const badge = badgeToDatabaseMap[plan.badge];

  const subscriptionPlan = await tx.subscriptionPlan.upsert({
    where: {
      type: planType,
    },
    create: {
      type: planType,
      name: plan.name.trim(),
      description: plan.description.trim(),
      price: plan.price,
      currency: "USD",
      durationMonths: plan.id === "monthly" ? 1 : 12,
      badge,
      active: plan.status,
      displayOrder,
    },
    update: {
      name: plan.name.trim(),
      description: plan.description.trim(),
      price: plan.price,
      currency: "USD",
      durationMonths: plan.id === "monthly" ? 1 : 12,
      badge,
      active: plan.status,
      displayOrder,
      deletedAt: null,
      deletedById: null,
    },
  });

  /*
   * Replace the existing feature list with the latest frontend list.
   * This also preserves the exact order selected in the admin panel.
   */
  await tx.planFeature.deleteMany({
    where: {
      planId: subscriptionPlan.id,
    },
  });

  if (plan.features.length > 0) {
    await tx.planFeature.createMany({
      data: plan.features.map((feature, index) => ({
        planId: subscriptionPlan.id,
        text: feature.text.trim(),
        displayOrder: index,
        active: true,
      })),
    });
  }

  return tx.subscriptionPlan.findUniqueOrThrow({
    where: {
      id: subscriptionPlan.id,
    },
    include: {
      features: {
        where: {
          active: true,
        },
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
  });
}

function formatPlan(plan: {
  id: string;
  type: "MONTHLY" | "YEARLY";
  name: string;
  description: string | null;
  price: unknown;
  badge: "POPULAR" | "BEST_VALUE" | "RECOMMENDED" | "NONE";
  active: boolean;
  features: {
    id: string;
    text: string;
  }[];
}) {
  const isMonthly = plan.type === "MONTHLY";

  return {
    id: isMonthly ? "monthly" : "yearly",
    databaseId: plan.id,
    name: plan.name,
    price: Number(plan.price),
    billingCycle: isMonthly ? "Monthly" : "Yearly",
    badge: badgeToFrontendMap[plan.badge],
    status: plan.active,
    description: plan.description ?? "",
    features: plan.features.map((feature) => ({
      id: feature.id,
      text: feature.text,
    })),
  };
}
