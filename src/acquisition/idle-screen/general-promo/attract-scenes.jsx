/* Заставка кофе-бара «Бар на вынос» — 1920×1080 standby loop */
const { SceneStage, useScene, Easing, clamp } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakText, TweakColor, TweakRadio } = window;

const C = {
  cream: '#F6F2EA',
  paper: '#FFFFFF',
  ink: '#2B2420',
  muted: '#8B8177',
  line: 'rgba(43,36,32,0.12)',
};
const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'Manrope', system-ui, sans-serif";

const seq = (p, a, b, ease) => (ease || Easing.easeOutCubic)(clamp((p - a) / (b - a), 0, 1));
const env = (p) => Math.min(seq(p, 0, 0.07, Easing.easeOutCubic), 1 - seq(p, 0.93, 1, Easing.easeInCubic));

/* three motion helpers — nothing else moves */
const MOTION = {
  enter: (p, a, b, dist) => {
    const t = seq(p, a, b, Easing.easeOutCubic);
    return { opacity: t, transform: `translateY(${(1 - t) * (dist == null ? 26 : dist)}px)` };
  },
  draw: (p, a, b) => ({ transform: `scaleX(${seq(p, a, b, Easing.easeInOutCubic)})`, transformOrigin: 'left center' }),
  drift: (p, amt) => ({ transform: `scale(${1 + (amt == null ? 0.02 : amt) * p})` }),
};

function Chrome({ gold, hideMark }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.cream, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 40, border: `1px solid ${gold}`, opacity: 0.45, borderRadius: 8 }} />
      <div style={{ position: 'absolute', left: 96, top: 84, display: hideMark ? 'none' : 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 12, height: 12, borderRadius: 12, background: gold }} />
        <div style={{ fontFamily: SANS, fontSize: 26, fontWeight: 600, letterSpacing: '0.34em', color: C.ink }}>БАР НА ВЫНОС</div>
      </div>
      <div style={{ position: 'absolute', left: 96, bottom: 82, fontFamily: SANS, fontSize: 25, fontWeight: 500, letterSpacing: '0.12em', color: C.muted }}>КОФЕ · ЧАЙ · ЛИМОНАДЫ · КОКТЕЙЛИ</div>
      <div style={{ position: 'absolute', right: 96, bottom: 82, fontFamily: SANS, fontSize: 25, fontWeight: 500, letterSpacing: '0.12em', color: C.muted }}>БЕЗНАЛИЧНАЯ ОПЛАТА</div>
    </div>
  );
}

/* every scene: persistent chrome + content that is invisible at progress 0 and 1 */
function withChrome(Inner, opts) {
  return function Scene(props) {
    const hideMark = !!(opts && opts.hideMark);
    const { progress } = useScene();
    const gold = props.gold || '#C4A469';
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <Chrome gold={gold} hideMark={hideMark} />
        <div style={{ position: 'absolute', inset: 0, opacity: env(progress) }}>
          <Inner {...props} p={progress} gold={gold} />
        </div>
      </div>
    );
  };
}

const Caption = ({ children, style }) => (
  <div style={Object.assign({ fontFamily: SANS, fontSize: 34, fontWeight: 500, lineHeight: 1.45, color: C.muted, textWrap: 'pretty' }, style)}>{children}</div>
);
const Kicker = ({ children, gold }) => (
  <div style={{ fontFamily: SANS, fontSize: 26, fontWeight: 700, letterSpacing: '0.3em', color: gold }}>{children}</div>
);

const Opening = withChrome(({ p, gold, scene }) => (
  <div style={Object.assign({ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34 }, MOTION.drift(p, 0.025))}>
    <div style={MOTION.enter(p, 0.05, 0.4, 18)}>
      <Kicker gold={gold}>КОФЕ-БАР БЕЗ ОЧЕРЕДИ</Kicker>
    </div>
    <div style={{ fontFamily: SERIF, fontSize: 168, fontWeight: 500, color: C.ink, lineHeight: 1, opacity: seq(p, 0.1, 0.45) }}>Бар на вынос</div>
    <div style={Object.assign({ width: 620, height: 1, background: gold }, MOTION.draw(p, 0.3, 0.7))} />
    <div style={{ fontFamily: SERIF, fontSize: 62, fontWeight: 500, fontStyle: 'italic', color: C.muted, opacity: seq(p, 0.45, 0.68), transform: `translateX(${-(1 - seq(p, 0.45, 0.85)) * 260}px)` }}>
      {scene.text || 'Выносит за минуту'}
    </div>
  </div>
), { hideMark: true });

