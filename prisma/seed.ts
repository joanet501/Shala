import { PrismaClient, FormatType } from "../src/generated/prisma";

const prisma = new PrismaClient();

const platformTemplates = [
  {
    name: "2-Day Intensive",
    formatType: FormatType.MULTI_DAY,
    defaultSessions: [
      { dayOffset: 0, startTime: "18:00", endTime: "20:00", label: "Day 1 — Evening Session" },
      { dayOffset: 1, startTime: "07:00", endTime: "11:00", label: "Day 2 — Morning Session" },
      { dayOffset: 1, startTime: "16:00", endTime: "19:00", label: "Day 2 — Afternoon Session" },
      { dayOffset: 2, startTime: "07:00", endTime: "11:00", label: "Day 3 — Morning Session" },
    ],
    defaultCapacity: 20,
    defaultNotes: "Please arrive 15 minutes before each session.",
    defaultWhatToBring:
      "Comfortable loose clothing (no tight or synthetic fabrics), a small towel, and a water bottle. Please avoid heavy meals 2-3 hours before the session.",
    defaultPreparation:
      "Avoid consuming caffeine on program days. Wear comfortable, loose-fitting clothes. Remove all jewelry and accessories before the session.",
  },
  {
    name: "3-Day Intensive",
    formatType: FormatType.MULTI_DAY,
    defaultSessions: [
      { dayOffset: 0, startTime: "18:00", endTime: "20:00", label: "Day 1 — Evening Session" },
      { dayOffset: 1, startTime: "07:00", endTime: "11:00", label: "Day 2 — Morning Session" },
      { dayOffset: 1, startTime: "16:00", endTime: "19:00", label: "Day 2 — Afternoon Session" },
      { dayOffset: 2, startTime: "07:00", endTime: "11:00", label: "Day 3 — Morning Session" },
      { dayOffset: 2, startTime: "16:00", endTime: "18:00", label: "Day 3 — Afternoon Session" },
    ],
    defaultCapacity: 20,
    defaultNotes: "Please arrive 15 minutes before each session.",
    defaultWhatToBring:
      "Comfortable loose clothing (no tight or synthetic fabrics), a small towel, and a water bottle. Please avoid heavy meals 2-3 hours before the session.",
    defaultPreparation:
      "Avoid consuming caffeine on program days. Wear comfortable, loose-fitting clothes. Remove all jewelry and accessories before the session.",
  },
  {
    name: "Single Day Workshop",
    formatType: FormatType.SINGLE_DAY,
    defaultSessions: [
      { dayOffset: 0, startTime: "07:00", endTime: "12:00", label: "Workshop" },
    ],
    defaultCapacity: 25,
    defaultNotes: "Please arrive 15 minutes before the session.",
    defaultWhatToBring:
      "Comfortable loose clothing, a small towel, and a water bottle.",
    defaultPreparation:
      "Avoid heavy meals 2-3 hours before the session. Wear comfortable, loose-fitting clothes.",
  },
  {
    name: "Half Day Session",
    formatType: FormatType.HALF_DAY,
    defaultSessions: [
      { dayOffset: 0, startTime: "09:00", endTime: "12:00", label: "Session" },
    ],
    defaultCapacity: 30,
    defaultNotes: null,
    defaultWhatToBring: "Comfortable loose clothing and a water bottle.",
    defaultPreparation: "Avoid heavy meals 2 hours before the session.",
  },
  {
    name: "Free Offering",
    formatType: FormatType.FREE_OFFERING,
    defaultSessions: [
      { dayOffset: 0, startTime: "07:00", endTime: "08:30", label: "Session" },
    ],
    defaultCapacity: null, // unlimited
    defaultNotes: "This is a free offering. No prior experience required.",
    defaultWhatToBring: "Comfortable clothing.",
    defaultPreparation: null,
  },
  {
    name: "Online Program (Multi-Day)",
    formatType: FormatType.ONLINE_MULTI_DAY,
    defaultSessions: [
      { dayOffset: 0, startTime: "18:00", endTime: "20:00", label: "Day 1 — Evening Session" },
      { dayOffset: 1, startTime: "07:00", endTime: "10:00", label: "Day 2 — Morning Session" },
      { dayOffset: 1, startTime: "17:00", endTime: "19:00", label: "Day 2 — Afternoon Session" },
      { dayOffset: 2, startTime: "07:00", endTime: "10:00", label: "Day 3 — Morning Session" },
    ],
    defaultCapacity: 30,
    defaultNotes:
      "This is an online program. You will receive a meeting link after registration. Please ensure you have a stable internet connection and a quiet, private space where you can practice comfortably.",
    defaultWhatToBring:
      "Comfortable loose clothing, a yoga mat or soft surface, a small towel, and water.",
    defaultPreparation:
      "Set up your space before the session: you need enough room to lie down with arms extended. Test your camera and microphone. Avoid heavy meals 2-3 hours before.",
  },
  {
    name: "Online Session (Single)",
    formatType: FormatType.ONLINE_SESSION,
    defaultSessions: [
      { dayOffset: 0, startTime: "07:00", endTime: "09:00", label: "Online Session" },
    ],
    defaultCapacity: 50,
    defaultNotes:
      "This is an online session. Meeting link will be shared after registration.",
    defaultWhatToBring: "Comfortable clothing, a mat or soft surface, water.",
    defaultPreparation: "Ensure you have a quiet, private space and stable internet.",
  },
  {
    name: "Correction Session",
    formatType: FormatType.CORRECTION,
    defaultSessions: [
      { dayOffset: 0, startTime: "07:00", endTime: "09:00", label: "Correction Session" },
    ],
    defaultCapacity: 15,
    defaultNotes:
      "This session is for practitioners who have already been initiated into this practice. Please bring your practice as you remember it — the teacher will observe and correct.",
    defaultWhatToBring: "Comfortable loose clothing, a small towel, and water.",
    defaultPreparation: "Practice the kriya/asanas at least once before attending so the teacher can observe your current form.",
  },
];

async function main() {
  console.log("Seeding platform schedule templates...");

  for (const template of platformTemplates) {
    await prisma.scheduleTemplate.upsert({
      where: {
        id: undefined, // force create
      },
      update: {},
      create: {
        name: template.name,
        formatType: template.formatType,
        defaultSessions: template.defaultSessions,
        defaultCapacity: template.defaultCapacity,
        defaultNotes: template.defaultNotes,
        defaultWhatToBring: template.defaultWhatToBring,
        defaultPreparation: template.defaultPreparation,
        isPlatformTemplate: true,
        // teacherId is null = platform-level template
      },
    });
  }

  console.log(`Seeded ${platformTemplates.length} platform templates.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
