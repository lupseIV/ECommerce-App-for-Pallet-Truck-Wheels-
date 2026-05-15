import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="home">

      <!-- Hero -->
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero__inner">
          <span class="hero__tag" aria-hidden="true">RO-WHEELS INDUSTRIAL</span>
          <h1 id="hero-title" class="hero__title">
            Soluții de Rulare pentru<br>
            <span class="hero__accent">Excelență Industrială</span>
          </h1>
          <p class="hero__sub">
            Furnizor de componente de înaltă calitate pentru stivuitoare și transpalete.
            Roți și rulmenți certificați pentru medii industriale exigente.
          </p>
          <div class="hero__ctas">
            <a routerLink="/products" class="btn-primary">Explorează Catalogul</a>
            @if (!auth.isLoggedIn()) {
              <a routerLink="/login" class="btn-outline">Autentificare</a>
            } @else {
              <a routerLink="/profile" class="btn-outline">Mergi la Cont</a>
            }
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="features" aria-labelledby="features-title">
        <h2 id="features-title" class="sr-only">De ce RO-Wheels</h2>
        <div class="features__inner">
          <div class="feature-card">
            <span class="feature-card__icon" aria-hidden="true">🏭</span>
            <h3 class="feature-card__title">Calitate Certificată</h3>
            <p class="feature-card__desc">Produse testate conform standardelor europene pentru aplicații industriale.</p>
          </div>
          <div class="feature-card">
            <span class="feature-card__icon" aria-hidden="true">🚚</span>
            <h3 class="feature-card__title">Livrare Rapidă</h3>
            <p class="feature-card__desc">Stoc permanent disponibil. Livrare în 24–48h pe teritoriul României.</p>
          </div>
          <div class="feature-card">
            <span class="feature-card__icon" aria-hidden="true">🛠</span>
            <h3 class="feature-card__title">Suport Tehnic</h3>
            <p class="feature-card__desc">Echipa noastră vă ajută să alegeți soluția potrivită pentru aplicația dvs.</p>
          </div>
        </div>
      </section>

      <!-- Categories -->
      <section class="categories" aria-labelledby="categories-title">
        <div class="categories__inner">
          <h2 id="categories-title" class="categories__title">Categorii de Produse</h2>
          <div class="cat-grid">
            <a routerLink="/products" class="cat-card">
              <div class="cat-card__img cat-card__img--wheel" aria-hidden="true"></div>
              <div class="cat-card__body">
                <h3 class="cat-card__name">Roți Transpalet</h3>
                <p class="cat-card__desc">Poliuretan, Nailon, Cauciuc, Fontă — toate dimensiunile disponibile.</p>
                <span class="cat-card__link" aria-hidden="true">Vezi produse →</span>
              </div>
            </a>
            <a routerLink="/products" class="cat-card">
              <div class="cat-card__img cat-card__img--bearing" aria-hidden="true"></div>
              <div class="cat-card__body">
                <h3 class="cat-card__name">Rulmenți Industriali</h3>
                <p class="cat-card__desc">Rulmenți radiali, cu role, ceramici și inox pentru sarcini grele.</p>
                <span class="cat-card__link" aria-hidden="true">Vezi produse →</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="home-footer">
        <p>© 2024 RO-Wheels Industrial S.R.L. — Toate drepturile rezervate.
          <a routerLink="/contact" class="home-footer__link">Contact</a>
        </p>
      </footer>

    </div>
  `,
  styles: [`
    .home { background: var(--rw-bg); }

    /* ── Hero ── */
    .hero {
      background: var(--rw-dark);
      padding: 108px var(--sp-6) 96px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 50% 40%, rgba(232,96,28,.12) 0%, transparent 60%);
      pointer-events: none;
    }

    .hero__inner {
      position: relative;
      max-width: 720px;
      margin: 0 auto;
    }

    .hero__tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2.5px;
      color: var(--rw-orange);
      margin-bottom: var(--sp-5);
      text-transform: uppercase;
    }

    .hero__title {
      font-size: 44px;
      font-weight: 800;
      color: #fff;
      line-height: 1.18;
      margin: 0 0 var(--sp-5);
      letter-spacing: -0.5px;
    }

    .hero__accent { color: var(--rw-orange); }

    .hero__sub {
      font-size: 17px;
      color: rgba(255,255,255,.65);
      line-height: 1.72;
      margin: 0 0 var(--sp-10);
      max-width: 560px;
      margin-left: auto;
      margin-right: auto;
    }

    .hero__ctas {
      display: flex;
      gap: var(--sp-4);
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      padding: 14px 32px;
      background: var(--rw-orange);
      color: #fff;
      border-radius: var(--r-md);
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      transition: background var(--t-fast), transform var(--t-fast);
    }

    .btn-primary:hover { background: var(--rw-orange-h); transform: translateY(-1px); }

    .btn-outline {
      display: inline-flex;
      align-items: center;
      padding: 14px 32px;
      border: 1.5px solid rgba(255,255,255,.32);
      color: rgba(255,255,255,.85);
      border-radius: var(--r-md);
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      transition: border-color var(--t-fast), color var(--t-fast);
    }

    .btn-outline:hover { border-color: #fff; color: #fff; }

    /* ── Features ── */
    .features {
      padding: var(--sp-16) var(--sp-6);
      background: #fff;
    }

    .features__inner {
      max-width: 1000px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--sp-8);
    }

    .feature-card {
      text-align: center;
      padding: var(--sp-8) var(--sp-6);
      border-radius: var(--r-lg);
      transition: background var(--t-fast);
    }

    .feature-card:hover { background: var(--rw-bg); }

    .feature-card__icon {
      font-size: 36px;
      display: block;
      margin-bottom: var(--sp-4);
    }

    .feature-card__title {
      font-size: 17px;
      font-weight: 700;
      color: var(--rw-text);
      margin: 0 0 var(--sp-3);
    }

    .feature-card__desc {
      font-size: 14px;
      color: var(--rw-muted);
      line-height: 1.7;
      margin: 0;
    }

    /* ── Categories ── */
    .categories {
      padding: var(--sp-16) var(--sp-6);
    }

    .categories__inner { max-width: 1000px; margin: 0 auto; }

    .categories__title {
      font-size: 26px;
      font-weight: 700;
      color: var(--rw-text);
      margin: 0 0 var(--sp-8);
      text-align: center;
    }

    .cat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--sp-6);
    }

    .cat-card {
      background: #fff;
      border: 1px solid var(--rw-border);
      border-radius: var(--r-lg);
      overflow: hidden;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      transition: box-shadow var(--t-base), transform var(--t-base), border-color var(--t-base);
    }

    .cat-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-4px);
      border-color: rgba(232,96,28,0.2);
    }

    .cat-card__img {
      height: 168px;
    }

    .cat-card__img--wheel   { background: linear-gradient(135deg, #0A0F1E, #1e2d5c); }
    .cat-card__img--bearing { background: linear-gradient(135deg, #0A0F1E, #1e3a3a); }

    .cat-card__body { padding: var(--sp-6); }

    .cat-card__name {
      font-size: 18px;
      font-weight: 700;
      color: var(--rw-text);
      margin: 0 0 var(--sp-2);
    }

    .cat-card__desc {
      font-size: 14px;
      color: var(--rw-muted);
      line-height: 1.65;
      margin: 0 0 var(--sp-4);
    }

    .cat-card__link {
      font-size: 13px;
      font-weight: 600;
      color: var(--rw-orange);
    }

    /* ── Footer ── */
    .home-footer {
      background: var(--rw-dark);
      padding: var(--sp-6);
      text-align: center;
      font-size: 13px;
      color: rgba(255,255,255,.4);
    }

    .home-footer__link {
      color: rgba(255,255,255,.6);
      margin-left: var(--sp-3);
      text-decoration: none;
      transition: color var(--t-fast);
    }

    .home-footer__link:hover { color: #fff; }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .hero { padding: 72px var(--sp-4) 64px; }
      .hero__title  { font-size: 30px; }
      .hero__sub    { font-size: 15px; }
      .features__inner { grid-template-columns: 1fr; gap: var(--sp-4); }
      .cat-grid     { grid-template-columns: 1fr; }
    }

    /* sr-only utility (duplicated locally for portability) */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0,0,0,0);
      white-space: nowrap;
      border-width: 0;
    }
  `],
})
export class HomeComponent {
  readonly auth = inject(AuthService);
}
