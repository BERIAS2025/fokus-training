# Handover: Fokus-Training Tablet-App (UI/UX)

Oct 30, 2026 · @Tobias Hess

## 1. Ziel und Nutzerin

Die App ist ein tägliches Fokus-Training für eine Schlaganfall-Patientin mit linksseitigem Neglect. Sie soll Blickführung nach links, Aufmerksamkeit und Arbeitsgedächtnis in kurzen, angenehmen Einheiten üben.

- **Nutzerin:** Conny, die Mutter des Auftraggebers, ein Jahr nach schwerer Hirnblutung. Linke Körperseite gelähmt, Neglect links. Visueller Fokus kostet sehr viel Energie, sie ermüdet schnell.
- **Stärke:** Sie kann eine Stunde sprechen und merkt sich alles. Das Gedächtnis im Gespräch ist gut, Anleitungen dürfen also kurz und einfach sein, müssen aber nicht kindlich wirken.
- **Rahmen:** Ärzte und Therapeuten trainieren sie fast täglich. Die App ergänzt nur das fehlende Fokus-Training. Sie ist kein Medizinprodukt und ersetzt keine Therapie.
- **Erfolg heißt:** Sie spielt gern und freiwillig, wird nicht frustriert oder überfordert, und Familie und Therapeuten sehen Fortschritt auf einen Blick.
- **Ton:** Würdevoll und ruhig. Eine erwachsene Frau, kein Kinderspiel, keine Infantilisierung.

## 2. Nutzungskontext

Zwei Personen nutzen die App mit unterschiedlichen Bedürfnissen. Die Oberfläche trennt beide klar.

|  | Conny (Spielerin) | Pflegerin (Einrichtung) |
| --- | --- | --- |
| Aufgabe | Spielen | Schwierigkeit einstellen, Ergebnisse ansehen |
| Sprache | Deutsch | Gebrochenes Deutsch, deshalb rein visuell verständlich |
| Bedienung | Nur rechte Hand, nur Tippen | Beide Hände, Tippen und Halten |
| Häufigkeit | 2 bis 3 Mal pro Tag, je 5 bis 10 Minuten | Einmal beim Start, danach selten |

- **Gerät:** Samsung Galaxy Tab A11+ (Android, 11 Zoll, 90 Hz, 6 GB RAM, 128 GB), Querformat, in einem Ständer auf dem Tisch. Die 90 Hz erlauben flüssige Bewegung, besonders im Spiel Blick folgen.
- **Ort:** Ihr Zuhause in Deutschland. Der Auftraggeber lebt in den USA und hilft per Fernzugriff nur bei Updates.
- **Netz:** Die App muss nach der Installation vollständig ohne Internet laufen. Alle Daten bleiben auf dem Tablet.
- **Hände:** Die linke Hand ist gelähmt. Keine Zwei-Finger-Gesten, kein Ziehen über weite Strecken, keine Tasten an der linken Bildschirmseite, die sie unbedingt treffen muss.
- **Pflege-Bereich:** Hinter einem Schutz, den die Mutter nicht aus Versehen öffnet (zum Beispiel 3 Sekunden Halten auf einem Zahnrad-Symbol).

## 3. Gestaltungsprinzipien

Jedes Design-Detail dient zwei Zielen: den Blick nach links ziehen und Energie sparen.

