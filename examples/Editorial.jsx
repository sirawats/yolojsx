import { Avatar, Card, Divider, Tag } from "antd";

export default function Editorial() {
  return (
    <main>
      <header className="border-b border-border px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <strong className="font-serif text-2xl tracking-tight">
            Field Notes
          </strong>
          <nav className="flex gap-5 text-sm text-muted-foreground">
            <a href="#story">Stories</a>
            <a href="#dispatch">Dispatches</a>
            <a href="#about">About</a>
          </nav>
        </div>
      </header>

      <article id="story" className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
        <div className="mb-8 flex flex-wrap gap-2">
          <Tag color="green">Design practice</Tag>
          <Tag>8 minute read</Tag>
        </div>
        <h1 className="mb-6 max-w-4xl font-serif text-5xl leading-[1.05] lg:text-7xl">
          The quiet infrastructure behind good creative work
        </h1>
        <p className="max-w-3xl text-xl leading-9 text-muted-foreground">
          A field guide to building rituals, rooms, and tools that make
          ambitious work feel less dramatic—and more repeatable.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Avatar size="large">AM</Avatar>
          <div>
            <strong>Arun M.</strong>
            <div className="text-sm text-muted-foreground">
              Bangkok · July 22, 2026
            </div>
          </div>
        </div>

        <figure className="my-12 overflow-hidden rounded-2xl bg-code">
          <div className="grid min-h-80 place-items-center bg-[radial-gradient(circle_at_30%_30%,var(--primary),transparent_35%),linear-gradient(135deg,var(--card),var(--code))] text-8xl">
            ✦
          </div>
          <figcaption className="px-5 py-3 text-sm">
            A system should make the next useful action obvious, not merely
            possible.
          </figcaption>
        </figure>

        <div className="mx-auto max-w-3xl">
          <p className="text-lg leading-9">
            <span className="float-left mr-3 font-serif text-7xl leading-[0.8] text-primary">
              M
            </span>
            ost creative teams do not suffer from a shortage of ideas. They
            suffer from friction in the distance between an idea and the first
            honest attempt. Files have no home. Decisions evaporate into chat.
            Review arrives late and dressed as surprise.
          </p>
          <h2 className="mt-12 font-serif">Design the return path</h2>
          <p className="text-lg leading-9">
            The best systems are not optimized for the inspired Tuesday morning.
            They are designed for Thursday afternoon, when attention is
            fragmented and the work must still be resumed without ceremony.
          </p>
          <blockquote className="my-10 border-l-0 px-6 text-center font-serif text-3xl leading-snug">
            “A useful ritual preserves context long enough for courage to
            return.”
          </blockquote>
          <p className="text-lg leading-9">
            That means leaving evidence: a named next step, a visible
            constraint, a prototype rough enough to invite change. Momentum is
            often less about moving quickly than reducing the cost of beginning
            again.
          </p>

          <Card className="my-10" title="Three questions for a weekly reset">
            <ol className="grid gap-4 pl-5 text-lg">
              <li>What became clearer because we made something?</li>
              <li>Which decision is silently blocking several others?</li>
              <li>What can we leave ready for our future selves?</li>
            </ol>
          </Card>

          <h2 className="mt-12 font-serif">Make quality ordinary</h2>
          <p className="text-lg leading-9">
            Craft becomes durable when the environment carries part of the
            cognitive load. Templates remember the boring essentials. Shared
            language shortens critique. Small deadlines turn taste into
            observable decisions.
          </p>
          <Divider />
          <div className="grid gap-5 py-4 sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Filed under
              </div>
              <div className="mt-2">Systems, teams, creative practice</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Next dispatch
              </div>
              <div className="mt-2">
                The case for deliberately unfinished prototypes →
              </div>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
