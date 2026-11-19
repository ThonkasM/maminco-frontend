import Link from 'next/link'
import { SectionHeading } from './SectionHeading'
import { WoodBackground } from './WoodBackground'
import { LEGAL_DOCUMENTS, type LegalDocument } from './legal/legal-content'

export function LegalPage({ document }: { document: LegalDocument }) {
  const other = LEGAL_DOCUMENTS.find((item) => item.slug !== document.slug)

  return (
    <>
      <section className="dark relative isolate overflow-hidden border-b-4 border-brand-leaf bg-wood text-foreground">
        <WoodBackground className="absolute inset-0 -z-20" />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/60 to-black/25"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-36">
          <SectionHeading
            eyebrow={document.eyebrow}
            title={document.title}
            description={`Versión ${document.version} · Actualizado el ${document.updatedAt}`}
          />
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[16rem_1fr]">
          <nav aria-label="Contenido" className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Contenido
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {document.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-foreground/80 transition-colors hover:text-primary-ink"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <article className="max-w-3xl">
            <p className="text-pretty text-lg text-muted-foreground">{document.intro}</p>

            {document.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28 pt-10">
                <h2 className="text-balance text-2xl font-semibold tracking-[-0.02em]">
                  {section.title}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
                {section.items && (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground marker:text-primary-ink">
                    {section.items.map((item) => (
                      <li key={item} className="text-pretty leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {other && (
              <p className="mt-14 border-t border-border pt-6 text-sm text-muted-foreground">
                Consulta también nuestra{' '}
                <Link
                  href={`/${other.slug}`}
                  className="font-medium text-primary-ink underline-offset-4 hover:underline"
                >
                  {other.title.toLowerCase()}
                </Link>
                .
              </p>
            )}
          </article>
        </div>
      </section>
    </>
  )
}