1. **Linker Anker:** Ein dauerhaft sichtbarer, kräftiger Balken am linken Bildschirmrand. Jede Aufgabe beginnt links. Der Anker ist einstellbar (Breite, an/aus).
2. **Inhalt links gewichten:** Wichtige Elemente und Startpunkte liegen links oder in der Mitte, nie nur rechts. Bedienelemente, die sie oft braucht, liegen mittig unten.
3. **Wenig auf einmal:** Pro Bildschirm eine Aufgabe, maximal 3 bis 4 große Auswahlflächen. Keine Menüs, keine Listen, keine kleinen Texte.
4. **Große Ziele:** Tippflächen mindestens 18 mm (etwa 120 dp), Abstand mindestens 8 mm. Fehltreffer kosten nichts.
5. **Ruhiger Hintergrund:** Eine einfarbige, helle oder dunkle Fläche ohne Muster, keine Animationen außerhalb der Aufgabe.
6. **Nie Zeitdruck als Strafe:** Zeit wird gemessen, aber nie als Verlust gezeigt. Der Timer ist optional und versteckt.
7. **Kein Scheitern:** Es gibt kein Game Over. Falsche Antworten werden freundlich ignoriert oder sanft erklärt.
8. **Vorhersagbar:** Jeder Bildschirm sieht beim zweiten Mal gleich aus. Keine Überraschungen, keine Pop-ups, keine Werbung.
9. **Energie schonen:** Kurze Einheiten, sichtbare Pausen, Müdigkeitsabfrage (siehe Abschnitt 8). Die App darf aktiv sagen: "Für heute genug."

## 4. Bildschirme und Navigation

Die App hat sieben Bildschirme. Der Weg ist flach: Start, Spiel, Ergebnis, zurück. Es gibt keine verschachtelten Menüs.

| # | Bildschirm | Inhalt | Wichtig |
| --- | --- | --- | --- |
| 1 | Start | Ein sehr großer "Los"-Knopf in der Mitte, darunter 6 Spiel-Symbole in einer Reihe. Oben links kleine Sonne/Mond für Helligkeit. | Knopf "Los" startet das Spiel, das als nächstes dran ist (Tagesplan). |
| 2 | Müdigkeit vorher | Drei große Gesichter (frisch, mittel, müde) zum Antippen. | Bei "müde" schlägt die App eine kürzere, leichtere Einheit vor. |
| 3 | Spiel | Spielfläche im Vollbild, linker Anker sichtbar. Oben rechts ein kleiner Pause-Knopf. | Keine Texte, nur Symbole. |
| 4 | Pause | Darüber das Wort "Pause", in der Mitte ein wachsender und schrumpfender Kreis mit dem Wort "Atmen". Dazu ein Knopf "Weiter", ein Knopf "Ende". | Ruhig, keine Zahlen. |
| 5 | Ergebnis | Bis zu 5 Sterne oder Blumen, ein Satz Lob als Symbol und Ton, "Nochmal" und "Fertig". | Kein Vergleich, keine Rangliste. |
| 6 | Müdigkeit nachher | Wieder drei Gesichter. | Daten fließen in den Verlauf für die Pflegerin. |
| 7 | Pflege-Bereich | Pro Spiel: Stufenwahl, letzte Stufe, Empfehlung, Einstellungen. Dazu der Verlauf für Therapeuten (Abschnitt 11). | Nur per langem Halten erreichbar. |

- **Navigation:** Es gibt nur zwei Wege: vorwärts (großer Knopf in der Mitte unten) und zurück zum Start (Haus-Symbol, immer an derselben Stelle, mittig unten). Kein Wischen, keine Seitenleisten.
- **Tagesplan:** Die Pflegerin wählt, welche Spiele heute dran sind und wie lange. Die Mutter muss nichts entscheiden.
- **Freie Wahl:** Auf dem Startbildschirm kann die Mutter auch selbst ein Spiel-Symbol antippen.

## 5. Die sechs Spiele

Jedes Spiel erzeugt bei jedem Start neue, zufällige Positionen. Nichts wiederholt sich identisch, damit sie nicht Muster auswendig lernt statt den Blick zu trainieren. Zufall folgt Regeln: Ziele links und rechts im Wechsel, nie zwei Runden mit gleicher Verteilung, links immer mindestens so oft wie rechts.