const Price = withChrome(({ p, gold, scene }) => {
  const target = parseFloat(scene.price != null ? scene.price : 119.99);
  const from = target + 60;
  const val = from + (target - from) * Easing.easeOutCubic(clamp((p - 0.12) / 0.38, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 72 }}>
      <div style={Object.assign({ width: 800, flex: 'none', textAlign: 'right' }, MOTION.enter(p, 0.04, 0.35))}>
        <div style={{ fontFamily: SANS, fontSize: 34, fontWeight: 600, letterSpacing: '0.22em', color: gold, marginBottom: 6 }}>ОТ</div>
        <div style={{ fontFamily: SERIF, fontSize: 240, fontWeight: 600, color: C.ink, lineHeight: 0.9, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {val.toFixed(2)} <span style={{ fontSize: 130 }}>₽</span>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 34, fontWeight: 600, letterSpacing: '0.14em', color: C.ink, marginTop: 54 }}>КАПУЧИНО 250 МЛ</div>
      </div>
      <div style={{ width: 1, height: 320, background: C.line, opacity: seq(p, 0.06, 0.3) }} />
      <div style={Object.assign({ maxWidth: 620 }, MOTION.enter(p, 0.06, 0.34))}>
        <Kicker gold={gold}>ПОЧЕМУ ДЕШЕВЛЕ</Kicker>
        <Caption style={{ marginTop: 26, fontSize: 40, color: C.ink, fontWeight: 500 }}>
          Приготовление полностью автоматизировано: нет смен, нет очереди, нет наценки за персонал.
        </Caption>
        <Caption style={{ marginTop: 22 }}>Вы платите только за напиток.</Caption>
      </div>
    </div>
  );
});

const INGREDIENTS = [
  ['01', 'Вода', 'питьевая из природного источника'],
  ['02', 'Кофейные зёрна', 'австрийской премиум-обжарки'],
  ['03', 'Молоко', 'цельное гранулированное профессиональной серии'],
  ['04', 'Сиропы', 'на натуральном сырье, без искусственных ароматов'],
  ['05', 'Чай', 'натуральный листовой'],
];

const Ingredients = withChrome(({ p, gold }) => (
  <div style={{ position: 'absolute', left: 150, right: 150, top: 186, bottom: 156, display: 'flex', flexDirection: 'column' }}>
    <div style={MOTION.enter(p, 0.02, 0.2, 14)}>
      <Kicker gold={gold}>СОСТАВ</Kicker>
      <div style={{ fontFamily: SERIF, fontSize: 86, fontWeight: 500, color: C.ink, marginTop: 10 }}>Из чего мы готовим</div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: 34 }}>
      {INGREDIENTS.map(([n, name, desc], i) => {
        const a = 0.16 + i * 0.1;
        const st = MOTION.enter(p, a, a + 0.16, 22);
        return (
          <div key={n} style={Object.assign({ display: 'grid', gridTemplateColumns: '104px 420px 1fr', alignItems: 'baseline', gap: 24, padding: '18px 0', borderTop: `1px solid ${C.line}` }, st)}>
            <div style={{ fontFamily: SANS, fontSize: 28, fontWeight: 700, color: gold, letterSpacing: '0.1em' }}>{n}</div>
            <div style={{ fontFamily: SERIF, fontSize: 46, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap' }}>{name}</div>
            <Caption style={{ fontSize: 34 }}>{desc}</Caption>
          </div>
        );
      })}
    </div>
  </div>
));

