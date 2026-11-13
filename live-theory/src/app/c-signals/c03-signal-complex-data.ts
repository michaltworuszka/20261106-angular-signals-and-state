import { Component, computed, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';

interface Address {
  street: string;
  city: string;
}

interface UserProfile {
  name: string;
  address: Address;
  skills: string[];
}

const ALL_SKILLS = ['Angular', 'TypeScript', 'RxJS', 'Signals', 'NgRx', 'Vitest'];

@Component({
  selector: 'app-c03-signal-complex-data',
  imports: [JsonPipe],
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">C03 – signal-complex-data</header>

    <div class="row g-4">
      <div class="col-lg-6">
        <label class="form-label" for="name">Imię</label>
        <input
          #nameInput
          id="name"
          class="form-control mb-3"
          [value]="profile().name"
          (input)="rename(nameInput.value)"
        />

        <p class="mb-1">
          Miasto: <strong>{{ city() }}</strong>
        </p>
        <button class="btn btn-sm btn-primary mb-3" type="button" (click)="toggleCity()">
          zmień miasto (obiekt zagnieżdżony)
        </button>

        <p class="mb-1">Umiejętności:</p>
        <div class="d-flex flex-wrap gap-2 mb-2">
          @for (skill of profile().skills; track skill) {
            <span class="badge text-bg-secondary d-flex align-items-center gap-1">
              {{ skill }}
              <button
                class="btn-close btn-close-white"
                style="font-size: 0.5rem"
                type="button"
                [attr.aria-label]="'usuń ' + skill"
                (click)="removeSkill(skill)"
              ></button>
            </span>
          } @empty {
            <span class="text-body-secondary small">brak</span>
          }
        </div>
        <button
          class="btn btn-sm btn-success"
          type="button"
          [disabled]="!nextSkill()"
          (click)="addSkill()"
        >
          + {{ nextSkill() ?? 'wszystkie dodane' }}
        </button>
      </div>

      <div class="col-lg-6">
        <small class="text-body-secondary">profile() – aktualny stan:</small>
        <pre class="border rounded p-2"><code>{{ profile() | json }}</code></pre>
      </div>
    </div>

    <pre class="mt-4"><code>{{ code }}</code></pre>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <ul class="mb-0">
        <li>
          Sygnał może trzymać obiekt / tablicę – ale aktualizacja zawsze tworzy
          <strong>nowy obiekt</strong> (spread), a zmieniona gałąź też jest nowa:
          <code>address: &#123; ...p.address, city &#125;</code>.
        </li>
        <li>
          Tablice: <code>[...arr, x]</code>, <code>filter</code>, <code>map</code> – nigdy
          <code>push</code> / <code>splice</code> / przypisanie w miejscu.
        </li>
        <li>
          Wycinki stanu przez <code>computed()</code> (tu: <code>city</code>) – komponent czyta
          tylko to, czego potrzebuje.
        </li>
        <li>Głębokie zagnieżdżenie = dużo spreadów → sygnał na gałąź albo store (Część E).</li>
      </ul>
    </blockquote>
  `,
})
export class C03SignalComplexData {
  protected readonly profile = signal<UserProfile>({
    name: 'Ania',
    address: { street: 'Długa 1', city: 'Gdańsk' },
    skills: ['Angular', 'TypeScript'],
  });

  // Slices of state.
  protected readonly city = computed(() => this.profile().address.city);
  protected readonly nextSkill = computed(() =>
    ALL_SKILLS.find((s) => !this.profile().skills.includes(s)),
  );

  protected readonly code = `// nested object: new root + new address
profile.update((p) => ({ ...p, address: { ...p.address, city: 'Kraków' } }));

// array: add / remove without mutation
profile.update((p) => ({ ...p, skills: [...p.skills, 'RxJS'] }));
profile.update((p) => ({ ...p, skills: p.skills.filter((s) => s !== 'RxJS') }));`;

  protected rename(name: string): void {
    this.profile.update((p) => ({ ...p, name }));
  }

  protected toggleCity(): void {
    this.profile.update((p) => ({
      ...p,
      address: { ...p.address, city: p.address.city === 'Gdańsk' ? 'Kraków' : 'Gdańsk' },
    }));
  }

  protected addSkill(): void {
    const skill = this.nextSkill();
    if (!skill) return;
    this.profile.update((p) => ({ ...p, skills: [...p.skills, skill] }));
  }

  protected removeSkill(skill: string): void {
    this.profile.update((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));
  }
}