| Spiel | Trainiert | Ablauf | Wechselnde Elemente |
| --- | --- | --- | --- |
| 1. Sterne suchen | Visuelles Absuchen | Sterne erscheinen über die ganze Fläche, sie tippt jeden an. Start immer links. | Position, Anzahl, Reihenfolge, Größe |
| 2. Blick folgen | Augenfolgebewegung | Ein Ball wandert langsam von rechts nach links, sie folgt mit den Augen und tippt ihn am Ende links. | Höhe, Tempo, Richtung, Pfad |
| 3. Finden und zählen | Selektive Aufmerksamkeit | Zwischen ähnlichen Symbolen alle Ziele (zum Beispiel Sonnen) antippen. Zähler zeigt Treffer. | Zielsymbol, Ablenker, Dichte, Verteilung |
| 4. Paare finden | Arbeitsgedächtnis | Karten im ganzen Feld verteilt, gleiche Paare aufdecken. | Bilder, Kartenpositionen, Anzahl Paare |
| 5. Folge merken | Sequenzgedächtnis | Farbfelder leuchten mit Ton auf, sie wiederholt die Folge. | Länge, Farben, Anordnung der Felder |
| 6. Nur dieses | Daueraufmerksamkeit | Symbole erscheinen nacheinander, sie tippt nur auf das Zielsymbol. | Zielsymbol, Rhythmus, Position |

**Gemeinsam für alle Spiele**

- Rundenlänge 2 bis 3 Minuten, Gesamteinheit 5 bis 10 Minuten.
- Ziele links erscheinen größer und heller als rechts, wenn die Pflegerin die "Links-Hilfe" einschaltet. Die Hilfe sinkt mit steigender Stufe.
- Kein Spiel bestraft Fehler mit Verlust. Zu viele Fehler senken sanft das Tempo.
- Ton: kurzer, warmer Klang bei Treffer, kein Alarm bei Fehler.

## 6. Schwierigkeitssystem

Jedes Spiel hat 8 Stufen und wird einzeln eingestellt. Die Pflegerin kann jederzeit zu jeder Stufe springen, vor wie zurück. Die App erinnert sich immer an die zuletzt gewählte Stufe und sagt per Symbol, ob eine höhere Stufe sinnvoll wäre. Alles ohne Text, nur mit Symbolen und Farben. Nur die Verlaufsansicht für Therapeuten (Abschnitt 11) ist beschriftet.

**Pflege-Bereich pro Spiel (Darstellung)**

- Eine Reihe von 8 großen Punkten oder Treppenstufen, von links (leicht) nach rechts (schwer). Der aktuell gewählte Punkt ist gefüllt und groß.
- Ein **Fähnchen** markiert die zuletzt gespielte Stufe. Ein **Haken** markiert Stufen, die sicher geschafft wurden.
- Ein **grüner Pfeil nach oben** über der nächsten Stufe heißt: "Bereit für schwerer." Ein **gelber Haltepfeil** heißt: "Hier bleiben." Ein **blauer Pfeil nach unten** heißt: "Eine Stufe leichter wäre besser."
- Daneben ein kleiner Verlauf der letzten 7 Einheiten als Balken (Trefferquote), ohne Zahlen.
- Eine große Taste "Zurück zur letzten Stufe" stellt die gemerkte Stufe sofort wieder her.

**Empfehlungs-Regel (für Claude Code)**

| Beobachtung der letzten 3 Einheiten | Empfehlung | Symbol |
| --- | --- | --- |
| Trefferquote mindestens 85 Prozent und Müdigkeit nachher höchstens "mittel" | Schwerer | Grüner Pfeil hoch |
| Trefferquote 60 bis 84 Prozent | Stufe halten | Gelber Haltepfeil |
| Trefferquote unter 60 Prozent oder zweimal "müde" nachher | Leichter | Blauer Pfeil runter |

Die App empfiehlt nur. Sie ändert die Stufe nie von selbst, außer innerhalb einer Runde, wo sie das Tempo sanft anpasst.

**Was eine Stufe pro Spiel verändert**