function TechCard({ title, desc, p, a, gold, art }) {
  return (
    <div style={Object.assign({ flex: 1, background: C.paper, borderRadius: 14, padding: '32px 36px 30px', boxShadow: '0 24px 60px rgba(43,36,32,0.07)', display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'center', alignItems: 'center', justifyContent: 'center' }, MOTION.enter(p, a, a + 0.2, 30))}>
      <div style={{ height: 116, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{art}</div>
      <div style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 600, color: C.ink, lineHeight: 1.1 }}>{title}</div>
      <Caption style={{ fontSize: 28, textAlign: 'center' }}>{desc}</Caption>
      <div style={{ marginTop: 26, width: 56, height: 3, background: gold }} />
    </div>
  );
}

const Tech = withChrome(({ p, gold }) => {
  const spin = p * 360;
  const drop = (i) => {
    const t = clamp(((p * 2.2 + i * 0.33) % 1), 0, 1);
    return { transform: `translateY(${-40 + t * 96}px)`, opacity: Math.sin(Math.PI * t) };
  };
  const fill = 0.2 + 0.7 * (0.5 + 0.5 * Math.sin(p * Math.PI * 3));
  const steam = (i) => {
    const t = clamp(((p * 1.8 + i * 0.3) % 1), 0, 1);
    return { transform: `translateY(${-t * 46}px)`, opacity: Math.sin(Math.PI * t) * 0.9 };
  };
  return (
    <div style={{ position: 'absolute', left: 150, right: 150, top: 176, bottom: 150, display: 'flex', flexDirection: 'column' }}>
      <div style={MOTION.enter(p, 0.02, 0.2, 14)}>
        <Kicker gold={gold}>ТЕХНОЛОГИЯ</Kicker>
        <div style={{ fontFamily: SERIF, fontSize: 82, fontWeight: 500, color: C.ink, marginTop: 10 }}>Не просто кофемашина</div>
      </div>
      <div style={{ display: 'flex', gap: 30, marginTop: 36, flex: 1, minHeight: 0 }}>
        <TechCard p={p} a={0.14} gold={gold} title="SMB-система экстракции кофе" desc="Кофе готовится под давлением 9 бар с точным потоком и температурой."
          art={<div style={{ position: 'relative', width: 150, height: 150 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 150, border: `2px solid ${C.line}` }} />
            <div style={{ position: 'absolute', inset: 26, borderRadius: 150, border: `2px solid ${C.line}` }} />
            <div style={{ position: 'absolute', inset: 0, transform: `rotate(${spin}deg)` }}>
              <div style={{ position: 'absolute', left: 65, top: -8, width: 20, height: 20, borderRadius: 20, background: gold }} />
            </div>
            <div style={{ position: 'absolute', inset: 0, transform: `rotate(${-spin * 1.6}deg)` }}>
              <div style={{ position: 'absolute', left: 65, top: 18, width: 14, height: 14, borderRadius: 14, background: C.ink }} />
            </div>
            <div style={{ position: 'absolute', left: 60, top: 60, width: 30, height: 30, borderRadius: 30, background: C.cream, border: `2px solid ${C.ink}` }} />
          </div>} />
        <TechCard p={p} a={0.22} gold={gold} title="Отдельный завариватель чая" desc="Натуральный чай готовится в специальном модуле."
          art={<div style={{ position: 'relative', width: 150, height: 150, overflow: 'hidden' }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={Object.assign({ position: 'absolute', left: 42 + i * 32, top: 40, width: 4, height: 34, borderRadius: 4, background: i === 1 ? gold : C.line }, steam(i))} />
            ))}
            <div style={{ position: 'absolute', left: 26, bottom: 20, right: 26, height: 56, borderRadius: '4px 4px 26px 26px', border: `2px solid ${C.ink}` }} />
            <div style={{ position: 'absolute', left: 34, bottom: 24, right: 34, height: 24, borderRadius: '0 0 20px 20px', background: gold, opacity: 0.5 }} />
          </div>} />
        <TechCard p={p} a={0.3} gold={gold} title="Собственный льдогенератор" desc="Кристальные кубики льда производятся прямо в автомате."
          art={<div style={{ position: 'relative', width: 150, height: 150, overflow: 'hidden' }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={Object.assign({ position: 'absolute', left: 20 + i * 46, top: 20, width: 30, height: 30, borderRadius: 7, background: i === 1 ? gold : '#DCE4E8' }, drop(i))} />
            ))}
            <div style={{ position: 'absolute', left: 14, bottom: 16, right: 14, height: 44, borderRadius: '0 0 22px 22px', border: `2px solid ${C.ink}`, borderTop: 'none' }} />
          </div>} />
      </div>
    </div>
  );
});

