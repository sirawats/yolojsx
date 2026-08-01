import { Avatar, Tag } from "antd";
import icon from "./favicon.svg";

export const RTIFACT = {
  title: "Field Notes — Creative Infrastructure",
  icon,
};

const resetQuestions = [
  "What became clearer because we made something?",
  "Which decision is silently blocking several others?",
  "What can we leave ready for our future selves?",
];

export default function Editorial() {
  return (
    <>
      <header className="border-b border-border px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <a
            className="font-serif text-2xl font-semibold tracking-tight"
            href="#story"
          >
            Field Notes
          </a>
          <nav
            aria-label="Article sections"
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground"
          >
            <a href="#return-path">Return path</a>
            <a href="#weekly-reset">Weekly reset</a>
            <a href="#ordinary-quality">Ordinary quality</a>
          </nav>
        </div>
      </header>

      <main id="story">
        <article className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:py-20">
          <header className="max-w-4xl">
            <div className="mb-6 flex flex-wrap gap-2">
              <Tag color="green">Design practice</Tag>
              <Tag>8 minute read</Tag>
            </div>
            <h1 className="max-w-4xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              The quiet infrastructure behind good creative work
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-8 text-muted-foreground sm:text-2xl sm:leading-9">
              A field guide to building rituals, rooms, and tools that make
              ambitious work feel less dramatic—and more repeatable.
            </p>
            <address className="mt-8 flex items-center gap-4 not-italic">
              <Avatar size="large">AM</Avatar>
              <div>
                <strong className="block">Arun M.</strong>
                <span className="text-sm text-muted-foreground">
                  Bangkok · <time dateTime="2026-07-22">July 22, 2026</time>
                </span>
              </div>
            </address>
          </header>

          <figure className="my-10 overflow-hidden rounded-lg bg-code sm:my-12">
            <div
              aria-hidden="true"
              className="grid min-h-64 place-items-center bg-[radial-gradient(circle_at_30%_30%,var(--primary),transparent_35%),linear-gradient(135deg,var(--card),var(--code))] text-7xl sm:min-h-80 sm:text-8xl"
            >
              ✦
            </div>
            <figcaption className="px-5 py-4 text-sm">
              A system should make the next useful action obvious, not merely
              possible.
            </figcaption>
          </figure>

          <div className="mx-auto max-w-[68ch] text-lg leading-8">
            <aside
              aria-labelledby="reading-guide"
              className="mb-12 border-y border-border py-6"
            >
              <h2
                id="reading-guide"
                className="font-sans text-sm font-semibold uppercase tracking-widest text-muted-foreground"
              >
                The idea in brief
              </h2>
              <p className="mt-3 text-xl leading-8">
                Creative momentum depends less on constant inspiration than on a
                clear way to resume: visible decisions, small rituals, and an
                obvious next step.
              </p>
            </aside>

            <p>
              Most creative teams do not suffer from a shortage of ideas. They
              suffer from friction in the distance between an idea and the first
              honest attempt. Files have no home. Decisions evaporate into chat.
              Review arrives late and dressed as surprise.
            </p>

            <section aria-labelledby="return-path" className="mt-12">
              <h2 id="return-path" className="font-serif text-3xl sm:text-4xl">
                Design the return path
              </h2>
              <p className="mt-5">
                The best systems are not optimized for the inspired Tuesday
                morning. They are designed for Thursday afternoon, when
                attention is fragmented and the work must still be resumed
                without ceremony.
              </p>
              <blockquote className="my-10 font-serif text-2xl leading-snug sm:text-3xl">
                <p>
                  “A useful ritual preserves context long enough for courage to
                  return.”
                </p>
              </blockquote>
              <p>
                That means leaving evidence: a named next step, a visible
                constraint, a prototype rough enough to invite change. Momentum
                is often less about moving quickly than reducing the cost of
                beginning again.
              </p>
            </section>

            <section
              aria-labelledby="weekly-reset"
              className="my-12 rounded-lg border border-border bg-card p-6 shadow-card sm:p-8"
            >
              <h2 id="weekly-reset" className="font-serif text-2xl sm:text-3xl">
                Three questions for a weekly reset
              </h2>
              <ol className="mt-5 grid list-decimal gap-4 pl-6">
                {resetQuestions.map((question) => (
                  <li key={question} className="pl-1">
                    {question}
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="ordinary-quality" className="mt-12">
              <h2
                id="ordinary-quality"
                className="font-serif text-3xl sm:text-4xl"
              >
                Make quality ordinary
              </h2>
              <p className="mt-5">
                Craft becomes durable when the environment carries part of the
                cognitive load. Templates remember the boring essentials. Shared
                language shortens critique. Small deadlines turn taste into
                observable decisions.
              </p>
            </section>

            <footer className="mt-12 grid gap-6 border-t border-border pt-7 text-base sm:grid-cols-2">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Filed under
                </h2>
                <p className="mt-2">Systems, teams, creative practice</p>
              </div>
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Continue reading
                </h2>
                <p className="mt-2">
                  The case for deliberately unfinished prototypes
                </p>
              </div>
            </footer>
          </div>
        </article>
      </main>
    </>
  );
}