| Spiel | Stufe 1 (leicht) | Stufe 8 (schwer) |
| --- | --- | --- |
| Sterne suchen | 4 große Sterne, überwiegend links, Hilfslinie | 20 kleine Sterne, gleich verteilt, keine Hilfe |
| Blick folgen | Langsam, große Kugel, gerader Pfad | Schneller, kleine Kugel, Kurven |
| Finden und zählen | 3 Ziele, 6 deutlich andere Ablenker | 15 Ziele, 40 ähnliche Ablenker |
| Paare finden | 3 Paare, große Karten | 10 Paare, Karten über das ganze Feld |
| Folge merken | 2 Felder merken | 7 Felder merken |
| Nur dieses | 1 Zielsymbol, langsamer Rhythmus | Ziel wechselt, schneller Rhythmus |

Die Zahlen sind Startwerte. Claude Code legt sie in einer einzigen Konfigurationsdatei ab, damit Therapeuten sie später anpassen können.

## 7. Visuelles System

Ruhig, kontrastreich, ohne Reizüberflutung. Alles Wichtige ist ein Symbol, nie nur ein Wort.

| Bereich | Vorgabe |
| --- | --- |
| Farben | Heller Modus ist Standard, weil Conny tagsüber übt. Dunkler Modus nur optional im Pflege-Bereich. Hintergrund einfarbig und ruhig, kein grelles Reinweiß. Maximal 4 Akzentfarben mit festen Bedeutungen: Blau (Start, Weiter), Grün (richtig, schwerer), Gelb (halten, Hinweis), Orange (Anker links). Kein Rot für Fehler. |
| Kontrast | Mindestens 7:1 für alle Symbole und Zielobjekte (WCAG AAA). Keine Information nur über Farbe, immer zusätzlich Form. |
| Schrift | Kaum Text. Wo nötig: serifenlose Schrift, mindestens 28 pt, fett, kurze Wörter. Zahlen sehr groß. |
| Symbole | Eine einheitliche Linien- und Flächen-Familie, eindeutig und ohne Kultur- oder Sprachbezug. Beschriftungen nur im Pflege-Bereich und dort immer zusammen mit dem Symbol. |
| Größen | Spielziele 15 bis 40 mm, Knöpfe mindestens 18 mm, Hauptknopf mindestens 30 mm. |
| Abstände | Großzügig. Nie zwei Tippflächen näher als 8 mm. |
| Animation | Nur in der Aufgabe. Weiche Bewegungen, keine Blitze, kein Flackern, keine schnellen Wechsel (Epilepsie-sicher). |
| Linker Anker | Orange Balken, 24 mm breit, am linken Rand, mit einer sanft pulsierenden Pfeilspitze, die nach innen zeigt. |

**Zu liefern:** Farbpalette mit Tokens, Typo-Skala, Symbol-Set (mindestens 30 Symbole), Knopf- und Zielkomponenten, beide Modi.

## 8. Feedback, Ton, Pausen und Müdigkeit

- **Treffer:** Kurzer warmer Klang plus sanftes Aufleuchten des Ziels. Kein Konfetti, keine Explosionen.
- **Fehler:** Kein Ton, kein Rot. Das Ziel bleibt einfach stehen. Bei drei Fehlern in Folge erscheint ein dezenter Hinweis (zum Beispiel ein pulsierendes Ziel links).
- **Ende einer Runde:** Eine bis fünf Blumen, nie null. Dazu ein ruhiger Dreiklang und ein kurzes Lob auf Italienisch, weil Conny die Sprache liebt (Bravo, Bravissima, Ottimo, Che bello), gesprochen und kurz als Schrift im Bild.
- **Lautstärke:** Klar sichtbarer Regler im Pflege-Bereich. Töne dürfen normal laut sein, Conny hört normal. Töne sind nie die einzige Information.
- **Pausen:** Nach 3 Minuten Spiel erscheint von selbst ein ruhiges Pausenbild. Darüber steht das Wort "Pause". In der Mitte wächst und schrumpft ein Kreis langsam, in dem das Wort "Atmen" steht, damit Conny die Bedeutung sofort versteht. Pause dauert mindestens 30 Sekunden, kann aber verlängert werden.
- **Müdigkeit:** Drei Gesichter vor und nach der Einheit. Wählt sie "müde", bietet die App eine kürzere Einheit oder "Für heute genug" an. Dieser Satz kommt als Symbol (Sonne geht unter) und Ton, nicht als Text.
- **Tageslimit:** Die Pflegerin legt die maximale Spielzeit pro Tag fest, Standard 30 Minuten. Danach zeigt die Startseite nur noch ein Ruhebild.
- **Sprachausgabe:** Sprache der App und kurze Ansagen auf Deutsch ("Los geht's", "Gut gemacht"), per Schalter abschaltbar.

