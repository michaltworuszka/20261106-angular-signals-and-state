import { Component } from '@angular/core';

@Component({
  selector: 'app-a4-sheriff-config-page',
  template: `
    <header class="h5 font-monospace text-body-secondary mb-3">
      A4 – konfiguracja Sheriff: podstawy
    </header>

    <p class="lead">
      Cały Sheriff to jeden plik: <code>sheriff.config.ts</code>. Dwa klucze –
      <code>modules</code> (co jest modułem i jakie ma tagi) i <code>depRules</code> (który tag może
      importować który).
    </p>

    <div class="row g-4">
      <div class="col-lg-7">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between flex-wrap gap-2">
            <span>Nasz config (cały)</span>
            <code class="small">live-theory/sheriff.config.ts</code>
          </div>
          <div class="card-body">
            <pre class="small mb-0"><code>{{ config }}</code></pre>
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <p class="fw-semibold mb-1">1. <code>modules</code> – ścieżka → tagi</p>
        <ul class="small">
          <li>Moduł = folder z <code>index.ts</code>. Z zewnątrz tylko przez niego.</li>
          <li>
            <code>&lt;domain&gt;</code> w ścieżce = placeholder: łapie nazwę folderu i wstawia ją w
            tag. Jedna linia → <code>domain:cart</code>, <code>domain:products</code>, …
          </li>
          <li>
            Moduł może mieć kilka tagów: zwykle <strong>domena</strong> + <strong>typ</strong>.
          </li>
        </ul>

        <p class="fw-semibold mb-1">2. <code>depRules</code> – tag → dozwolone tagi</p>
        <ul class="small">
          <li>Klucz: tag modułu, który importuje. Może mieć <code>*</code>.</li>
          <li>
            Wartość: tag, tablica tagów albo funkcja
            <code>({{ '{' }} from, to {{ '}' }}) =&gt; boolean</code>.
          </li>
          <li>
            Gotowe funkcje: <code>sameTag</code> (ten sam tag), <code>anyTag</code> (wszystko),
            <code>noDependencies</code> (nic).
          </li>
        </ul>

        <p class="fw-semibold mb-1">3. Tagi specjalne</p>
        <ul class="small mb-0">
          <li>
            <code>root</code> – wszystko, co nie jest w żadnym module (<code>main.ts</code>, shell,
            u nas reszta live-theory).
          </li>
          <li>
            <code>noTag</code> – moduł z <code>index.ts</code>, którego nie opisałeś w
            <code>modules</code> (<code>autoTagging</code>, domyślnie włączone).
          </li>
        </ul>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header">Jak Sheriff decyduje o jednym imporcie</div>
      <div class="card-body small">
        <ol class="mb-0">
          <li>
            Import z modułu źródłowego do docelowego. Ten sam moduł → bez sprawdzania.
            <div class="text-body-secondary">
              np. plik w <code>products/ui</code> → inny plik w <code>products/ui</code> ✓
            </div>
          </li>
          <li>
            Dla <strong>każdego</strong> tagu źródła szuka kluczy w <code>depRules</code>, które do
            niego pasują – wartości się <strong>sumują</strong>.
            <div class="text-body-secondary">
              <code>products/ui</code> = <code>domain:products</code> + <code>type:ui</code><br />
              <code>domain:products</code> ← <code>'domain:*'</code> +
              <code>'domain:products'</code> → <code>sameTag</code>, <code>domain:shared</code>,
              <code>domain:cart</code><br />
              <code>type:ui</code> ← <code>'type:ui'</code> → <code>type:ui</code>,
              <code>type:data</code>
            </div>
          </li>
          <li>
            Tag źródła przechodzi, jeśli któraś wartość wpuszcza <strong>jakikolwiek</strong> tag
            celu.
            <div class="text-body-secondary">
              <code>products/ui</code> → <code>shared/ui</code> (<code>domain:shared</code>,
              <code>type:ui</code>): <code>domain:products</code> wpuszcza
              <code>domain:shared</code> ✓, <code>type:ui</code> wpuszcza <code>type:ui</code> ✓
            </div>
          </li>
          <li>
            Import OK tylko gdy <strong>wszystkie</strong> tagi źródła przeszły. Stąd domena + typ =
            dwie niezależne bramki.
            <div class="text-body-secondary">
              <code>products/ui</code> → <code>cart/ui</code>: domena ✓ (<code>domain:cart</code>),
              typ ✓ → <strong>OK</strong><br />
              <code>products/ui</code> → <code>products/state</code>: domena ✓
              (<code>sameTag</code>), typ ✗ (<code>type:ui</code> ↛ <code>type:state</code>) →
              <strong>błąd</strong><br />
              <code>cart</code> → <code>products</code>: typ ✓ (<code>type:feature</code>), domena ✗
              (<code>domain:cart</code> ↛ <code>domain:products</code>) → <strong>błąd</strong>
            </div>
          </li>
          <li>
            Tag źródła bez żadnej reguły → nie „zabronione”, tylko
            <strong>błąd konfiguracji</strong> <code>SH-002</code> – pada cała weryfikacja.
            <div class="text-body-secondary">
              nowy <code>shared/util</code> (tag <code>type:util</code>) importuje
              <code>shared/ui</code> → brak klucza <code>'type:util'</code> → <code>SH-002</code>
            </div>
          </li>
        </ol>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header">Komunikaty, które zobaczysz</div>
      <div class="table-responsive">
        <table class="table table-sm small mb-0 align-middle">
          <thead>
            <tr>
              <th>Komunikat</th>
              <th>Znaczy</th>
              <th>Naprawa</th>
            </tr>
          </thead>
          <tbody>
            @for (e of errors; track e.code) {
              <tr>
                <td class="font-monospace text-danger-emphasis">{{ e.code }}</td>
                <td>{{ e.meaning }}</td>
                <td>{{ e.fix }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <blockquote class="mt-4 border-start border-4 border-primary ps-3 mb-0">
      Placeholdery, wildcardy i <code>sameTag</code> wystarczają na większość aplikacji.
    </blockquote>
  `,
})
export class A4SheriffConfigPage {
  protected readonly config = `import { sameTag, SheriffConfig } from '@softarc/sheriff-core';

const A4 = 'src/app/a-app-structure/a4-sheriff/app';

export const config: SheriffConfig = {
  entryFile: 'src/main.ts',               // where the import graph starts
  modules: {
    [\`\${A4}/features/<domain>\`]:       ['domain:<domain>', 'type:feature'],
    [\`\${A4}/features/<domain>/data\`]:  ['domain:<domain>', 'type:data'],
    [\`\${A4}/features/<domain>/state\`]: ['domain:<domain>', 'type:state'],
    [\`\${A4}/features/<domain>/ui\`]:    ['domain:<domain>', 'type:ui'],
    [\`\${A4}/shared/<type>\`]:           ['domain:shared', 'type:<type>'],
  },
  depRules: {
    root: ['type:feature', 'domain:shared', 'noTag'],
    noTag: ['noTag'],                     // A5 libs (path aliases)

    // domain gate
    'domain:*': [sameTag, 'domain:shared'],
    'domain:products': ['domain:cart'],   // planned direction only

    // layer gate
    'type:feature': ['type:feature', 'type:state', 'type:ui', 'type:data'],
    'type:state': ['type:state', 'type:data'],
    'type:ui': ['type:ui', 'type:data'],
    'type:data': ['type:data'],
  },
};`;

  protected readonly errors = [
    {
      code: '@softarc/sheriff/deep-import',
      meaning: 'Import pliku w środku modułu, z pominięciem index.ts.',
      fix: 'Importuj przez barrel; brakuje eksportu → dodaj go do index.ts (świadomie).',
    },
    {
      code: '@softarc/sheriff/dependency-rule: Tag X has no clearance for tags …',
      meaning: 'Tag X źródła nie ma reguły wpuszczającej żaden z tagów celu.',
      fix: 'Zmień kierunek zależności / przenieś kod. Poluzowanie reguły to decyzja architektoniczna.',
    },
    {
      code: "SH-002: No dependency rule for tag 'X' found",
      meaning: 'Moduł ma tag, dla którego nie ma żadnego klucza w depRules.',
      fix: 'Dodaj regułę dla tagu (u nas: noTag) albo wyłącz moduł z analizy.',
    },
    {
      code: 'SH-006: cannot find a placeholder for "<x>" in tag configuration',
      meaning: 'Tag używa <x>, którego nie ma w ścieżce modułu.',
      fix: 'Placeholder w tagu musi wystąpić w kluczu ścieżki.',
    },
  ];
}
