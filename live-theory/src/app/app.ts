import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { Menu } from './core/menu';
import { MENU_SECTIONS } from './core/menu-sections';

@Component({
  imports: [RouterOutlet, RouterLink, Menu],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);

  protected readonly sections = MENU_SECTIONS;
  // Router events (stream) → current URL (state) – menu expands the matching section.
  protected readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  // Mobile menu toggle: a signal instead of Bootstrap JS (collapse plugin).
  protected readonly menuOpen = signal(false);

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
