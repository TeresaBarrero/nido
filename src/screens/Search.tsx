import { useMemo } from 'react';
import { useApp } from '../app/AppState';
import { Button } from '../components/Button';
import { Chip, ChipRow } from '../components/Chip';
import { Icon } from '../components/Icon';
import { ProductCard } from '../components/ProductCard';
import { SectionBadge } from '../components/SectionTile';
import { TabBar } from '../components/TabBar';
import { DISTANCES, SECTIONS, sectionByName, STAGES, stageLabel } from '../data/catalog';
import { useListings } from '../data/listings';
import { ProductCardSkeleton } from '../components/ProductCard';
import { LoadError } from '../components/LoadState';
import styles from './Search.module.css';

export function Search() {
  const { filters: f, setFilters, alerts, toggleAlert, toast } = useApp();
  const section = f.section ? sectionByName(f.section) : null;
  const set = (patch: Partial<typeof f>) => setFilters((prev) => ({ ...prev, ...patch }));
  const { data: listings, loading, error, reload } = useListings();

  const results = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return listings.filter((p) =>
      p.distanceKm <= f.dist &&
      (!f.stage || p.stages.includes(f.stage)) &&
      (!f.section || p.section === f.section) &&
      (!f.sub || p.subcategory === f.sub) &&
      (!f.spec || p.specValue === f.spec) &&
      (!f.onlyNew || p.isNew) &&
      (!f.lots || p.lotCount) &&
      (!f.verified || p.seller.verified) &&
      (!q || `${p.title} ${p.section} ${p.subcategory}`.toLowerCase().includes(q)),
    ).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [f, listings]);

  const alertKey = JSON.stringify([f.section, f.sub, f.spec, f.stage, f.dist, f.q]);
  const alertOn = alerts.has(alertKey);

  return (
    <>
      <header className="app-top">
        <h1 className="page-title">Buscar</h1>
        <label className={styles.search}>
          <span className="sr-only">Buscar</span>
          <Icon name="search" size={20} />
          <input
            type="search"
            placeholder="¿Qué necesitas?"
            value={f.q}
            onChange={(e) => set({ q: e.target.value })}
            autoComplete="off"
            enterKeyHint="search"
          />
        </label>
      </header>

      <main className="scroll fade">
        <div className={styles.filters}>
          {section ? (
            <>
              <div className={styles.secHead}>
                <SectionBadge section={section} />
                <div style={{ flex: 1 }}><small className="cmeta">Sección</small><b>{section.name}</b></div>
                <button type="button" className="link" onClick={() => set({ section: null, sub: null, spec: null })}>Todas</button>
              </div>
              <div>
                <h2 className={styles.flabel}>Tipo</h2>
                <ChipRow label="Tipo">
                  {section.subcategories.map((s) => (
                    <Chip key={s} small pressed={f.sub === s} onClick={() => set({ sub: f.sub === s ? null : s })}>{s}</Chip>
                  ))}
                </ChipRow>
              </div>
              <div>
                <h2 className={styles.flabel}>{section.spec.label}</h2>
                <ChipRow label={section.spec.label}>
                  {section.spec.options.map((o) => (
                    <Chip key={o.value} small pressed={f.spec === o.value} onClick={() => set({ spec: f.spec === o.value ? null : o.value })}>{o.label}</Chip>
                  ))}
                </ChipRow>
              </div>
            </>
          ) : (
            <div>
              <h2 className={styles.flabel}>Sección</h2>
              <ChipRow label="Sección">
                {SECTIONS.map((s) => (
                  <Chip key={s.name} small onClick={() => set({ section: s.name, sub: null, spec: null })}>{s.name}</Chip>
                ))}
              </ChipRow>
            </div>
          )}

          <div>
            <h2 className={styles.flabel}>Etapa del bebé</h2>
            <ChipRow label="Etapa del bebé">
              {STAGES.map((s) => (
                <Chip key={s.key} small pressed={f.stage === s.key} onClick={() => set({ stage: f.stage === s.key ? null : s.key })}>{s.label}</Chip>
              ))}
            </ChipRow>
          </div>

          <div>
            <h2 className={styles.flabel}>Distancia</h2>
            <div className={styles.dist} role="group" aria-label="Distancia">
              {DISTANCES.map((d) => (
                <button key={d} type="button" aria-pressed={f.dist === d} onClick={() => set({ dist: d })}>{d} km</button>
              ))}
            </div>
          </div>

          <ChipRow label="Más filtros">
            <Chip small pressed={f.verified} onClick={() => set({ verified: !f.verified })}>Verificados</Chip>
            <Chip small pressed={f.lots} onClick={() => set({ lots: !f.lots })}>Solo lotes</Chip>
            <Chip small pressed={f.onlyNew} onClick={() => set({ onlyNew: !f.onlyNew })}>Solo nuevos</Chip>
          </ChipRow>
        </div>

        <div className="section-head" style={{ marginTop: 20, alignItems: 'center' }}>
          <div aria-live="polite">
            <h2 className={styles.count}>{results.length} {results.length === 1 ? 'resultado' : 'resultados'}</h2>
            <span className="cmeta">{f.stage ? `${stageLabel(f.stage)} · ` : ''}a menos de {f.dist} km</span>
          </div>
          <button
            type="button"
            className={styles.alert}
            aria-pressed={alertOn}
            onClick={() => { if (toggleAlert(alertKey, f)) toast('Te avisaremos cuando alguien publique algo así cerca'); }}
          >
            <Icon name={alertOn ? 'check' : 'bell'} size={15} /> {alertOn ? 'Alerta creada' : 'Crear alerta'}
          </button>
        </div>

        {error ? (
          <LoadError onRetry={reload} />
        ) : loading ? (
          <div className="grid" aria-busy="true">{[0, 1, 2, 3].map((i) => <ProductCardSkeleton key={i} />)}</div>
        ) : results.length ? (
          <div className="grid">{results.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        ) : (
          <div className={styles.empty}>
            <b>Nada con estos filtros todavía</b>
            <p>Quita algún filtro, amplía el radio o crea una alerta y te avisamos en cuanto alguien lo publique.</p>
            {f.dist < 20 && <Button size="sm" onClick={() => set({ dist: 20 })}>Buscar a 20 km</Button>}
          </div>
        )}
      </main>
      <TabBar />
    </>
  );
}