## 9. Technik-Rahmen (für Claude Code)

Das Design muss in eine installierbare Web-App (PWA) passen. Das schränkt Claude Design ein, bitte beachten.

- **Plattform:** Android-Tablet, Chrome, Querformat festgelegt. Installation über "Zum Startbildschirm hinzufügen" auf einer Web-Adresse. Danach läuft die App wie eine normale App, auch ohne Internet und ohne den Rechner des Auftraggebers.
- **Hosting:** GitHub Pages. Updates erscheinen beim nächsten Start mit Internet automatisch.
- **Daten:** Alles lokal auf dem Tablet (IndexedDB). Keine Konten, kein Server, keine Übertragung. Persistenten Speicher anfordern, damit Android die Daten nicht löscht. Export als Datei (Verlauf) im Pflege-Bereich, damit Therapeuten oder der Auftraggeber ihn bekommen.
- **Bedienung:** Vollbild, Bildschirm bleibt an (Wake Lock), Touch nur Tippen. Keine Gesten, keine Hover-Zustände.
- **Layout:** Optimiert für den 11-Zoll-Bildschirm des Galaxy Tab A11+ (16:10), skalierbar bis 13 Zoll.
- **Töne:** Lokal eingebettet, nicht aus dem Netz laden.
- **Sicherheit:** Keine Analyse-Dienste, keine Werbung, keine Drittanbieter-Skripte.
- **Ausgabe von Claude Design:** Bildschirme als HTML/CSS mit Design-Tokens und Komponenten, damit Claude Code sie direkt weiterverwendet.

## 10. Aufgaben für Claude Design und Abnahme

**Bitte liefern**

1. Design-System: Farben (hell und dunkel), Typo-Skala, Abstände, Symbol-Set, Komponenten (großer Knopf, Spielkarte, Ziel, Anker, Stufenleiste, Müdigkeitsgesichter).
2. Alle 7 Bildschirme aus Abschnitt 4 im Querformat, im hellen Modus (Standard). Start und ein Spiel zusätzlich im dunklen Modus.
3. Pro Spiel ein Bildschirm mit der Spielfläche auf Stufe 1 und Stufe 8, damit Größen und Dichte sichtbar sind.
4. Der Pflege-Bereich mit Stufenleiste, Fähnchen, Pfeilen und Verlauf (Abschnitt 6) in allen drei Empfehlungs-Zuständen, dazu die Verlaufsansicht für Therapeuten (Abschnitt 11).
5. Eine kurze Beschreibung der Bewegungen (Anker, Pause, Treffer) für die Umsetzung.

**Abnahme-Checkliste (Test mit der Pflegerin, nicht mit Muttersprachlern)**

