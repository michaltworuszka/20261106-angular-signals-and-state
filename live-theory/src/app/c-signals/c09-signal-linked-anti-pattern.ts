import { Component, linkedSignal, signal } from '@angular/core';

interface Product {
  id: number;
  name: string;
  stock: number;
  fetch: number; // how many times it was fetched
}

interface Draft {
  name: string;
  dirty: boolean;
}

const INITIAL: Product = { id: 1, name: 'Klawiatura', stock: 12, fetch: 1 };

@Component({
  selector: 'app-c09-signal-linked-anti-pattern',
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">
      C09 – signal-linked-anti-pattern
    </header>

    <div class="card mb-3">
      <div class="card-body d-flex flex-wrap align-items-center gap-3">
        <span>
          serwer: <code>{{ server().name }}</code
          >, stan: <code>{{ server().stock }}</code> szt., pobranie
          <code>#{{ server().fetch }}</code>
        </span>
        <button class="btn btn-sm btn-outline-secondary" type="button" (click)="refetch()">
          ⟳ odświeżenie w tle (polling)
        </button>
      </div>
    </div>

    <p class="small text-body-secondary">
      Zmień nazwę w obu polach, potem kliknij „odświeżenie”. Polling zmienia tylko stan magazynu.
    </p>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="card border-danger h-100">
          <div class="card-header text-bg-danger">
            ❌ <code>linkedSignal(() =&gt; server().name)</code>
          </div>
          <div class="card-body">
            <label class="form-label small" for="bad-name">Nazwa</label>
            <input
              #bad
              id="bad-name"
              class="form-control"
              [value]="badDraft()"
              (input)="badDraft.set(bad.value)"
            />
            <p class="small text-danger-emphasis mt-2 mb-0">
              Każda zmiana <code>server</code> (nawet sam <code>stock</code>) = nowe wyliczenie →
              Twoja edycja znika bez ostrzeżenia.
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card border-success h-100">
          <div class="card-header text-bg-success">
            ✅ <code>{{ '{' }} source, computation {{ '}' }}</code> + <code>dirty</code>
          </div>
          <div class="card-body">
            <label class="form-label small" for="good-name">
              Nazwa
              @if (goodDraft().dirty) {
                <span class="badge text-bg-warning ms-1">niezapisane</span>
              }
            </label>
            <input
              #good
              id="good-name"
              class="form-control"
              [value]="goodDraft().name"
              (input)="edit(good.value)"
            />
            <div class="d-flex gap-2 mt-2">
              <button
                class="btn btn-sm btn-success"
                type="button"
                [disabled]="!goodDraft().dirty"
                (click)="save()"
              >
                zapisz
              </button>
              <button
                class="btn btn-sm btn-outline-secondary"
                type="button"
                [disabled]="!goodDraft().dirty"
                (click)="discard()"
              >
                odrzuć zmiany
              </button>
            </div>
            <p class="small text-success-emphasis mt-2 mb-0">
              Brudny szkic przetrwa polling. Czysty – podąża za serwerem.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3 mt-2">
      <div class="col-lg-6">
        <div class="card border-danger h-100">
          <div class="card-header">❌ reset przy każdej zmianie źródła</div>
          <div class="card-body">
            <pre class="small mb-0"><code>{{ badCode }}</code></pre>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card border-success h-100">
          <div class="card-header">✅ <code>previous</code> decyduje</div>
          <div class="card-body">
            <pre class="small mb-0"><code>{{ goodCode }}</code></pre>
          </div>
        </div>
      </div>
    </div>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3">
      <p class="fw-semibold mb-1">Dlaczego to boli</p>
      <p>
        Reset przy zmianie źródła to <strong>cecha</strong> <code>linkedSignal</code> (podstawy). Tu
        obraca się przeciw użytkownikowi: źródło zmienia się <strong>samo</strong> (polling,
        websocket, refetch po innej akcji), a nowy obiekt z serwera = nowa referencja = nowe
        wyliczenie. Na demo działa, na produkcji „czasem znika tekst”.
      </p>
      <p class="fw-semibold mb-1">Poprawka</p>
      <ul class="mb-0">
        <li>
          Szkic pamięta, czy jest brudny. <code>computation</code> dostaje <code>previous</code> –
          brudny zostaje, czysty bierze świeże dane.
        </li>
        <li><code>zapisz</code> / <code>odrzuć</code> ustawiają szkic z powrotem na czysty.</li>
        <li>
          Albo prościej: <code>source</code> = tylko <code>id</code> – reset dopiero przy innym
          produkcie, nie przy każdym odświeżeniu.
        </li>
      </ul>
    </blockquote>

    <div class="card border-warning mt-4">
      <div class="card-header text-bg-warning">
        Antywzorzec #2: <code>linkedSignal</code> bez <code>set()</code>
      </div>
      <div class="card-body">
        <pre class="small mb-2"><code>{{ noSetCode }}</code></pre>
        <p class="small mb-0">
          Nikt nie woła <code>set()</code>? To jest <code>computed()</code>. Zapisywalny bez powodu
          = każdy (np. komponent korzystający ze store'a) może nadpisać stan wyliczany i rozjechać
          go ze źródłem. Reguła: <strong>najpierw <code>computed</code></strong
          >, <code>linkedSignal</code> dopiero gdy użytkownik musi tę wartość zmienić.
        </p>
      </div>
    </div>
  `,
})
export class C09SignalLinkedAntiPattern {
  protected readonly server = signal(INITIAL);

  // ❌ resets on every server change → user's edit is lost
  protected readonly badDraft = linkedSignal(() => this.server().name);

  // ✅ dirty draft survives source changes
  protected readonly goodDraft = linkedSignal<Product, Draft>({
    source: this.server,
    computation: (server, previous) =>
      previous?.value.dirty ? previous.value : { name: server.name, dirty: false },
  });

  protected readonly badCode = `draft = linkedSignal(() => this.server().name);

// polling: new object (only stock changed)
this.server.set({ ...product, stock: 11 });
// → draft() === server name, edit gone`;

  protected readonly goodCode = `draft = linkedSignal<Product, Draft>({
  source: this.server,
  computation: (server, previous) =>
    previous?.value.dirty
      ? previous.value                         // keep edit
      : { name: server.name, dirty: false },   // follow server
});

edit(name: string) { this.draft.set({ name, dirty: true }); }`;

  protected readonly noSetCode = `// ❌ never .set() anywhere – writable for no reason
readonly fullName = linkedSignal(() => \`\${this.first()} \${this.last()}\`);
store.fullName.set('???'); // compiles – derived state out of sync

// ✅
readonly fullName = computed(() => \`\${this.first()} \${this.last()}\`);`;

  protected refetch(): void {
    this.server.update((p) => ({ ...p, stock: Math.max(0, p.stock - 1), fetch: p.fetch + 1 }));
  }

  protected edit(name: string): void {
    this.goodDraft.set({ name, dirty: true });
  }

  protected save(): void {
    const name = this.goodDraft().name;
    this.server.update((p) => ({ ...p, name }));
    this.goodDraft.set({ name, dirty: false });
  }

  protected discard(): void {
    this.goodDraft.set({ name: this.server().name, dirty: false });
  }
}
