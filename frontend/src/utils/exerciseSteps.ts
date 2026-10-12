export interface ExerciseStep {
  title: string;
  body: string;
  seconds: number;
}

export const EXERCISE_STEPS: Record<string, ExerciseStep[]> = {
  five_four_three_two_one: [
    { title: "5 things you can see", body: "Look around slowly. Name five things you can see, out loud or in your head.", seconds: 40 },
    { title: "4 things you can touch", body: "Notice four things you can feel: the floor, your clothes, the air.", seconds: 35 },
    { title: "3 things you can hear", body: "Listen for three sounds, near or far.", seconds: 30 },
    { title: "2 things you can smell", body: "Notice two smells, or two things you'd expect to smell.", seconds: 25 },
    { title: "1 thing you can taste", body: "Notice one taste, even if it's just the inside of your mouth.", seconds: 20 },
    { title: "Take a breath", body: "You're here, right now. That's enough for this moment.", seconds: 20 },
  ],
  sensory_grounding: [
    { title: "Feel your feet", body: "Press your feet flat into the floor. Notice the surface underneath you.", seconds: 30 },
    { title: "Notice touch", body: "Touch something nearby — a sleeve, a table, your own hands. Notice the texture.", seconds: 30 },
    { title: "Notice sound", body: "Pick one sound and follow it for a few seconds.", seconds: 30 },
    { title: "Loosen your shoulders", body: "Roll your shoulders back once, slowly. Let your jaw unclench.", seconds: 30 },
    { title: "One slow breath", body: "Take one slow breath in, and let it out longer than it came in.", seconds: 20 },
  ],
  positive_reflection: [
    { title: "One okay thing", body: "Think of one small thing, however minor, that felt okay today.", seconds: 40 },
    { title: "A kind sentence", body: "Say one kind, honest sentence to yourself, the way you would to a friend.", seconds: 40 },
    { title: "Someone you trust", body: "If it feels right, consider reaching out to someone — even a short message counts.", seconds: 30 },
  ],
  gentle_movement: [
    { title: "Roll your shoulders", body: "Slowly roll your shoulders back five times.", seconds: 30 },
    { title: "Stretch your neck", body: "Gently tilt your head side to side, holding each side for a few seconds.", seconds: 30 },
    { title: "Loosen your hands", body: "Open and close your hands a few times, then shake them out.", seconds: 25 },
    { title: "Stand and stretch", body: "If you can, stand up and reach your arms up, then let them fall.", seconds: 35 },
    { title: "Settle", body: "Let your breathing slow down before you move on.", seconds: 20 },
  ],
  guided_check_in: [
    { title: "How's your day?", body: "In a sentence or two, how has today been?", seconds: 30 },
    { title: "What's on your mind?", body: "Is there anything, big or small, taking up space right now?", seconds: 30 },
    { title: "Your body", body: "Take a moment to notice: are you tense, tired, or okay?", seconds: 25 },
  ],
};