const CHECKS = ['Промывка узлов и трубок', 'Замена воды и фильтров', 'Санитарная обработка по регламенту'];

const Care = withChrome(({ p, gold }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 110 }}>
    <div style={Object.assign({ maxWidth: 700 }, MOTION.enter(p, 0.04, 0.3))}>
      <Kicker gold={gold}>ГИГИЕНА</Kicker>
      <div style={{ fontFamily: SERIF, fontSize: 104, fontWeight: 500, color: C.ink, marginTop: 14, lineHeight: 1.05 }}>Чистота по регламенту</div>
      <Caption style={{ marginTop: 28, fontSize: 36 }}>Обслуживание и чистка — по строгим стандартам производителя.</Caption>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      {CHECKS.map((c, i) => {
        const a = 0.24 + i * 0.11;
        const t = seq(p, a, a + 0.18);
        return (
          <div key={c} style={Object.assign({ display: 'flex', alignItems: 'center', gap: 26, background: C.paper, borderRadius: 12, padding: '28px 40px', boxShadow: '0 18px 44px rgba(43,36,32,0.06)', minWidth: 620 }, MOTION.enter(p, a, a + 0.18, 20))}>
            <div style={{ width: 44, height: 44, borderRadius: 44, border: `2px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 22, height: 22, borderRadius: 22, background: gold, transform: `scale(${t})` }} />
            </div>
            <div style={{ fontFamily: SANS, fontSize: 34, fontWeight: 600, color: C.ink }}>{c}</div>
          </div>
        );
      })}
    </div>
  </div>
));

const CTA = withChrome(({ p, gold, scene }) => {
  const pulse = 0.5 + 0.5 * Math.sin(p * Math.PI * 4);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
      <div style={{ position: 'relative', width: 150, height: 150, opacity: seq(p, 0.03, 0.3) }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 150, border: `2px solid ${gold}`, transform: `scale(${0.85 + pulse * 0.25})`, opacity: 1 - pulse * 0.75 }} />
        <div style={{ position: 'absolute', inset: 40, borderRadius: 150, background: gold, opacity: 0.9 }} />
      </div>
      <div style={Object.assign({ fontFamily: SERIF, fontSize: 130, fontWeight: 600, color: C.ink, lineHeight: 1 }, MOTION.enter(p, 0.08, 0.4, 20))}>Коснитесь экрана</div>
      <Caption style={Object.assign({ fontSize: 42, color: C.ink }, MOTION.enter(p, 0.25, 0.6, 16))}>
        Напиток будет готов за минуту
      </Caption>
    </div>
  );
});

const SCENE_MAP = { 'Открытие': Opening, 'Цена': Price, 'Ингредиенты': Ingredients, 'Технология': Tech, 'Гигиена': Care, 'Призыв': CTA };

function CoffeeAttract() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS || {});
  const gold = t.gold || '#C4A469';
  const map = {};
  Object.keys(SCENE_MAP).forEach((k) => {
    const Comp = SCENE_MAP[k];
    map[k] = (props) => <Comp {...props} gold={gold} />;
  });
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <SceneStage width={1920} height={1080} fps={60} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.cream} background={C.cream} transition="cut">
        {map}
      </SceneStage>
      <TweaksPanel>
        <TweakSection label="Заставка" />
        <TweakColor label="Акцент" value={gold} options={['#C4A469', '#B08442', '#8C7A5B', '#D0763C']} onChange={(v) => setTweak('gold', v)} />
        <TweakToggle label="Редактор анимации" value={t.motionEditor} onChange={(v) => setTweak('motionEditor', v)} />
      </TweaksPanel>
    </div>
  );
}
window.CoffeeAttract = CoffeeAttract;