- [ ] Die Pflegerin erkennt ohne Erklärung, wo sie die Stufe ändert und was die Pfeile bedeuten.
- [ ] Die Mutter findet den Start-Knopf und den Weg zurück, ohne zu suchen.
- [ ] Kein Bedienelement liegt nur am rechten oder nur am linken Rand.
- [ ] Kein Text ist nötig, um ein Spiel zu starten oder zu beenden.
- [ ] Alle Spiele sehen bei jedem Start anders aus (Positionen).
- [ ] Kein Flackern, kein Rot, kein Zeitdruck sichtbar.
- [ ] Pause und Müdigkeitsabfrage sind ruhig und klar.

**Geklärt mit dem Auftraggeber**

- Gerät: Samsung Galaxy Tab A11+, 11 Zoll, 90 Hz, 6 GB RAM, 128 GB.
- Sprache: Deutsch. Lob auf Italienisch, weil Conny die Sprache liebt.
- Verlaufsansicht für Therapeuten: Ja, mit voller Auswertung (Abschnitt 11).
- Modus: Heller Modus als Standard, Conny übt tagsüber.
- Töne: Normal laut, Conny hört normal.
- Pause: Wort "Pause" über dem Bild, Wort "Atmen" im wachsenden und schrumpfenden Kreis.

## 11. Verlaufsansicht für Therapeuten

Therapeuten sehen im Pflege-Bereich unter "Verlauf" die volle Auswertung. Diese Ansicht ist die einzige, die Text und Zahlen auf Deutsch zeigt. Sie ist nur für Erwachsene mit Fachwissen gedacht, nicht für Conny.

**Erfasste Daten pro Einheit** (lokal gespeichert, nur auf dem Tablet)

| Kennzahl | Zweck |
| --- | --- |
| Datum, Uhrzeit, Spiel, Stufe, Dauer | Grundlage jeder Auswertung |
| Trefferquote gesamt | Allgemeine Leistung |
| Trefferquote links, Mitte, rechts (Bildschirmdrittel) | Zeigt die Neglect-Asymmetrie |
| Verpasste Ziele links und rechts | Auslassungen, wichtigster Neglect-Wert |
| Reaktionszeit links, Mitte, rechts | Zeigt Verzögerung auf der linken Seite |
| Fehltreffer und Wiederholungen | Impulsivität, Ablenkbarkeit |
| Müdigkeit vorher und nachher (3 Stufen) | Belastbarkeit |
| Pausen und Abbrüche | Ausdauer |
| Linkshilfe an oder aus, Ankerbreite | Einordnung der Ergebnisse |

**Ansichten**

1. **Tagesübersicht:** Alle Einheiten des Tages mit Spiel, Stufe, Dauer, Trefferquote und Müdigkeit.
2. **Verlauf je Spiel:** Liniendiagramm der Trefferquote und Reaktionszeit über 7 Tage, 30 Tage oder gesamt, mit markierten Stufenwechseln.
3. **Links gegen rechts:** Zwei Linien (Treffer links, Treffer rechts) über die Zeit. Der Abstand zwischen beiden Linien ist die zentrale Kennzahl.
4. **Bildschirm-Heatmap:** Wo wurde richtig getippt, wo wurde verpasst, über einen wählbaren Zeitraum.
5. **Müdigkeitskurve:** Müdigkeit vorher und nachher je Tag, mit Spielzeit.
6. **Stufen und Empfehlungen:** Welche Stufe wann gespielt wurde und welche Empfehlung die App gegeben hat.

**Export und Weitergabe**

- **PDF-Bericht** für Therapeuten mit allen Ansichten für einen frei wählbaren Zeitraum.
- **CSV-Rohdaten** für eigene Auswertung.
- Die App speichert die Datei auf dem Tablet. Die Pflegerin kann sie von dort per E-Mail oder Messenger senden oder ausdrucken. Direktes Versenden aus der App ist nicht nötig.
- Gesundheitsdaten verlassen das Tablet nur durch bewussten Export. Keine automatische Übertragung, kein Konto.

**Hinweis in der Ansicht:** Die Werte sind Trainingsdaten zur Beobachtung, keine Diagnose. Die Bewertung liegt bei den Therapeuten.
