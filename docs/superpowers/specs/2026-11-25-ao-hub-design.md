# ao-hub: documento di progetto

Data: 2026-11-25. Stato: approvato il 2026-11-25.

Le voci marcate **(proposta)** sono scelte di Claude, non ancora confermate.

## Intento

Un unico indirizzo con cui mostrare tutto il lavoro di Alberto Orsini: blog, curriculum e galleria fotografica. Chi arriva sceglie cosa vedere. È la prima cosa che si vede, quindi deve colpire: animata e giocosa.

Riferimento per il carattere: la home di https://www.theboringblog.ai. Il personaggio, le illustrazioni e il codice sono nostri.

## Obiettivi

- Una home di una sola schermata con un prato animato che reagisce al cursore.
- La scena gira e mostra tre momenti, uno per sito.
- Bottoni sempre visibili in alto, per chi non capisce come entrare dalla scena.
- Far convivere i tre siti, che hanno stili diversi, sotto un'identità propria dell'hub.

## Non obiettivi (proposta)

- Modificare l'aspetto di blog, curriculum o galleria.
- Altre pagine o contenuti oltre alla home e a una pagina 404.
- Passaggio giorno/notte e titolo che si scrive e si corregge, presenti nel riferimento.
- Tracciamento, statistiche e quindi banner cookie. Contatti e link social.

## Sarebbe un fallimento se

- Il prato fosse di qualità visibilmente inferiore alla prova approvata.
- Il movimento andasse a scatti.
- Qualcuno non capisse come entrare in uno dei tre siti.
- Le figure sembrassero adesivi incollati sopra il prato.
- La pagina sembrasse una copia del sito di riferimento.

## Lingue

Deciso: **italiano e inglese**.

- Italiano su `/`, inglese su `/en/`, come il curriculum **(proposta)**.
- Selettore IT / EN sempre visibile in alto. La lingua cambia solo su scelta di chi visita, senza reindirizzamento automatico **(proposta)**.
- Si traducono tutti i testi: scritte, bottoni, testi alternativi, nomi per i lettori di schermo, titolo, descrizione, pagina 404. Le versioni si dichiarano tra loro ai motori di ricerca (`hreflang`) **(proposta)**.
- I link seguono la lingua scelta **(proposta)**: curriculum `/` o `/en/`; blog `/it/` o `/en/`. La galleria è solo in italiano: stesso link in entrambe.
- La pagina 404 è una sola e contiene entrambe le lingue **(proposta)**.

## La scena

| Momento | Figura | Porta |
|---|---|---|
| 1 | in ginocchio con la fotocamera | galleria: https://gallery.albertorsini.it |
| 2 | seduto con il portatile e la tazza | curriculum: https://curriculum.albertorsini.it |
| 3 | appoggiato a una roccia, scrive il diario, con lo zaino | blog |

L'ordine dei momenti è una proposta.

```
┌──────────────────────────────────┐
│          Alberto Orsini          │
│  [Blog] [Curriculum] [Galleria]  │
│                                  │
│       ←      (figura)      →     │
│         Entra in galleria        │
│  ~~~~~~~~~~~~ prato ~~~~~~~~~~~~ │
│            ○ ● ○                 │
└──────────────────────────────────┘
```

Comportamento:

- Si gira trascinando, oppure con la rotella del mouse o il trackpad (richiesta di Alberto dopo la prima prova): un gesto, una scena; giù = avanti, su = indietro. Sotto il prato (richiesta di Alberto, sul modello del riferimento): una linea continua con un cursore che si può trascinare, la scritta «Trascina per girare» e due frecce; sostituiscono frecce laterali e pallini.
- Lo sfondo sfuma da un azzurro molto chiaro in alto al colore carta (richiesta di Alberto).
- La rotazione si ferma sempre su uno dei tre momenti **(proposta)**.
- Il prato ruota e il disegno cambia in dissolvenza, con un lieve scorrimento: la figura non sparisce mai del tutto (richiesta di Alberto dopo la prima prova; prima sprofondava nell'erba). Non è un giro intorno alla persona: sono tre immagini diverse.
- Si entra con i bottoni in alto o cliccando la figura. La scritta sotto il prato è stata tolta su richiesta di Alberto dopo la prima prova (nello schema qui sopra non va considerata). Un trascinamento non deve contare come clic **(proposta)**.
- In alto si vede **solo il bottone del momento mostrato** (richiesta di Alberto dopo la prima prova). Senza grafica 3D o JavaScript si vedono tutti e tre.
- I link si aprono nella stessa scheda **(proposta)**.
- Sotto il nome può stare una riga che dice chi è; il testo è da scrivere **(proposta)**.

## Il prato

Base approvata: la prova in `~/dev/ao-hub-spike` (`index.html`, `grass.js`), con **90.000 fili** su computer. Per l'approvazione: effetto "perfetto" come mockup, dettagli da sistemare in realizzazione.

Contiene: fili a ciuffi disegnati con istanze, bordo irregolare, chiazze di colore presi dal terreno, steli alti, fiori, vento a raffiche, scia dietro il cursore, camera ortografica che ruota.

Il codice della prova è usa e getta. Chi realizza può rileggerlo e riscriverne le parti che servono.

Da correggere:

1. **Scatti al passaggio del mouse.** Causa probabile, non ancora confermata: la scia si aggiorna a passi (almeno ogni 60 ms), un punto nuovo spinge subito a piena forza e il più vecchio sparisce di colpo. Rimedio da provare: far crescere e calare la spinta gradualmente.
2. **Prato troppo grande.** Ridurlo, lasciando spazio a titolo, bottoni e scritta.

## Le figure

File approvati, per ora in `~/Downloads` (da copiare nel progetto):

| File | Figura |
|---|---|
| `immagine_1.png` | fotocamera (1254×1254) |
| `immagine_2.png` | diario, versione corretta |
| `immagine_3.png` | portatile (1254×1254) |

Sono PNG con trasparenza, create con Gemini da foto personali e da un disegno usato come riferimento di stile. Le foto personali e il disegno di riferimento non entrano nel repository. Prima della pubblicazione, controllare che le figure non riprendano il personaggio o i dettagli del disegno di un altro autore.

Lavoro necessario:

- Inserirle **dentro** la scena, con erba davanti e dietro.
- Aggiungere un'ombra a terra.
- Pulire i puntini gialli, rossi e verdi visti sui contorni.
- Uniformare la scala, per esempio sulla grandezza della testa. La roccia rende la terza figura molto più larga.
- Formati leggeri; le figure non ancora visibili si caricano dopo la prima.
- Toppa del cappello. Deciso: **sole montagne, senza scritta**, come in `immagine_3.png`. Da rifare `immagine_1.png` e `immagine_2.png`, che hanno la scritta di un marchio altrui. Non blocca la costruzione: i file si sostituiscono, ma vanno sostituiti prima della pubblicazione.

## Vincoli

- Sito statico pubblicato su GitHub Pages: HTML, CSS, JavaScript e WebGL2, senza librerie.
- Titolo, bottoni e link sono HTML normale: funzionano anche se WebGL2 non parte o JavaScript è disattivato. Senza WebGL2 si vede un'immagine ferma della scena **(proposta)**.
- Computer e telefono. Su telefono un numero di fili ridotto: la prova parte da 40.000, valore non ancora provato su un telefono vero **(proposta)**.
- Chi ha attivato "riduci movimento" vede prato fermo e cambio di scena immediato **(proposta)**.
- Uso da tastiera: bottoni, frecce e pallini raggiungibili e con nomi leggibili dai lettori di schermo **(proposta)**.
- Font ospitati nel sito, nessuna risorsa esterna **(proposta)**.
- La scena si ferma quando la scheda non è visibile **(proposta)**.
- **Licenze:** il codice di https://github.com/sangloo/stylized-grass non ha una licenza (così dice il suo README). Non va copiato. La prova è stata scritta dal resoconto dell'articolo, senza aprire quel codice. Non si usano immagini né testi del sito di riferimento.

## Pubblicazione e spostamento del blog

Lo spostamento del blog è **un lavoro separato**. Deciso: il blog va su un sottodominio.

Ordine **(proposta)**:

1. Costruire l'hub e pubblicarlo su un indirizzo di prova. In questa fase il bottone Blog punta a https://albertorsini.it, in un solo punto facile da cambiare.
2. Spostare il blog (ipotesi: `blog.albertorsini.it`, che oggi non risponde).
3. Mettere l'hub su `albertorsini.it` e aggiornare il link del blog.

Da affrontare nel lavoro sul blog:

- Oggi `albertorsini.it` serve `ao-blog` (Next.js con export statico, GitHub Pages, Cloudflare davanti). `siteUrl` in `src/i18n/messages/it.json` e `en.json` punta al dominio principale.
- I vecchi indirizzi del blog, compresi quelli sotto `/it/` e `/en/`, vanno reindirizzati al sottodominio. L'unica eccezione è `/en/` esatto, che diventa la home inglese dell'hub: la regola di reindirizzamento deve escludere solo quello e includere le pagine sotto (per esempio `/en/viaggi/`).
- Il blog ha già una sezione `galleria`; esiste anche `ao-gallery`. I contenuti non sono stati confrontati.

## Approcci considerati

| Approccio | Pro | Contro |
|---|---|---|
| **1. Senza librerie, WebGL2 (scelto)** | stessa base della prova approvata, leggero, nessuna dipendenza, come curriculum e galleria | figure, erba davanti, ombre e camera scritte a mano; modifiche future più impegnative |
| 2. Three.js | camera e gestione 3D in parte pronte, comodo per aggiungere oggetti; usata dal riferimento | prato da adattare, pagina più pesante, una dipendenza |
| 3. Next.js, come il blog (scartato) | stessa tecnologia del blog | complessità inutile per una sola pagina, non aiuta la scena |

Scelto l'1 da Alberto: la scena è circoscritta (un prato, tre figure, una rotazione) e Three.js non risolve da solo le parti difficili.

## Lasciato a chi realizza

- Struttura dei file, build, controlli e anteprima.
- Tecnica per comporre figure ed erba, e animazione della transizione.
- Dimensione del prato, tipografia, colori di testi e bottoni, impaginazione su telefono.
- Titolo della pagina, descrizione, anteprima per la condivisione, favicon.

## Come si capisce che è finito

- Alberto approva a vista scena, transizione e figure, su computer e telefono vero.
- Nessuno scatto percepibile muovendo il cursore.
- I tre siti si raggiungono con i bottoni, con la scena e da tastiera.
- Italiano e inglese sono completi e il selettore porta alla pagina corrispondente.
- Con WebGL2 disattivato i link funzionano.

## Mockup di Monica

Non ancora deciso. Prato, struttura e figure sono già definiti; un mockup potrebbe servire per titolo, bottoni, scritte e impaginazione, soprattutto su telefono.
